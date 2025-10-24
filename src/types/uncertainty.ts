// Uncertainty types
export type UncertaintyMetric =
  | "semantic-entropy"
  | "llm-self-report"
  | "cosine-similarity"
  | "agreement-rate";

export type UncertaintyDisplayMode =
  | "edge"
  | "node-badge"
  | "node-halo"
  | "tooltip"
  | "full-visualization";

export interface UncertaintyConfig {
  metric: UncertaintyMetric;
  displayMode: UncertaintyDisplayMode;
  showValues: boolean;
  highlightHighUncertainty: boolean;
  threshold?: number; // 0-1
}

export interface UncertaintyPreset {
  id: string;
  name: string;
  config: UncertaintyConfig;
}

export interface CalculatedUncertainty {
  metric: UncertaintyMetric;
  value: number; // 0-1 or 0-log(N)
  metadata?: Record<string, unknown>;
}
