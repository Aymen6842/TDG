/**
 * Truncates the decimal places of a string value to a maximum number.
 * @param val - The value to truncate
 * @param maxDecimals - Maximum number of decimal places
 * @returns The truncated value
 */
export const truncateToMaxDecimals = (val: string, maxDecimals: number): string => {
  const parts = val.split(".");
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    return parts[0] + "." + parts[1].substring(0, maxDecimals);
  }
  return val;
};
