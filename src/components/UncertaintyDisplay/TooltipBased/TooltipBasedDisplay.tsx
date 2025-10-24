import { UncertaintyDisplayProps } from '../types';

/**
 * Tooltip-Based Uncertainty Display
 * Shows uncertainty information in tooltips on hover
 * TODO: Implement in Phase 4
 */
export const TooltipBasedDisplay: React.FC<UncertaintyDisplayProps> = () => {
  return null;
};

(TooltipBasedDisplay as any).displayModeId = 'tooltip';
(TooltipBasedDisplay as any).displayModeName = 'Tooltip Display';
(TooltipBasedDisplay as any).displayModeDescription = 'Shows uncertainty in tooltips on hover';
