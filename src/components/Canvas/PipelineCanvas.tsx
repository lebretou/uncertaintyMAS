import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PipelineNode } from './PipelineNode';
import { NodeInfoPanel } from './NodeInfoPanel';
import { generateNodesAndEdges } from '@config/pipelineConfig';
import { getAgentFromPipeline } from '@config/pipelines';
import { NodeData } from '@/types';
import { useNodeStatusStore } from '@services/nodeStatusStore';

const nodeTypes: NodeTypes = {
  default: PipelineNode,
};

interface PipelineCanvasProps {
  pipelineId: string;
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({ pipelineId }) => {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const nodeStatuses = useNodeStatusStore((state) => state.nodeStatuses);

  // Generate nodes and edges when pipeline changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(pipelineId);
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNodeId(null); // Clear selection when pipeline changes
  }, [pipelineId]);

  // Update node statuses when the store changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: nodeStatuses.get(node.id) || 'initial',
        },
      }))
    );
  }, [nodeStatuses]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleCloseInfoPanel = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedAgent = selectedNodeId ? getAgentFromPipeline(pipelineId, selectedNodeId) : null;

  return (
    <div className="w-full h-full flex">
      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            maxZoom: 1.2,
          }}
          minZoom={0.5}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: 'default',
            animated: false,
            style: { strokeWidth: 2, stroke: '#94a3b8' },
          }}
        >
          <Background variant={BackgroundVariant.Dots} color="#aaa" gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeColor={() => '#adb5bd'}
            className="bg-gray-100"
          />
        </ReactFlow>
      </div>

      {/* Right Sidebar - Node Info Panel */}
      {selectedAgent && (
        <NodeInfoPanel
          agent={selectedAgent}
          onClose={handleCloseInfoPanel}
        />
      )}
    </div>
  );
};
