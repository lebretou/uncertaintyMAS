import React from 'react';
import { UncertaintyMetric } from '@/types';

interface MetricSelectorProps {
  selectedMetric: UncertaintyMetric;
  onChange: (metric: UncertaintyMetric) => void;
}

const METRICS: Array<{ id: UncertaintyMetric; label: string; description: string }> = [
  {
    id: 'semantic-entropy',
    label: 'Semantic Entropy',
    description: 'Measure output diversity using embeddings',
  },
  {
    id: 'llm-self-report',
    label: 'LLM Self-Report',
    description: 'Extract confidence score from LLM response',
  },
  {
    id: 'cosine-similarity',
    label: 'Cosine Similarity',
    description: 'Compute pairwise similarity of outputs',
  },
  {
    id: 'agreement-rate',
    label: 'Agreement Rate',
    description: '% of runs producing similar outputs',
  },
];

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedMetric,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Uncertainty Metric
      </h3>
      {METRICS.map((metric) => (
        <label
          key={metric.id}
          className="flex items-start space-x-3 cursor-pointer group"
        >
          <input
            type="radio"
            name="metric"
            value={metric.id}
            checked={selectedMetric === metric.id}
            onChange={() => onChange(metric.id)}
            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
              {metric.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {metric.description}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};
