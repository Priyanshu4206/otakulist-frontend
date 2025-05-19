import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for debouncing value changes
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - The debounced value
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup on unmount or value change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 