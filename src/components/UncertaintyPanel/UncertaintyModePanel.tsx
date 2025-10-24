import React from 'react';
import { useUncertaintyStore } from '@services/uncertaintyStore';
import { MetricSelector } from './MetricSelector';
import { DisplayModeSelector } from './DisplayModeSelector';
import { UncertaintyToggle } from './UncertaintyToggle';
import { PresetManager } from './PresetManager';
import { PipelineSelector } from '@components/Controls/PipelineSelector';
import { CSVUpload } from '@components/Controls/CSVUpload';

interface UncertaintyModePanelProps {
  pipelineId: string;
  onPipelineChange: (pipelineId: string) => void;
  onCSVLoad: (csvData: string, fileName: string) => void;
  csvFileName?: string;
}

export const UncertaintyModePanel: React.FC<UncertaintyModePanelProps> = ({
  pipelineId,
  onPipelineChange,
  onCSVLoad,
  csvFileName,
}) => {
  const {
    config,
    presets,
    setMetric,
    setDisplayMode,
    toggleShowValues,
    toggleHighlightHighUncertainty,
    setThreshold,
    loadPreset,
    savePreset,
    deletePreset,
  } = useUncertaintyStore();

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Panel Header */}
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-lg font-bold text-gray-800">
            Pipeline Configuration
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Select pipeline and upload data
          </p>
        </div>

        {/* Pipeline Selection */}
        <div className="border-b border-gray-200 pb-4">
          <PipelineSelector
            selectedPipelineId={pipelineId}
            onChange={onPipelineChange}
          />
        </div>

        {/* CSV Upload */}
        <div className="border-b border-gray-200 pb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Data Source
          </label>
          <CSVUpload
            onCSVLoad={onCSVLoad}
            currentFileName={csvFileName}
          />
        </div>

        {/* Uncertainty Section Header */}
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-lg font-bold text-gray-800">
            Uncertainty Visualization
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure how uncertainty is displayed
          </p>
        </div>

        {/* Metric Selection */}
        <div className="border-b border-gray-200 pb-4">
          <MetricSelector
            selectedMetric={config.metric}
            onChange={setMetric}
          />
        </div>

        {/* Display Mode Selection */}
        <div className="border-b border-gray-200 pb-4">
          <DisplayModeSelector
            selectedMode={config.displayMode}
            onChange={setDisplayMode}
          />
        </div>

        {/* Controls */}
        <div className="border-b border-gray-200 pb-4">
          <UncertaintyToggle
            showValues={config.showValues}
            highlightHighUncertainty={config.highlightHighUncertainty}
            threshold={config.threshold || 0.66}
            onToggleShowValues={toggleShowValues}
            onToggleHighlight={toggleHighlightHighUncertainty}
            onThresholdChange={setThreshold}
          />
        </div>

        {/* Presets */}
        <div>
          <PresetManager
            presets={presets}
            currentConfig={config}
            onLoadPreset={loadPreset}
            onSavePreset={savePreset}
            onDeletePreset={deletePreset}
          />
        </div>
      </div>
    </div>
  );
};
