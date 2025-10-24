import React, { useState } from 'react';
import { UncertaintyPreset } from '@/types';
import { nanoid } from 'nanoid';

interface PresetManagerProps {
  presets: UncertaintyPreset[];
  onLoadPreset: (preset: UncertaintyPreset) => void;
  onSavePreset: (preset: UncertaintyPreset) => void;
  onDeletePreset: (id: string) => void;
  currentConfig: any;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  presets,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  currentConfig,
}) => {
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSaveNewPreset = () => {
    if (presetName.trim()) {
      const newPreset: UncertaintyPreset = {
        id: `preset-${nanoid()}`,
        name: presetName.trim(),
        config: currentConfig,
      };
      onSavePreset(newPreset);
      setPresetName('');
      setIsCreatingPreset(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Presets</h3>

      {/* Preset List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-100 group"
          >
            <button
              onClick={() => onLoadPreset(preset)}
              className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600"
            >
              {preset.name}
            </button>
            <button
              onClick={() => onDeletePreset(preset.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs ml-2"
              aria-label="Delete preset"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Save New Preset */}
      {!isCreatingPreset ? (
        <button
          onClick={() => setIsCreatingPreset(true)}
          className="w-full py-2 px-3 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
        >
          Save Current as Preset
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveNewPreset}
              disabled={!presetName.trim()}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsCreatingPreset(false);
                setPresetName('');
              }}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
