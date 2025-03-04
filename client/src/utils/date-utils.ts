/**
 * Utility functions for date handling and calculations
 */
import { format, isValid, parseISO, isPast, differenceInDays } from 'date-fns';

/**
 * Formats a date string to a user-friendly format
 * @param dateStr The date string to format
 * @param formatStr Optional format string (defaults to 'MMM d, yyyy')
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (dateStr: string | null | undefined, formatStr: string = 'MMM d, yyyy'): string => {
  if (!dateStr) return '';
  
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '';
    return format(date, formatStr);
  } catch (error) {
    return '';
  }
};

/**
 * Determines if a date is in the past
 * @param dateStr The date string to check
 * @returns True if date is in the past, false otherwise
 */
export const isDatePast = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return false;
    return isPast(date);
  } catch (error) {
    return false;
  }
};

/**
 * Gets the number of days until (or since) a given date
 * @param dateStr The date string to calculate days until/since
 * @returns Number of days (positive for future dates, negative for past dates)
 */
export const getDaysUntil = (dateStr: string | null | undefined): number => {
  if (!dateStr) return 0;
  
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 0;
    return differenceInDays(date, new Date());
  } catch (error) {
    return 0;
  }
};

/**
 * Gets a description of days until/since a date
 * @param dateStr The date string to describe
 * @returns Description string (e.g. "2 days left", "Overdue by 3 days")
 */
export const getDaysUntilDescription = (dateStr: string | null | undefined): string => {
  const days = getDaysUntil(dateStr);
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} left`;
  } else if (days < 0) {
    const absDays = Math.abs(days);
    return `Overdue by ${absDays} day${absDays === 1 ? '' : 's'}`;
  } else {
    return 'Due today';
  }
};

/**
 * Gets urgency level based on due date
 * @param dateStr The date string to evaluate
 * @returns Urgency level: 'high' (overdue or <2 days), 'medium' (2-7 days), 'low' (>7 days)
 */
export const getUrgencyLevel = (dateStr: string | null | undefined): 'high' | 'medium' | 'low' => {
  const days = getDaysUntil(dateStr);
  
  if (days < 2) {
    return 'high';
  } else if (days < 7) {
    return 'medium';
  } else {
    return 'low';
  }
};