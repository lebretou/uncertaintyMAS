import { UncertaintyPreset } from '../types';

export const DEFAULT_UNCERTAINTY_PRESETS: UncertaintyPreset[] = [
  {
    id: 'preset-semantic-entropy-edge',
    name: 'Semantic Entropy (Edge)',
    config: {
      metric: 'semantic-entropy',
      displayMode: 'edge',
      showValues: true,
      highlightHighUncertainty: true,
      threshold: 0.66,
    },
  },
  {
    id: 'preset-llm-confidence-badge',
    name: 'LLM Confidence (Badge)',
    config: {
      metric: 'llm-self-report',
      displayMode: 'node-badge',
      showValues: true,
      highlightHighUncertainty: false,
      threshold: 0.5,
    },
  },
  {
    id: 'preset-agreement-halo',
    name: 'Agreement Rate (Halo)',
    config: {
      metric: 'agreement-rate',
      displayMode: 'node-halo',
      showValues: false,
      highlightHighUncertainty: true,
      threshold: 0.7,
    },
  },
  {
    id: 'preset-tooltip-mode',
    name: 'Tooltip Mode',
    config: {
      metric: 'semantic-entropy',
      displayMode: 'tooltip',
      showValues: true,
      highlightHighUncertainty: false,
      threshold: 0.5,
    },
  },
  {
    id: 'preset-full-visualization',
    name: 'Full Visualization',
    config: {
      metric: 'cosine-similarity',
      displayMode: 'full-visualization',
      showValues: true,
      highlightHighUncertainty: true,
      threshold: 0.6,
    },
  },
];
