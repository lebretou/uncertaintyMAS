// Export all types from a single entry point
export * from './uncertainty';
export * from './pipeline';
export * from './display';

// Additional utility types
export interface Position {
  x: number;
  y: number;
}

export type NodeStatus = 'initial' | 'loading' | 'success' | 'error';

export interface NodeData {
  label: string;
  agentId: string;
  agentDefinition?: import('./pipeline').AgentDefinition;
  uncertainty?: number;
  status?: NodeStatus;
}

export interface EdgeData {
  uncertainty?: number;
  label?: string;
}
