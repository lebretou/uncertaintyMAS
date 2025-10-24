import React from 'react';
import { PIPELINES } from '@config/pipelines';

interface PipelineSelectorProps {
  selectedPipelineId: string;
  onChange: (pipelineId: string) => void;
}

export const PipelineSelector: React.FC<PipelineSelectorProps> = ({
  selectedPipelineId,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Pipeline</label>
      <select
        value={selectedPipelineId}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {PIPELINES.map((pipeline) => (
          <option key={pipeline.id} value={pipeline.id}>
            {pipeline.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        {PIPELINES.find((p) => p.id === selectedPipelineId)?.description}
      </p>
    </div>
  );
};
