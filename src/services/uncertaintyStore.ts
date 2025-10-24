import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import {
  UncertaintyConfig,
  UncertaintyMetric,
  UncertaintyDisplayMode,
  UncertaintyPreset,
} from '../types';

interface UncertaintyStore {
  config: UncertaintyConfig;
  presets: UncertaintyPreset[];

  // Actions
  setConfig: (config: UncertaintyConfig) => void;
  setMetric: (metric: UncertaintyMetric) => void;
  setDisplayMode: (mode: UncertaintyDisplayMode) => void;
  toggleShowValues: () => void;
  toggleHighlightHighUncertainty: () => void;
  setThreshold: (threshold: number) => void;
  loadPreset: (preset: UncertaintyPreset) => void;
  savePreset: (preset: UncertaintyPreset) => void;
  deletePreset: (id: string) => void;
}

const DEFAULT_CONFIG: UncertaintyConfig = {
  metric: 'semantic-entropy',
  displayMode: 'edge',
  showValues: true,
  highlightHighUncertainty: false,
  threshold: 0.66,
};

const DEFAULT_PRESETS: UncertaintyPreset[] = [
  {
    id: 'preset-1',
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
    id: 'preset-2',
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
    id: 'preset-3',
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
    id: 'preset-4',
    name: 'Tooltip Mode',
    config: {
      metric: 'semantic-entropy',
      displayMode: 'tooltip',
      showValues: true,
      highlightHighUncertainty: false,
      threshold: 0.5,
    },
  },
];

export const useUncertaintyStore = create<UncertaintyStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        config: DEFAULT_CONFIG,
        presets: DEFAULT_PRESETS,

        setConfig: (config) => set({ config }),

        setMetric: (metric) =>
          set((state) => ({
            config: { ...state.config, metric },
          })),

        setDisplayMode: (displayMode) =>
          set((state) => ({
            config: { ...state.config, displayMode },
          })),

        toggleShowValues: () =>
          set((state) => ({
            config: {
              ...state.config,
              showValues: !state.config.showValues,
            },
          })),

        toggleHighlightHighUncertainty: () =>
          set((state) => ({
            config: {
              ...state.config,
              highlightHighUncertainty: !state.config.highlightHighUncertainty,
            },
          })),

        setThreshold: (threshold) =>
          set((state) => ({
            config: { ...state.config, threshold },
          })),

        loadPreset: (preset) =>
          set({ config: preset.config }),

        savePreset: (preset) =>
          set((state) => {
            const existingIndex = state.presets.findIndex((p) => p.id === preset.id);
            if (existingIndex >= 0) {
              const newPresets = [...state.presets];
              newPresets[existingIndex] = preset;
              return { presets: newPresets };
            }
            return { presets: [...state.presets, preset] };
          }),

        deletePreset: (id) =>
          set((state) => ({
            presets: state.presets.filter((p) => p.id !== id),
          })),
      }),
      {
        name: 'uncertainty-config-storage',
        partialize: (state) => ({
          config: state.config,
          presets: state.presets,
        }),
      }
    )
  )
);
