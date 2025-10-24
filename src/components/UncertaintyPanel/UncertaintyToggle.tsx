import React from 'react';

interface UncertaintyToggleProps {
  showValues: boolean;
  highlightHighUncertainty: boolean;
  threshold: number;
  onToggleShowValues: () => void;
  onToggleHighlight: () => void;
  onThresholdChange: (threshold: number) => void;
}

export const UncertaintyToggle: React.FC<UncertaintyToggleProps> = ({
  showValues,
  highlightHighUncertainty,
  threshold,
  onToggleShowValues,
  onToggleHighlight,
  onThresholdChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Controls</h3>

      {/* Show Values Toggle */}
      <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm text-gray-700 group-hover:text-blue-600">
          Show Uncertainty Values
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={showValues}
            onChange={onToggleShowValues}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </label>

      {/* Highlight High Uncertainty Toggle */}
      <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm text-gray-700 group-hover:text-blue-600">
          Highlight High Uncertainty
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={highlightHighUncertainty}
            onChange={onToggleHighlight}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </label>

      {/* Threshold Slider */}
      {highlightHighUncertainty && (
        <div className="pt-2">
          <label className="block">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Threshold</span>
              <span className="text-xs font-semibold text-gray-700">
                {threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={threshold}
              onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </label>
        </div>
      )}
    </div>
  );
};
