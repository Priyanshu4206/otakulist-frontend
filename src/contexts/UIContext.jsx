import { createContext, useState, useEffect } from 'react';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // Set isSidebarOpen to false as the default state (sidebar collapsed)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  // Change hover mode to track navigation item hover instead of sidebar hover
  const [isNavHovered, setIsNavHovered] = useState(false);

  // Check if we're in mobile view on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Check initially
    checkIfMobile();

    // Add listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Open sidebar
  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Function to handle nav item mouse enter
  const handleNavMouseEnter = () => {
    setIsNavHovered(true);
  };

  // Function to handle nav item mouse leave
  const handleNavMouseLeave = () => {
    setIsNavHovered(false);
  };

  const value = {
    isSidebarOpen,
    isMobileView,
    isNavHovered,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    handleNavMouseEnter,
    handleNavMouseLeave
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export default UIContext; 