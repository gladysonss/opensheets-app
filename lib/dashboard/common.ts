/**
 * Common utilities and helpers for dashboard queries
 */

import { safeToNumber } from "@/lib/utils/number";
import { calculatePercentageChange } from "@/lib/utils/math";

export { safeToNumber, calculatePercentageChange };

/**
 * Alias for backward compatibility - dashboard uses "toNumber" naming
 */
export const toNumber = safeToNumber;
