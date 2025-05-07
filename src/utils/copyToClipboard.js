/**
 * Utility function to copy text to clipboard
 * @param {string} text - The text to copy to clipboard
 * @returns {Promise<boolean>} - Promise that resolves to true if successful, rejects with error if not
 */
const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    // Use modern Clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch((error) => reject(error));
    } else {
      // Fallback for older browsers or non-secure contexts
      try {
        // Create temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Make it invisible but part of the document
        textArea.style.position = 'fixed';
        textArea.style.opacity = 0;
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        // Select and copy
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          resolve(true);
        } else {
          reject(new Error('Unable to copy text'));
        }
      } catch (err) {
        reject(err);
      }
    }
  });
};

export default copyToClipboard; 