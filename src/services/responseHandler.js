/**
 * Standard response handler for API calls
 * Handles the format: { success: true, data: {} } or { success: false, error: { message, statusCode } }
 */

/**
 * Handle successful API responses
 * @param {Object} response - API response object
 * @returns {Object} Normalized response data
 */
export const handleSuccess = (response) => {
  // If response already has a success property, return as is
  if (response && typeof response === 'object' && 'success' in response) {
    return response;
  }
  
  // Otherwise, wrap the response in a standard format
  return {
    success: true,
    data: response
  };
};

/**
 * Handle error responses from API calls
 * @param {Error} error - Error object from API call
 * @returns {Object} Standardized error object
 */
export const handleError = (error) => {
  // If it's already in our standard format, return it
  if (error && typeof error === 'object' && 'success' in error && !error.success) {
    return error;
  }

  // Check if it's an axios error response with data
  if (error && error.response && error.response.data) {
    // If response data already has the structure we expect
    if (error.response.data.error) {
      return {
        success: false,
        error: error.response.data.error
      };
    }
    
    // Return with standard format
    return {
      success: false,
      error: {
        message: error.response.data.message || 'An error occurred',
        statusCode: error.response.status || 500
      }
    };
  }

  // Handle network errors
  if (error && error.message === 'Network Error') {
    return {
      success: false,
      error: {
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0,
        isNetworkError: true
      }
    };
  }

  // Handle canceled requests
  if (error && error.canceled) {
    return {
      success: false,
      error: {
        message: 'Request was canceled',
        statusCode: 0,
        isCanceled: true
      }
    };
  }

  // Generic error fallback
  return {
    success: false,
    error: {
      message: error?.message || 'An unexpected error occurred',
      statusCode: error?.statusCode || 500
    }
  };
};

/**
 * Process API response with standardized handling for success and error cases
 * @param {Promise} apiPromise - Promise from an API call
 * @returns {Promise<Object>} Standardized response object
 */
export const processResponse = async (apiPromise) => {
  try {
    const response = await apiPromise;
    return handleSuccess(response);
  } catch (error) {
    return handleError(error);
  }
};

export default {
  handleSuccess,
  handleError,
  processResponse
}; 