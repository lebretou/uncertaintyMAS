import { UncertaintyDisplayProps } from '../types';

/**
 * Node Halo Uncertainty Display
 * Shows a glow effect around nodes based on uncertainty
 * TODO: Implement in Phase 4
 */
export const NodeHaloDisplay: React.FC<UncertaintyDisplayProps> = () => {
  return null;
};

(NodeHaloDisplay as any).displayModeId = 'node-halo';
(NodeHaloDisplay as any).displayModeName = 'Node Halo Display';
(NodeHaloDisplay as any).displayModeDescription = 'Shows uncertainty with a glow effect around nodes';
