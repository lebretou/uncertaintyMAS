import { Node, Edge } from 'reactflow';
import { CalculatedUncertainty, UncertaintyConfig, UncertaintyDisplayMode } from './uncertainty';

export interface UncertaintyDisplayProps {
  config: UncertaintyConfig;
  nodes: Node[];
  edges: Edge[];
  uncertaintyData: Map<string, CalculatedUncertainty>;
  onNodeHover?: (nodeId: string | null) => void;
  onNodeClick?: (nodeId: string) => void;
  isActive?: boolean;
}

export interface UncertaintyDisplayResult {
  styledNodes: Node[]; // Modified nodes or originals
  styledEdges: Edge[]; // Modified edges or originals
  overlays?: React.ReactNode; // Any JSX to render on top
  cleanup?: () => void;
}

export type DisplayModeComponent = React.FC<UncertaintyDisplayProps> & {
  displayModeId: UncertaintyDisplayMode;
  displayModeName: string;
  displayModeDescription: string;
};
