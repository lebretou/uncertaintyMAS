// Registry for uncertainty display modes
// UPDATE THIS FILE when adding new display modes

import { UncertaintyDisplayMode } from '@/types';
import { DisplayModeComponent } from './types';

// Import display mode components here as they are implemented
// import { EdgeBasedDisplay } from './EdgeBased/EdgeBasedDisplay';
// import { NodeBadgeDisplay } from './NodeBadge/NodeBadgeDisplay';
// import { NodeHaloDisplay } from './NodeHalo/NodeHaloDisplay';
// import { TooltipBasedDisplay } from './TooltipBased/TooltipBasedDisplay';
// import { FullVisualizationDisplay } from './FullVisualization/FullVisualizationDisplay';

// Registry mapping display mode IDs to their components
const displayModeRegistry: Partial<Record<UncertaintyDisplayMode, DisplayModeComponent>> = {
  // 'edge': EdgeBasedDisplay,
  // 'node-badge': NodeBadgeDisplay,
  // 'node-halo': NodeHaloDisplay,
  // 'tooltip': TooltipBasedDisplay,
  // 'full-visualization': FullVisualizationDisplay,
};

/**
 * Get the component for a specific display mode
 */
export function getDisplayModeComponent(
  mode: UncertaintyDisplayMode
): DisplayModeComponent | null {
  return displayModeRegistry[mode] || null;
}

/**
 * Check if a display mode is implemented
 */
export function isDisplayModeImplemented(mode: UncertaintyDisplayMode): boolean {
  return mode in displayModeRegistry;
}

/**
 * Get all implemented display modes
 */
export function getImplementedDisplayModes(): UncertaintyDisplayMode[] {
  return Object.keys(displayModeRegistry) as UncertaintyDisplayMode[];
}
