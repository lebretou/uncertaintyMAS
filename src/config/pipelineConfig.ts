import { Node, Edge } from 'reactflow';
import { AGENT_DEFINITIONS } from './agentDefinitions';
import { getPipelineById } from './pipelines';
import { NodeData, EdgeData, AgentDefinition } from '../types';

// Define node positions for the pipeline layout (old hardcoded positions)
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  ingest: { x: 100, y: 200 },
  summarizer: { x: 400, y: 100 },
  'schema-mapper': { x: 400, y: 100 },
  cleaning: { x: 400, y: 300 },
  analytics: { x: 700, y: 300 },
  visualization: { x: 1000, y: 300 },
  'hypothesis-generator': { x: 400, y: 100 },
  'pattern-finder': { x: 400, y: 300 },
  'creative-analytics': { x: 700, y: 300 },
  'creative-viz': { x: 1000, y: 300 },
};

/**
 * Generate nodes and edges dynamically based on pipeline configuration
 */
export function generateNodesAndEdges(pipelineId: string): {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
} {
  const pipeline = getPipelineById(pipelineId);

  if (!pipeline) {
    console.warn(`Pipeline not found: ${pipelineId}, using empty pipeline`);
    return { nodes: [], edges: [] };
  }

  // Create nodes from agent definitions
  const nodes: Node<NodeData>[] = pipeline.agents.map((agent) => ({
    id: agent.id,
    type: 'default',
    position: NODE_POSITIONS[agent.id] || { x: 0, y: 0 },
    data: {
      label: agent.name,
      agentId: agent.id,
      agentDefinition: agent,
    },
    draggable: true,
  }));

  // Create edges from agent downstream relationships
  const edges: Edge<EdgeData>[] = pipeline.agents.flatMap((agent) =>
    agent.downstreamNodeIds.map((targetId) => ({
      id: `${agent.id}-${targetId}`,
      source: agent.id,
      target: targetId,
      type: 'default',
      animated: false,
      style: { strokeWidth: 2, stroke: '#94a3b8' },
      data: {},
    }))
  );

  return { nodes, edges };
}

// Create initial nodes from agent definitions
export const initialNodes: Node<NodeData>[] = AGENT_DEFINITIONS.map((agent) => ({
  id: agent.id,
  type: 'default',
  position: NODE_POSITIONS[agent.id] || { x: 0, y: 0 },
  data: {
    label: agent.name,
    agentId: agent.id,
    agentDefinition: agent,
  },
  draggable: true,
}));

// Create initial edges from agent downstream relationships
export const initialEdges: Edge<EdgeData>[] = AGENT_DEFINITIONS.flatMap((agent) =>
  agent.downstreamNodeIds.map((targetId) => ({
    id: `${agent.id}-${targetId}`,
    source: agent.id,
    target: targetId,
    type: 'default', // Uses bezier curves by default
    animated: false,
    style: { strokeWidth: 2, stroke: '#94a3b8' },
    data: {},
  }))
);

// Pipeline metadata
export const PIPELINE_METADATA = {
  name: 'Data Analysis Pipeline',
  description: 'Multi-agent pipeline for CSV data analysis with uncertainty tracking',
  version: '1.0.0',
  routes: [
    {
      name: 'Schema Analysis Route',
      path: ['ingest', 'schema-mapper'],
      description: 'Quick schema inference and mapping',
    },
    {
      name: 'Full Analysis Route',
      path: ['ingest', 'cleaning', 'analytics', 'visualization'],
      description: 'Complete data cleaning, analysis, and visualization',
    },
  ],
};
