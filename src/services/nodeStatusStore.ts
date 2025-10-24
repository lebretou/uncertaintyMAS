import { create } from 'zustand';
import { NodeStatus } from '@/types';

interface NodeStatusState {
  nodeStatuses: Map<string, NodeStatus>;
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  resetAllStatuses: () => void;
  getNodeStatus: (nodeId: string) => NodeStatus;
}

export const useNodeStatusStore = create<NodeStatusState>((set, get) => ({
  nodeStatuses: new Map(),

  setNodeStatus: (nodeId: string, status: NodeStatus) => {
    set((state) => {
      const newStatuses = new Map(state.nodeStatuses);
      newStatuses.set(nodeId, status);
      return { nodeStatuses: newStatuses };
    });
  },

  resetAllStatuses: () => {
    set({ nodeStatuses: new Map() });
  },

  getNodeStatus: (nodeId: string) => {
    return get().nodeStatuses.get(nodeId) || 'initial';
  },
}));
