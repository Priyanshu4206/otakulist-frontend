/**
 * Default timezone to use when user hasn't set one
 */
export const DEFAULT_TIMEZONE = 'IST'; // Indian Standard Time by default

/**
 * Map of timezone codes to their IANA values
 * Used for internal conversions when needed
 */
const TIMEZONE_MAP = {
  'IST': 'Asia/Kolkata',
  'JST': 'Asia/Tokyo',
  'SGT': 'Asia/Singapore',
  'GMT': 'Europe/London',
  'BST': 'Europe/London',
  'CET': 'Europe/Paris',
  'EST': 'America/New_York',
  'CST': 'America/Chicago',
  'MST': 'America/Denver',
  'PST': 'America/Los_Angeles',
  'AEST': 'Australia/Sydney',
  'NZST': 'Pacific/Auckland',
  'KST': 'Asia/Seoul'
};

/**
 * Extract timezone code from timezone object or string
 * @param {Object|string} timezone - Timezone object or string
 * @returns {string} - Timezone code (e.g., 'IST')
 */
export const getTimezoneValue = (timezone) => {
  if (!timezone) return DEFAULT_TIMEZONE;
  
  // Handle timezone object with code
  if (typeof timezone === 'object' && timezone.code) {
    return timezone.code;
  }
  
  // If it's already a string (assuming it's a code), return it
  return timezone;
};

/**
 * Get the user's timezone preference from localStorage
 * @returns {string} - Timezone code (e.g., 'IST')
 */
export const getUserTimezone = () => {
  // First check localStorage
  const storedTimezone = localStorage.getItem('user_timezone');
  if (storedTimezone) {
    return storedTimezone;
  }
  
  // Fallback to default timezone (IST)
  return DEFAULT_TIMEZONE;
};

/**
 * Save user timezone preference to localStorage
 * @param {string|Object} timezone - Timezone to save
 */
export const saveUserTimezone = (timezone) => {
  if (!timezone) return;
  
  try {
    const code = getTimezoneValue(timezone);
    localStorage.setItem('user_timezone', code);
  } catch (error) {
    console.error('Failed to save timezone preference:', error);
  }
};

/**
 * Get IANA timezone identifier for a timezone code
 * Used when you need the full timezone identifier for Date functions
 * @param {string} code - Timezone code (e.g., 'IST')
 * @returns {string} - IANA timezone identifier (e.g., 'Asia/Kolkata')
 */
export const getIANATimezone = (code) => {
  return TIMEZONE_MAP[code] || 'Asia/Kolkata'; // Fallback to IST
}; 