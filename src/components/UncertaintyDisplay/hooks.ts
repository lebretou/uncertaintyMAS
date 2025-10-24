// Shared hooks and utilities for uncertainty display modes

import { useMemo } from 'react';
import { CalculatedUncertainty } from '@/types';
import { getUncertaintyColor, getUncertaintyLevel } from './types';

/**
 * Hook to format uncertainty value for display
 */
export function useFormattedUncertainty(uncertainty?: CalculatedUncertainty) {
  return useMemo(() => {
    if (!uncertainty) return null;

    return {
      value: uncertainty.value,
      formattedValue: uncertainty.value.toFixed(3),
      color: getUncertaintyColor(uncertainty.value),
      level: getUncertaintyLevel(uncertainty.value),
      metric: uncertainty.metric,
    };
  }, [uncertainty]);
}

/**
 * Hook to determine if uncertainty should be highlighted
 */
export function useHighlightUncertainty(
  value: number,
  threshold: number,
  highlightEnabled: boolean
): boolean {
  return useMemo(() => {
    return highlightEnabled && value >= threshold;
  }, [value, threshold, highlightEnabled]);
}
