/**
 * Utility functions for safe number conversions
 */

/**
 * Safely converts unknown value to number
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns Converted number or default value
 */
export function safeToNumber(
  value: unknown,
  defaultValue: number = 0
): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  if (value === null || value === undefined) {
    return defaultValue;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parses integer from unknown value
 * @param value - Value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer or default value
 */
export function safeParseInt(
  value: unknown,
  defaultValue: number = 0
): number {
  if (typeof value === "number") {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}

/**
 * Safely parses float from unknown value
 * @param value - Value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed float or default value
 */
export function safeParseFloat(
  value: unknown,
  defaultValue: number = 0
): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}
