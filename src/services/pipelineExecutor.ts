import { nanoid } from 'nanoid';
import { callLLM } from './llmService';
import { useTraceStore } from './traceStore';
import { useUncertaintyStore } from './uncertaintyStore';
import { useNodeStatusStore } from './nodeStatusStore';
import { AGENT_DEFINITIONS, getAgentById } from '@config/agentDefinitions';
import { ExecutionResult, RunConfiguration } from '@/types/pipeline';

// Sample CSV data for testing
const SAMPLE_CSV_DATA = `name,age,city,salary
John Doe,28,New York,75000
Jane Smith,34,San Francisco,95000
Bob Johnson,45,Chicago,82000
Alice Williams,29,Boston,68000
Charlie Brown,52,Seattle,105000`;

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
  agentId: string,
  input: unknown,
  traceId: string,
  executionNumber: number,
  progressCallback?: ProgressCallback
): Promise<ExecutionResult> {
  const agent = getAgentById(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
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

    if (agent.id === 'ingest') {
      // First agent receives CSV data
      userMessage = `Please analyze the following CSV data:\n\n${input}`;
    } else {
      // Downstream agents receive output from upstream agents
      userMessage = `Based on the following input:\n\n${JSON.stringify(input, null, 2)}\n\nPlease perform your analysis.`;
    }

    // Call LLM
    const startTime = Date.now();
    const response = await callLLM({
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      userMessage,
      temperature: agent.temperature,
    });

    // Update execution result
    const updatedResult: Partial<ExecutionResult> = {
      output: response.content,
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
 * Execute a single run of the pipeline
 */
async function executeSingleRun(
  run: number,
  runCount: number,
  traceId: string,
  onAgentComplete?: () => void
): Promise<void> {
  console.log(`Starting independent run ${run}/${runCount}`);

  // Execute Ingest once per run (it branches to both routes)
  let ingestResult: ExecutionResult;
  try {
    ingestResult = await executeAgent('ingest', SAMPLE_CSV_DATA, traceId, run);
    onAgentComplete?.();
  } catch (error) {
    console.error(`Error in Ingest (run ${run}):`, error);
    onAgentComplete?.();
    return; // Skip this run if ingest fails
  }

  // Execute both routes in parallel after ingest completes
  await Promise.all([
    // Route 1: Schema Mapper
    (async () => {
      try {
        await executeAgent('schema-mapper', ingestResult.output, traceId, run);
        onAgentComplete?.();
      } catch (error) {
        console.error(`Error in Schema Mapper (run ${run}):`, error);
        onAgentComplete?.();
      }
    })(),

    // Route 2: Cleaning → Analytics → Visualization
    (async () => {
      try {
        const cleaningResult = await executeAgent('cleaning', ingestResult.output, traceId, run);
        onAgentComplete?.();

        const analyticsResult = await executeAgent('analytics', cleaningResult.output, traceId, run);
        onAgentComplete?.();

        await executeAgent('visualization', analyticsResult.output, traceId, run);
        onAgentComplete?.();
      } catch (error) {
        console.error(`Error in Route 2 (run ${run}):`, error);
        onAgentComplete?.();
      }
    })(),
  ]);
}

/**
 * Execute the pipeline in independent mode (run entire pipeline N times in parallel)
 */
async function executeIndependentMode(
  runCount: number,
  traceId: string,
  progressCallback?: ProgressCallback
): Promise<void> {
  // Total agent calls: N * 5 (ingest, schema-mapper, cleaning, analytics, visualization per run)
  const totalAgentCalls = runCount * 5;
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
    runPromises.push(executeSingleRun(run, runCount, traceId, updateProgress));
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
  progressCallback?: ProgressCallback
): Promise<void> {
  console.log(`Starting propagation mode with ${runCount} runs`);

  // Total agent calls: N + 2N + N + N = 5N
  const totalAgentCalls = runCount * 5;
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

  // Execute ingest N times in parallel
  const ingestPromises = [];
  for (let i = 0; i < runCount; i++) {
    ingestPromises.push(
      executeAgent('ingest', SAMPLE_CSV_DATA, traceId, i + 1).then((result) => {
        updateProgress('Running Ingest agents');
        return result;
      })
    );
  }
  const ingestResults = await Promise.all(ingestPromises);

  // Execute schema mapper and cleaning in parallel for all ingest results
  const schemaMapperPromises = [];
  const cleaningPromises = [];

  for (let i = 0; i < ingestResults.length; i++) {
    schemaMapperPromises.push(
      executeAgent('schema-mapper', ingestResults[i].output, traceId, i + 1).then((result) => {
        updateProgress('Running Schema Mapper agents');
        return result;
      })
    );

    cleaningPromises.push(
      executeAgent('cleaning', ingestResults[i].output, traceId, i + 1).then((result) => {
        updateProgress('Running Cleaning agents');
        return result;
      })
    );
  }

  // Wait for both schema-mapper and cleaning to complete in parallel
  const [, cleaningResults] = await Promise.all([
    Promise.all(schemaMapperPromises),
    Promise.all(cleaningPromises),
  ]);

  // Execute analytics for each cleaning result in parallel
  const analyticsPromises = [];
  for (let i = 0; i < cleaningResults.length; i++) {
    analyticsPromises.push(
      executeAgent('analytics', cleaningResults[i].output, traceId, i + 1).then((result) => {
        updateProgress('Running Analytics agents');
        return result;
      })
    );
  }
  const analyticsResults = await Promise.all(analyticsPromises);

  // Execute visualization for each analytics result in parallel
  const visualizationPromises = [];
  for (let i = 0; i < analyticsResults.length; i++) {
    visualizationPromises.push(
      executeAgent('visualization', analyticsResults[i].output, traceId, i + 1).then((result) => {
        updateProgress('Running Visualization agents');
        return result;
      })
    );
  }
  await Promise.all(visualizationPromises);
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

  // Reset all node statuses
  useNodeStatusStore.getState().resetAllStatuses();

  // Create a new trace
  const traceId = createTrace(config.runCount, config.propagationMode, uncertaintyConfig);

  // Track wall-clock time for the entire execution
  const startTime = Date.now();

  try {
    // Update status to running
    updateTraceStatus(traceId, 'running');

    // Execute based on mode
    if (config.propagationMode) {
      await executePropagationMode(config.runCount, traceId, progressCallback);
    } else {
      await executeIndependentMode(config.runCount, traceId, progressCallback);
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
