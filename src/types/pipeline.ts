import { CalculatedUncertainty, UncertaintyConfig, UncertaintyMetric } from './uncertainty';

// Pipeline types
export type ModelType = "gpt-3.5-turbo-1106";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: ModelType;
  temperature: number;
  downstreamNodeIds: string[];
}

export interface ExecutionResult {
  executionId: string;
  traceId: string;
  nodeId: string;
  nodeName: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  input: unknown;
  output: unknown;
  executionTime: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number
  };
  error?: {
    code: string;
    message: string;
    timestamp: string
  };
  timestamp: string;
  uncertaintyMetrics?: Map<UncertaintyMetric, CalculatedUncertainty>;
}

export type TraceStatus = "pending" | "running" | "completed" | "failed";

export interface Trace {
  traceId: string;
  timestamp: string;
  runCount: number;
  propagationMode: boolean;
  executions: ExecutionResult[];
  uncertaintyConfig: UncertaintyConfig;
  status: TraceStatus;
  executionStats?: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalExecutionTime: number;
  };
}

export interface RunConfiguration {
  runCount: number;
  propagationMode: boolean;
  pipelineId: string;
  csvData: string; // CSV content as string
  csvFileName?: string;
  userPrompt: string; // User's analytical intent/task
}

export interface DataContext {
  dataRef: string; // Reference to the data (e.g., file path or ID)
  schema: {
    columns: string[];
    types: Record<string, string>;
    rowCount: number;
  };
  transformationLog?: string[];
  userPrompt: string;
}
