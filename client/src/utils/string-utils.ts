/**
 * Utility functions for string handling and formatting
 */

/**
 * Gets the first character of a string safely, with fallback
 * @param str The input string that might be null or undefined
 * @param fallback The fallback character if string is null/undefined/empty
 * @returns The first character or fallback
 */
export const getFirstCharacter = (str: string | null | undefined, fallback: string = "U"): string => {
  if (!str || str.length === 0) return fallback;
  return str.charAt(0);
};

/**
 * Provides a fallback for null/undefined strings
 * @param str The input string that might be null or undefined
 * @param fallback The fallback string
 * @returns The original string or fallback
 */
export const getStringOrFallback = (str: string | null | undefined, fallback: string = "Unassigned"): string => {
  if (!str) return fallback;
  return str;
};