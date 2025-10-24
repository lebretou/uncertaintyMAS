import { nanoid } from 'nanoid';
import { callLLM } from './llmService';
import { useTraceStore } from './traceStore';
import { useUncertaintyStore } from './uncertaintyStore';
import { useNodeStatusStore } from './nodeStatusStore';
import { getPipelineById, getAgentFromPipeline } from '@config/pipelines';
import { ExecutionResult, RunConfiguration, AgentDefinition } from '@/types/pipeline';
import { saveCSVData, StoredDataFile } from './dataStorage';
import { executePython, parseExecutionOutput } from './pythonExecutor';

export interface ExecutionProgress {
  phase: string; // e.g., "Running Ingest agents", "Running downstream agents"
  totalAgentCalls: number;
  completedAgentCalls: number;
  percentComplete: number;
}

export type ProgressCallback = (progress: ExecutionProgress) => void;

/**
 * Execute a single agent
 */
async function executeAgent(
  agent: AgentDefinition,
  input: unknown,
  traceId: string,
  executionNumber: number,
  progressCallback?: ProgressCallback
): Promise<ExecutionResult> {
  if (!agent) {
    throw new Error(`Agent not provided`);
  }

  const executionId = nanoid();
  const timestamp = new Date().toISOString();

  // Create initial execution result
  const executionResult: ExecutionResult = {
    executionId,
    traceId,
    nodeId: agent.id,
    nodeName: agent.name,
    model: agent.model,
    temperature: agent.temperature,
    systemPrompt: agent.systemPrompt,
    input,
    output: null,
    executionTime: 0,
    timestamp,
  };

  // Add to trace store
  useTraceStore.getState().addExecution(traceId, executionResult);

  // Set node status to loading
  useNodeStatusStore.getState().setNodeStatus(agent.id, 'loading');

  try {
    // Prepare user message based on input
    let userMessage: string;

    // Check if this is a root agent (receives the initial input object with file path)
    if (typeof input === 'object' && input !== null && 'dataFilePath' in input && 'userPrompt' in input) {
      // Root agent receives structured initial input with file path
      const { dataFilePath, userPrompt, csvFileName } = input as {
        dataFilePath: string;
        userPrompt: string;
        csvFileName?: string;
      };

      userMessage = `User's analysis task: ${userPrompt}\n\n`;
      if (csvFileName) {
        userMessage += `Original CSV file: ${csvFileName}\n\n`;
      }
      userMessage += `Data file path: ${dataFilePath}\n\n`;
      userMessage += `Please generate Python code to analyze the data at this file path. Replace 'DATA_FILE_PATH' in your code with: ${dataFilePath}`;
    } else {
      // Downstream agents receive output from upstream agents
      userMessage = `Based on the following input from the previous agent:\n\n${JSON.stringify(input, null, 2)}\n\nPlease perform your analysis.`;
    }

    // Call LLM
    const startTime = Date.now();
    const response = await callLLM({
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      userMessage,
      temperature: agent.temperature,
    });

    // Parse LLM response
    let llmOutput: any;
    try {
      llmOutput = JSON.parse(response.content);
    } catch (e) {
      // If not JSON, check if it contains Python code in markdown format
      const pythonCodeMatch = response.content.match(/```python\n([\s\S]*?)```/);
      if (pythonCodeMatch) {
        // Extract Python code from markdown
        llmOutput = {
          pythonCode: pythonCodeMatch[1],
          rawOutput: response.content
        };
      } else {
        // If not JSON and no Python code, treat as plain text
        llmOutput = { rawOutput: response.content };
      }
    }

    // Check if the LLM generated Python code that needs execution
    let finalOutput = llmOutput;
    if (llmOutput.pythonCode && typeof llmOutput.pythonCode === 'string') {
      console.log(`Agent ${agent.id} generated Python code, executing...`);

      // Extract file path - could be from initial input or from upstream agent's dataRef
      let filePathToUse: string | undefined;
      if (typeof input === 'object' && input !== null) {
        if ('dataFilePath' in input) {
          // Root agent - has original file path
          filePathToUse = (input as any).dataFilePath;
        } else if ('dataRef' in input) {
          // Downstream agent - has dataRef from previous agent
          filePathToUse = (input as any).dataRef;
        } else if ('contextPacket' in input && 'dataRef' in (input as any).contextPacket) {
          // Has context packet with dataRef
          filePathToUse = (input as any).contextPacket.dataRef;
        }
      }

      // Execute the Python code
      const pythonResult = await executePython(llmOutput.pythonCode, filePathToUse);

      if (pythonResult.success && pythonResult.output) {
        // Parse execution output
        const executedData = parseExecutionOutput(pythonResult.output);

        // Combine LLM output with execution results
        finalOutput = {
          ...llmOutput,
          executionResult: executedData,
          pythonExecutionTime: pythonResult.executionTime,
          // Use the actual execution results as the output for downstream agents
          ...executedData,
        };

        console.log(`Python execution successful for agent ${agent.id}`);
      } else {
        // Execution failed, include error
        finalOutput = {
          ...llmOutput,
          executionError: pythonResult.error,
          pythonExecutionTime: pythonResult.executionTime,
        };

        console.error(`Python execution failed for agent ${agent.id}:`, pythonResult.error);
      }
    }

    // Update execution result
    const updatedResult: Partial<ExecutionResult> = {
      output: finalOutput,
      executionTime: response.executionTime,
      tokenUsage: response.tokenUsage,
    };

    useTraceStore.getState().updateExecution(traceId, executionId, updatedResult);

    // Set node status to success
    useNodeStatusStore.getState().setNodeStatus(agent.id, 'success');

    return {
      ...executionResult,
      ...updatedResult,
    };
  } catch (error) {
    // Handle error
    const errorResult: Partial<ExecutionResult> = {
      executionTime: Date.now() - new Date(timestamp).getTime(),
      error: {
        code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
    };

    useTraceStore.getState().updateExecution(traceId, executionId, errorResult);

    // Set node status to error
    useNodeStatusStore.getState().setNodeStatus(agent.id, 'error');

    throw error;
  }
}

/**
 * Execute agents recursively following the pipeline DAG structure
 */
async function executeAgentRecursive(
  agent: AgentDefinition,
  allAgents: AgentDefinition[],
  input: unknown,
  traceId: string,
  run: number,
  executedResults: Map<string, ExecutionResult>,
  onAgentComplete?: () => void
): Promise<void> {
  // Execute current agent
  const result = await executeAgent(agent, input, traceId, run);
  executedResults.set(agent.id, result);
  onAgentComplete?.();

  // If this agent has downstream nodes, execute them
  if (agent.downstreamNodeIds && agent.downstreamNodeIds.length > 0) {
    const downstreamAgents = agent.downstreamNodeIds
      .map(id => allAgents.find(a => a.id === id))
      .filter((a): a is AgentDefinition => a !== undefined);

    // Execute all downstream agents in parallel
    await Promise.all(
      downstreamAgents.map(downstreamAgent =>
        executeAgentRecursive(
          downstreamAgent,
          allAgents,
          result.output, // Pass current agent's output as input
          traceId,
          run,
          executedResults,
          onAgentComplete
        )
      )
    );
  }
}

/**
 * Execute a single run of the pipeline
 */
async function executeSingleRun(
  run: number,
  runCount: number,
  traceId: string,
  pipeline: AgentDefinition[],
  initialInput: unknown,
  onAgentComplete?: () => void
): Promise<void> {
  console.log(`Starting independent run ${run}/${runCount}`);

  // Find root agents (agents with no upstream dependencies)
  const rootAgents = pipeline.filter(agent =>
    !pipeline.some(other => other.downstreamNodeIds.includes(agent.id))
  );

  const executedResults = new Map<string, ExecutionResult>();

  // Execute all root agents in parallel
  await Promise.all(
    rootAgents.map(rootAgent =>
      executeAgentRecursive(
        rootAgent,
        pipeline,
        initialInput,
        traceId,
        run,
        executedResults,
        onAgentComplete
      ).catch(error => {
        console.error(`Error in agent ${rootAgent.id} (run ${run}):`, error);
        onAgentComplete?.();
      })
    )
  );
}

/**
 * Execute the pipeline in independent mode (run entire pipeline N times in parallel)
 */
async function executeIndependentMode(
  runCount: number,
  traceId: string,
  pipeline: AgentDefinition[],
  initialInput: unknown,
  progressCallback?: ProgressCallback
): Promise<void> {
  // Total agent calls: N * (number of agents)
  const totalAgentCalls = runCount * pipeline.length;
  let completedAgentCalls = 0;

  const updateProgress = () => {
    completedAgentCalls++;
    if (progressCallback) {
      progressCallback({
        phase: 'Executing pipeline runs in parallel',
        totalAgentCalls,
        completedAgentCalls,
        percentComplete: Math.round((completedAgentCalls / totalAgentCalls) * 100),
      });
    }
  };

  // Execute all runs in parallel
  const runPromises = [];
  for (let run = 1; run <= runCount; run++) {
    runPromises.push(executeSingleRun(run, runCount, traceId, pipeline, initialInput, updateProgress));
  }

  await Promise.all(runPromises);
}

/**
 * Execute the pipeline in propagation mode (each downstream node receives all N inputs)
 * All executions at the same level run in parallel for maximum speed
 */
async function executePropagationMode(
  runCount: number,
  traceId: string,
  pipeline: AgentDefinition[],
  initialInput: unknown,
  progressCallback?: ProgressCallback
): Promise<void> {
  console.log(`Starting propagation mode with ${runCount} runs`);

  // Total agent calls: N * (number of agents)
  const totalAgentCalls = runCount * pipeline.length;
  let completedAgentCalls = 0;

  const updateProgress = (phase: string) => {
    completedAgentCalls++;
    if (progressCallback) {
      progressCallback({
        phase,
        totalAgentCalls,
        completedAgentCalls,
        percentComplete: Math.round((completedAgentCalls / totalAgentCalls) * 100),
      });
    }
  };

  // Find root agents (agents with no upstream dependencies)
  const rootAgents = pipeline.filter(agent =>
    !pipeline.some(other => other.downstreamNodeIds.includes(agent.id))
  );

  // Execute root agents N times in parallel
  const rootResults = new Map<string, ExecutionResult[]>();

  for (const rootAgent of rootAgents) {
    const promises = [];
    for (let i = 0; i < runCount; i++) {
      promises.push(
        executeAgent(rootAgent, initialInput, traceId, i + 1).then((result) => {
          updateProgress(`Running ${rootAgent.name} agents`);
          return result;
        })
      );
    }
    rootResults.set(rootAgent.id, await Promise.all(promises));
  }

  // Build a map of agent results by agent ID
  const allResults = new Map<string, ExecutionResult[]>(rootResults);

  // Process agents level by level (BFS approach)
  const processedAgents = new Set<string>(rootAgents.map(a => a.id));
  let hasMoreAgents = true;

  while (hasMoreAgents) {
    hasMoreAgents = false;

    // Find agents whose upstream dependencies are all processed
    const nextAgents = pipeline.filter(agent =>
      !processedAgents.has(agent.id) &&
      pipeline.some(other =>
        other.downstreamNodeIds.includes(agent.id) &&
        processedAgents.has(other.id)
      )
    );

    if (nextAgents.length === 0) break;
    hasMoreAgents = true;

    // Execute next level agents
    for (const agent of nextAgents) {
      // Find upstream agents
      const upstreamAgents = pipeline.filter(other =>
        other.downstreamNodeIds.includes(agent.id)
      );

      // Execute this agent N times with outputs from upstream agents
      const promises = [];
      for (let i = 0; i < runCount; i++) {
        // Get input from the first upstream agent for this run
        const upstreamResult = allResults.get(upstreamAgents[0].id)?.[i];
        const input = upstreamResult?.output || initialInput;

        promises.push(
          executeAgent(agent, input, traceId, i + 1).then((result) => {
            updateProgress(`Running ${agent.name} agents`);
            return result;
          })
        );
      }

      allResults.set(agent.id, await Promise.all(promises));
      processedAgents.add(agent.id);
    }
  }
}

/**
 * Main entry point: Execute the pipeline with the given configuration
 */
export async function executePipeline(
  config: RunConfiguration,
  progressCallback?: ProgressCallback
): Promise<string> {
  const { createTrace, updateTraceStatus, completeTrace } = useTraceStore.getState();
  const uncertaintyConfig = useUncertaintyStore.getState().config;

  // Get the pipeline configuration
  const pipelineConfig = getPipelineById(config.pipelineId);
  if (!pipelineConfig) {
    throw new Error(`Pipeline not found: ${config.pipelineId}`);
  }

  console.log(`Executing pipeline: ${pipelineConfig.name}`, {
    runCount: config.runCount,
    propagationMode: config.propagationMode,
    csvData: config.csvData ? `${config.csvData.length} chars` : 'none',
    userPrompt: config.userPrompt,
  });

  // Reset all node statuses
  useNodeStatusStore.getState().resetAllStatuses();

  // Create a new trace
  const traceId = createTrace(config.runCount, config.propagationMode, uncertaintyConfig);

  // Track wall-clock time for the entire execution
  const startTime = Date.now();

  // Save CSV data to storage and get file path
  const storedFile = saveCSVData(config.csvData, config.csvFileName);

  // Prepare initial input for root agents with file path instead of CSV content
  const initialInput = {
    dataFilePath: storedFile.filePath,
    userPrompt: config.userPrompt,
    csvFileName: storedFile.fileName,
  };

  try {
    // Update status to running
    updateTraceStatus(traceId, 'running');

    // Execute based on mode
    if (config.propagationMode) {
      await executePropagationMode(
        config.runCount,
        traceId,
        pipelineConfig.agents,
        initialInput,
        progressCallback
      );
    } else {
      await executeIndependentMode(
        config.runCount,
        traceId,
        pipelineConfig.agents,
        initialInput,
        progressCallback
      );
    }

    // Calculate actual wall-clock execution time
    const wallClockTime = Date.now() - startTime;

    // Complete the trace with wall-clock time
    completeTrace(traceId, wallClockTime);

    console.log('Pipeline execution completed successfully');
    return traceId;
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    updateTraceStatus(traceId, 'failed');
    throw error;
  }
}
