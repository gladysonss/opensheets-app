/**
 * Utility functions for mathematical calculations
 */

/**
 * Calculates percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change or null if previous is 0 and current is also 0
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number | null {
  const EPSILON = 0.01; // Considera valores menores que 1 centavo como zero

  if (Math.abs(previous) < EPSILON) {
    if (Math.abs(current) < EPSILON) return null;
    return current > 0 ? 100 : -100;
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;

  // Protege contra valores absurdos (retorna null se > 1 milhão %)
  return Number.isFinite(change) && Math.abs(change) < 1000000 ? change : null;
}

/**
 * Calculates percentage of part relative to total
 * @param part - Part value
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return (part / total) * 100;
}

/**
 * Rounds number to specified decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places (default 2)
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}
