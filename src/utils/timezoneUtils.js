/**
 * Default timezone to use when user hasn't set one
 */
export const DEFAULT_TIMEZONE = 'Asia/Tokyo'; // JST by default

/**
 * Extract timezone value from a timezone object or string
 * @param {Object|string} timezone - Timezone object or string
 * @returns {string} - Timezone value (e.g., 'Asia/Tokyo')
 */
export const extractTimezoneValue = (timezone) => {
  if (!timezone) return DEFAULT_TIMEZONE;
  
  // Handle timezone object with name
  if (typeof timezone === 'object' && timezone.name) {
    // Extract the value in parentheses from the name
    const match = timezone.name.match(/\((.*?)\)/);
    return match ? match[1] : DEFAULT_TIMEZONE;
  }
  
  // If it's a timezone string with parentheses, extract the value
  if (typeof timezone === 'string' && timezone.includes('(') && timezone.includes(')')) {
    const match = timezone.match(/\((.*?)\)/);
    return match ? match[1] : timezone;
  }
  
  // Otherwise, return the string as is (assuming it's already a proper timezone value)
  return timezone;
};

/**
 * Get the user's timezone preference
 * First checks user settings if logged in, then falls back to stored preference, 
 * finally uses system timezone or default
 * 
 * @param {Object} user - User object from auth context, if available
 * @returns {string} - Timezone string
 */
export const getUserTimezone = (user = null) => {
  // If user is logged in and has timezone preference, use that
  if (user && user.settings && user.settings.timezone) {
    return extractTimezoneValue(user.settings.timezone);
  }
  
  // If no user or no user preference, check localStorage
  const storedTimezone = localStorage.getItem('user_timezone');
  if (storedTimezone) {
    return extractTimezoneValue(storedTimezone);
  }
  
  // Try to get system timezone
  try {
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (systemTimezone) {
      return systemTimezone;
    }
  } catch (error) {
    console.warn('Could not detect system timezone:', error);
  }
  
  // Fallback to default timezone (JST)
  return DEFAULT_TIMEZONE;
};

/**
 * Save user timezone preference to localStorage
 * 
 * @param {string|Object} timezone - Timezone string or object
 */
export const saveUserTimezone = (timezone) => {
  if (!timezone) return;
  
  try {
    // Extract the timezone value if it's an object or formatted string
    const timezoneValue = extractTimezoneValue(timezone);
    localStorage.setItem('user_timezone', timezoneValue);
  } catch (error) {
    console.error('Failed to save timezone preference:', error);
  }
};

/**
 * Format a date using the user's preferred timezone
 * 
 * @param {Date|string} date - Date to format
 * @param {string|Object} timezone - Timezone to use for formatting
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDateWithTimezone = (date, timezone, options = {}) => {
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    ...options
  };
  
  try {
    // Use provided timezone or get user's timezone preference
    const tz = extractTimezoneValue(timezone || getUserTimezone());
    return new Intl.DateTimeFormat('en-US', {
      ...defaultOptions,
      timeZone: tz
    }).format(new Date(date));
  } catch (error) {
    console.error('Error formatting date with timezone:', error);
    // Fallback to simple date format without timezone
    return new Date(date).toLocaleString();
  }
};

/**
 * Convert a time string (e.g., "14:30") to user's timezone
 * Used for anime broadcast times
 * 
 * @param {string} timeString - Time string in HH:MM format
 * @param {string} day - Day of the week
 * @param {string|Object} fromTimezone - Source timezone
 * @param {string|Object} toTimezone - Target timezone 
 * @returns {Object} - { time: "14:30", day: "Monday" }
 */
export const convertTimeToUserTimezone = (
  timeString,
  day,
  fromTimezone = 'Asia/Tokyo', // Most anime use JST
  toTimezone = null // Will use user timezone by default
) => {
  if (!timeString || !day) {
    return { time: timeString, day };
  }
  
  try {
    // Get target timezone or use user preference
    const sourceTimezone = extractTimezoneValue(fromTimezone);
    const targetTimezone = extractTimezoneValue(toTimezone || getUserTimezone());
    
    // Create current date object for the source day and time
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = days.findIndex(d => d.toLowerCase() === day.toLowerCase());
    
    if (dayIndex === -1) {
      return { time: timeString, day };
    }
    
    // Get current date and adjust to the specified day
    const now = new Date();
    const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;
    
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    
    // Set the time from the timeString (assuming HH:MM format)
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    
    // Create formatter with the source timezone
    const sourceFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceTimezone,
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    
    // Format the date in the source timezone
    const sourceDateParts = sourceFormatter.formatToParts(date);
    
    // Extract parts and build a date in the source timezone
    const sourceYear = sourceDateParts.find(part => part.type === 'year').value;
    const sourceMonth = sourceDateParts.find(part => part.type === 'month').value;
    const sourceDay = sourceDateParts.find(part => part.type === 'day').value;
    const sourceHour = sourceDateParts.find(part => part.type === 'hour').value;
    const sourceMinute = sourceDateParts.find(part => part.type === 'minute').value;
    
    // Create a date string in ISO format
    const sourceDateString = `${sourceYear}-${sourceMonth.padStart(2, '0')}-${sourceDay.padStart(2, '0')}T${sourceHour.padStart(2, '0')}:${sourceMinute.padStart(2, '0')}:00`;
    const sourceDate = new Date(sourceDateString);
    
    // Format the date in the target timezone
    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    
    const targetDateParts = targetFormatter.formatToParts(sourceDate);
    
    // Extract the converted day and time
    const targetDay = targetDateParts.find(part => part.type === 'weekday').value;
    const targetHour = targetDateParts.find(part => part.type === 'hour').value.padStart(2, '0');
    const targetMinute = targetDateParts.find(part => part.type === 'minute').value.padStart(2, '0');
    
    return {
      time: `${targetHour}:${targetMinute}`,
      day: targetDay
    };
  } catch (error) {
    console.error('Error converting time to user timezone:', error);
    return { time: timeString, day };
  }
}; 