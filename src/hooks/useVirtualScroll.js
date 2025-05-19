import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for virtual scrolling to optimize large lists
 * 
 * @param {Array} items - The full list of items
 * @param {number} itemHeight - Height of each item in pixels
 * @param {number} overscan - Number of items to render outside viewport
 * @returns {Object} - Virtual scroll state and refs
 */
function useVirtualScroll(items = [], itemHeight = 200, overscan = 3) {
  const [visibleItems, setVisibleItems] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const totalHeight = items.length * itemHeight;
  
  // Calculate visible range based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, clientHeight } = scrollContainerRef.current;
    
    // Calculate visible range with overscan
    const firstIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const lastIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
    );
    
    setStartIndex(firstIndex);
    setEndIndex(lastIndex);
    
    // Update visible items
    setVisibleItems(
      items.slice(firstIndex, lastIndex + 1).map((item, idx) => ({
        ...item,
        virtualIndex: firstIndex + idx,
      }))
    );
  }, [items, itemHeight, overscan]);
  
  // Attach scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    calculateVisibleRange();
    
    const handleScroll = () => {
      // Use requestAnimationFrame to limit scroll calculations
      window.requestAnimationFrame(calculateVisibleRange);
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [calculateVisibleRange]);
  
  // Update visible range when items or dimensions change
  useEffect(() => {
    calculateVisibleRange();
  }, [items, itemHeight, calculateVisibleRange]);
  
  // Helper for scrolling to a specific index
  const scrollToIndex = useCallback((index) => {
    if (!scrollContainerRef.current) return;
    
    const scrollTop = index * itemHeight;
    scrollContainerRef.current.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }, [itemHeight]);
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    scrollContainerRef,
    totalHeight,
    scrollToIndex,
    
    // Style for container
    containerStyle: {
      height: '100%',
      overflow: 'auto',
      position: 'relative'
    },
    
    // Style for list wrapper to provide correct scrollable height
    innerStyle: {
      height: `${totalHeight}px`,
      position: 'relative',
      width: '100%'
    },
    
    // Helper to get style for individual items
    getItemStyle: (index) => ({
      position: 'absolute',
      top: `${index * itemHeight}px`,
      height: `${itemHeight}px`,
      width: '100%'
    })
  };
}

export default useVirtualScroll; 