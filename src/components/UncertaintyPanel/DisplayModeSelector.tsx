import React from 'react';
import { UncertaintyDisplayMode } from '@/types';

interface DisplayModeSelectorProps {
  selectedMode: UncertaintyDisplayMode;
  onChange: (mode: UncertaintyDisplayMode) => void;
}

const DISPLAY_MODES: Array<{
  id: UncertaintyDisplayMode;
  label: string;
  description: string;
}> = [
  {
    id: 'edge',
    label: 'Edge-Based',
    description: 'Modify edge color and width',
  },
  {
    id: 'node-badge',
    label: 'Node Badge',
    description: 'Small circle on node corner',
  },
  {
    id: 'node-halo',
    label: 'Node Halo',
    description: 'Glow effect around nodes',
  },
  {
    id: 'tooltip',
    label: 'Tooltip',
    description: 'Show on hover',
  },
  {
    id: 'full-visualization',
    label: 'Full Visualization',
    description: 'Detailed panel with charts',
  },
];

export const DisplayModeSelector: React.FC<DisplayModeSelectorProps> = ({
  selectedMode,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Display Mode</h3>
      {DISPLAY_MODES.map((mode) => (
        <label
          key={mode.id}
          className="flex items-start space-x-3 cursor-pointer group"
        >
          <input
            type="radio"
            name="displayMode"
            value={mode.id}
            checked={selectedMode === mode.id}
            onChange={() => onChange(mode.id)}
            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
              {mode.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {mode.description}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};
