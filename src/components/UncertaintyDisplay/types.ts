// Shared types and interfaces for uncertainty display modes
// DO NOT MODIFY - these are the contracts that all display modes must implement

export * from '../../types/display';

// Utility function to get uncertainty color based on value
export function getUncertaintyColor(value: number): string {
  if (value < 0.33) return '#10B981'; // Green - low uncertainty
  if (value < 0.66) return '#F59E0B'; // Amber - medium uncertainty
  return '#EF4444'; // Red - high uncertainty
}

// Utility function to get uncertainty level label
export function getUncertaintyLevel(value: number): 'low' | 'medium' | 'high' {
  if (value < 0.33) return 'low';
  if (value < 0.66) return 'medium';
  return 'high';
}
