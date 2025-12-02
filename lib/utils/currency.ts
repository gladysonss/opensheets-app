/**
 * Utility functions for currency/decimal formatting and parsing
 */

/**
 * Formats a decimal number for database storage (2 decimal places)
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places, or null if input is null
 */
export function formatDecimalForDb(value: number | null): string | null {
  if (value === null) {
    return null;
  }

  return (Math.round(value * 100) / 100).toFixed(2);
}

/**
 * Formats a decimal number for database storage (non-nullable version)
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places
 */
export function formatDecimalForDbRequired(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

/**
 * Normalizes decimal input by replacing comma with period
 * @param value - Input string
 * @returns Normalized string with period as decimal separator
 */
export function normalizeDecimalInput(value: string): string {
  return value.replace(/\s/g, "").replace(",", ".");
}

/**
 * Formats a limit/balance input for display
 * @param value - The number to format
 * @returns Formatted string or empty string
 */
export function formatLimitInput(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }

  return (Math.round(value * 100) / 100).toFixed(2);
}

/**
 * Formats an initial balance input for display (defaults to "0.00")
 * @param value - The number to format
 * @returns Formatted string with default "0.00"
 */
export function formatInitialBalanceInput(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0.00";
  }

  return (Math.round(value * 100) / 100).toFixed(2);
}

/**
 * Splits a total amount (in cents) into equal parts, handling remainders
 * @param totalCents - The total amount in cents
 * @param parts - Number of parts to split into
 * @returns Array of numbers representing the amount in cents for each part
 */
export function splitAmount(totalCents: number, parts: number): number[] {
  if (parts <= 0) {
    return [];
  }

  const base = Math.trunc(totalCents / parts);
  const remainder = totalCents % parts;

  return Array.from(
    { length: parts },
    (_, index) => base + (index < remainder ? 1 : 0)
  );
}

/**
 * Converts cents to a decimal string (e.g. 1050 -> "10.50")
 * @param value - Value in cents
 * @returns Formatted decimal string
 */
export function centsToDecimalString(value: number): string {
  const decimal = value / 100;
  const formatted = decimal.toFixed(2);
  return Object.is(decimal, -0) ? "0.00" : formatted;
}
