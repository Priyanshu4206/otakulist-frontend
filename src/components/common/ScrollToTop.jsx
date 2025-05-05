import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls the window to the top whenever
 * the pathname or search parameters in the URL change.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();
  
  useEffect(() => {
    // If there's a hash in the URL (e.g., #section), don't scroll to top
    // This allows anchor links to work correctly
    if (hash) return;
    
    // Scroll to top with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname, search, hash]); // Re-run the effect when route changes
  
  return null; // This component doesn't render anything
};

export default ScrollToTop; 