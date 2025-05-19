import { useState, useEffect } from 'react';

/**
 * Custom hook for loading genre images dynamically
 * 
 * @param {string} genreName - Name of the genre
 * @returns {Object} - Image URL and loading state
 */
function useGenreImage(genreName) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!genreName) {
      setImageUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Map genre name to image number (cyclic assignment for now)
    const getImageNumber = (name) => {
      // Map specific genres to specific images if needed
      const mappings = {
        'Action': 1,
        'Adventure': 2,
        'Comedy': 3,
        'Drama': 4,
        'Fantasy': 5
      };

      // If we have a specific mapping, use it
      if (mappings[name]) {
        return mappings[name];
      }

      // Otherwise, hash the name to a number between 1-5
      const hash = name.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);

      return (hash % 5) + 1;
    };

    // Normalize genre name
    const normalizedName = genreName.trim();
    const imageNumber = getImageNumber(normalizedName);

    // Dynamically import the image
    import(`../assets/images/avatar-${imageNumber}.jpg`)
      .then(image => {
        setImageUrl(image.default);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to load image for genre ${normalizedName}:`, err);
        setError(err);
        setLoading(false);
        
        // Fallback to a default image
        import('../assets/images/avatar-1.jpg')
          .then(fallbackImage => {
            setImageUrl(fallbackImage.default);
          })
          .catch(() => {
            // If even the fallback fails, give up
            setImageUrl(null);
          });
      });
  }, [genreName]);

  return { imageUrl, loading, error };
}

export default useGenreImage; 