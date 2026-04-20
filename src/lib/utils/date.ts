/**
 * Safe date formatting utilities that prevent hydration mismatches.
 * Uses UTC-based formatting to ensure consistent output between server and client.
 */

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const shortMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const weekdays = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Format a date string to a simple date format (e.g., "Jan 15, 2024")
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const month = shortMonths[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Format a date string to a full date format (e.g., "Monday, January 15, 2024")
 */
export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Format a date string to just month and day (e.g., "January 15")
 */
export function formatDateMonthDay(dateString: string): string {
  const date = new Date(dateString);
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}`;
}

/**
 * Format a status string to Sentence case (e.g., "in-progress" -> "In Progress")
 */
export function formatStatus(status: string): string {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
