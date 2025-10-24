import { Node, Edge } from 'reactflow';
import { AGENT_DEFINITIONS } from './agentDefinitions';
import { NodeData, EdgeData } from '../types';

// Define node positions for the pipeline layout
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  ingest: { x: 100, y: 200 },
  'schema-mapper': { x: 400, y: 100 },
  cleaning: { x: 400, y: 300 },
  analytics: { x: 700, y: 300 },
  visualization: { x: 1000, y: 300 },
};

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

// Mock input data for testing
export const MOCK_CSV_DATA = `name,age,city,salary
John Doe,28,New York,75000
Jane Smith,34,San Francisco,95000
Bob Johnson,45,Chicago,82000
Alice Williams,29,Boston,78000
Charlie Brown,52,Seattle,105000`;
