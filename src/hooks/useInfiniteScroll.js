import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for implementing infinite scrolling
 * 
 * @param {Function} loadMore - Function to load more items
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {number} threshold - IntersectionObserver threshold
 * @param {number} rootMargin - IntersectionObserver rootMargin
 * @returns {Object} - Scroll state and control functions
 */
function useInfiniteScroll(loadMore, hasMore, threshold = 0.5, rootMargin = '100px') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(loadMore);
  
  // Update ref when loadMore function changes
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  // Callback for when the target element is visible
  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    
    // If element is visible and we have more items to load and not currently loading
    if (entry.isIntersecting && hasMore && !loading) {
      setLoading(true);
      setError(null);
      
      try {
        // Call the loadMore function
        const loadMorePromise = loadMoreRef.current();
        
        // If loadMore returns a promise, wait for it
        if (loadMorePromise instanceof Promise) {
          loadMorePromise
            .then(() => {
              setLoading(false);
            })
            .catch((err) => {
              console.error('Error loading more items:', err);
              setError(err.message || 'Failed to load more items');
              setLoading(false);
            });
        } else {
          // If not a promise, loading is done
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in loadMore function:', err);
        setError(err.message || 'Error loading more items');
        setLoading(false);
      }
    }
  }, [hasMore, loading]);

  // Ref to attach to the element that triggers loading more
  const observedRef = useCallback((node) => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer if we have a node and more items to load
    if (node && hasMore) {
      const options = {
        root: null, // viewport
        rootMargin,
        threshold
      };
      
      const observer = new IntersectionObserver(handleObserver, options);
      observer.observe(node);
      observerRef.current = observer;
    }
  }, [hasMore, handleObserver, rootMargin, threshold]);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    loading,
    error,
    observedRef
  };
}

export default useInfiniteScroll; 