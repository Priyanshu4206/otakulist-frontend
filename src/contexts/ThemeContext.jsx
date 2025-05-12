import { createContext, useState, useEffect } from 'react';
import { getUserTheme, saveUserTheme } from '../components/dashboard/SettingsPage';

// Helper function to convert hex to rgb values
const hexToRgb = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
};

// Define theme color palettes with improved contrast
export const themes = {
  'naruto-dark': {
    name: 'Naruto Dark',
    primary: '#FFA500', // Naruto Orange
    secondary: '#1E88E5', // Sasuke Blue
    tertiary: '#4CAF50', // Sakura Green
    background: '#16161B', // Dark Background (darkened slightly for better contrast)
    accent: '#FF8C00', // Darker Orange for better contrast
    textPrimary: '#FFFFFF', // Pure white for better readability
    textSecondary: '#E0E0E0', // Lighter gray for better contrast with dark background
    cardBackground: '#252530', // Slightly bluish dark for cards
    borderColor: '#3A3A45', // Slightly lighter border for visibility
    error: '#F44336', // Brighter red for better visibility
    success: '#4CAF50', // Using tertiary as success
    info: '#1E88E5', // Using secondary as info
    warning: '#FFC107', // Brighter yellow for better visibility
    // Additional shades
    primaryLight: '#FFB733', // Lighter Orange
    primaryDark: '#E67E00', // Darker Orange
    secondaryLight: '#64B5F6', // Lighter Blue
    secondaryDark: '#1565C0', // Darker Blue
    tertiaryLight: '#81C784', // Lighter Green
    tertiaryDark: '#388E3C', // Darker Green
    accentLight: '#FFB733', // Lighter accent
    accentDark: '#D67200', // Darker accent
    backgroundLight: '#252530', // surface/lighter background
    backgroundDark: '#0F0F12', // Darker background
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #FFA500 0%, #FFB733 100%)',
    gradientSecondary: 'linear-gradient(135deg, #1E88E5 0%, #64B5F6 100%)',
    gradientAccent: 'linear-gradient(135deg, #FF8C00 0%, #FFB733 100%)',
    gradientText: 'linear-gradient(135deg, #FFA500 0%, #FFB733 100%)',
    modalBackground: '#23243a',
    modalHeaderBackground: 'linear-gradient(90deg, #FFA500 0%, #FFB733 100%)',
    modalBorderColor: '#FFB733',
    modalOverlayColor: 'rgba(20, 20, 30, 0.85)',
  },
  dark: {
    name: 'Dark Mode',
    primary: '#6366F1',
    secondary: '#8B5CF6',
    tertiary: '#463671',
    background: '#0E0E12', // Darkened for better contrast with text
    accent: '#F59E0B',
    textPrimary: '#FFFFFF', // Pure white for better readability
    textSecondary: '#D1D5DB', // Lightened for better contrast
    cardBackground: '#1F1F28', // Slightly bluish for better distinction
    borderColor: '#383844', // Lightened for visibility
    error: '#EF4444',
    success: '#10B981',
    info: '#3B82F6',
    warning: '#F59E0B',
    // Additional shades
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondaryLight: '#A78BFA',
    secondaryDark: '#7C3AED',
    tertiaryLight: '#5A4A8E',
    tertiaryDark: '#382D5A',
    accentLight: '#FBBF24',
    accentDark: '#D97706',
    backgroundLight: '#1F1F28', // Slightly adjusted
    backgroundDark: '#0A0A0F', // Darker background
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
    gradientSecondary: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    gradientAccent: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    gradientText: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
    modalBackground: '#18181f',
    modalHeaderBackground: 'linear-gradient(90deg, #6366F1 0%, #818CF8 100%)',
    modalBorderColor: '#6366F1',
    modalOverlayColor: 'rgba(10, 10, 20, 0.85)',
  },
  light: {
    name: 'Light Mode',
    primary: '#4F46E5',
    secondary: '#7C3AED',
    tertiary: '#6D28D9',
    background: '#F9FAFB',
    accent: '#D97706',
    textPrimary: '#111827', // Darkened for better contrast
    textSecondary: '#4B5563', // Darkened for better contrast
    cardBackground: '#FFFFFF',
    borderColor: '#D1D5DB', // Darkened for better visibility
    error: '#DC2626', // Darkened for better contrast
    success: '#059669', // Darkened for better contrast
    info: '#2563EB', // Darkened for better contrast
    warning: '#D97706', // Darkened for better contrast
    // Additional shades
    primaryLight: '#6366F1',
    primaryDark: '#4338CA',
    secondaryLight: '#8B5CF6',
    secondaryDark: '#6D28D9',
    tertiaryLight: '#8B5CF6',
    tertiaryDark: '#5B21B6',
    accentLight: '#F59E0B',
    accentDark: '#B45309',
    backgroundLight: '#FFFFFF',
    backgroundDark: '#F3F4F6',
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    gradientSecondary: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    gradientAccent: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    gradientText: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    modalBackground: '#fff',
    modalHeaderBackground: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
    modalBorderColor: '#6366F1',
    modalOverlayColor: 'rgba(255,255,255,0.85)',
  },
  default: {
    name: 'Default Dark',
    primary: '#FBEFFA',
    secondary: '#EBBAF2',
    tertiary: '#463671',
    background: '#18171D',
    accent: '#E8C28D',
    textPrimary: '#FBEFFA',
    textSecondary: '#B8B8B8',
    cardBackground: '#252429',
    borderColor: '#303035',
    error: '#F87171',
    success: '#10B981',
    info: '#3B82F6',
    warning: '#FBBF24',
    // Additional shades
    primaryLight: '#FCF7FC',
    primaryDark: '#F0D9EF',
    secondaryLight: '#F2D1F7',
    secondaryDark: '#D992E0',
    tertiaryLight: '#5A4A8E',
    tertiaryDark: '#382D5A',
    accentLight: '#F2D6B0',
    accentDark: '#D1A96F',
    backgroundLight: '#252429',
    backgroundDark: '#121215',
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #FBEFFA 0%, #EBBAF2 100%)',
    gradientSecondary: 'linear-gradient(135deg, #463671 0%, #5A4A8E 100%)',
    gradientAccent: 'linear-gradient(135deg, #E8C28D 0%, #F2D6B0 100%)',
    gradientText: 'linear-gradient(135deg, #FBEFFA 0%, #EBBAF2 100%)',
    modalBackground: '#252429',
    modalHeaderBackground: 'linear-gradient(90deg, #FBEFFA 0%, #EBBAF2 100%)',
    modalBorderColor: '#EBBAF2',
    modalOverlayColor: 'rgba(24, 23, 29, 0.85)',
  },
  'one-piece': {
    name: 'One Piece',
    primary: '#D32F2F', // Luffy Red
    secondary: '#388E3C', // Zoro Green
    tertiary: '#FFA000', // Going Merry/Sunny
    background: '#0B3B82', // Deep Blue Sea (darkened)
    accent: '#FFC107', // Gold/treasure
    textPrimary: '#FFFFFF',
    textSecondary: '#E3F2FD',
    cardBackground: '#1055AF', // Lighter blue
    borderColor: '#1976D2',
    error: '#B71C1C',
    success: '#2E7D32',
    info: '#0288D1',
    warning: '#FFA000',
    // Additional shades
    primaryLight: '#EF5350',
    primaryDark: '#B71C1C',
    secondaryLight: '#66BB6A',
    secondaryDark: '#2E7D32',
    tertiaryLight: '#FFCA28',
    tertiaryDark: '#FF8F00',
    accentLight: '#FFD54F',
    accentDark: '#FFA000',
    backgroundLight: '#1055AF',
    backgroundDark: '#092E65',
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)',
    gradientSecondary: 'linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)',
    gradientAccent: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
    gradientText: 'linear-gradient(135deg, #D32F2F 0%, #FFC107 100%)',
    modalBackground: '#0B3B82',
    modalHeaderBackground: 'linear-gradient(90deg, #D32F2F 0%, #FFC107 100%)',
    modalBorderColor: '#FFC107',
    modalOverlayColor: 'rgba(11, 59, 130, 0.85)',
  },
  'attack-on-titan': {
    name: 'Attack on Titan',
    primary: '#8D6E63', // Wall color/Brown
    secondary: '#CFD8DC', // ODM Gear/Silver
    tertiary: '#43A047', // Scout Regiment Green
    background: '#121212', // Dark like the show
    accent: '#C62828', // Blood red
    textPrimary: '#EEEEEE',
    textSecondary: '#B0BEC5',
    cardBackground: '#1E1E1E',
    borderColor: '#424242',
    error: '#C62828',
    success: '#43A047',
    info: '#546E7A',
    warning: '#F57F17',
    // Additional shades
    primaryLight: '#A1887F',
    primaryDark: '#6D4C41',
    secondaryLight: '#ECEFF1',
    secondaryDark: '#B0BEC5',
    tertiaryLight: '#66BB6A',
    tertiaryDark: '#388E3C',
    accentLight: '#E53935',
    accentDark: '#B71C1C',
    backgroundLight: '#2D2D2D',
    backgroundDark: '#0A0A0A',
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #8D6E63 0%, #A1887F 100%)',
    gradientSecondary: 'linear-gradient(135deg, #CFD8DC 0%, #ECEFF1 100%)',
    gradientAccent: 'linear-gradient(135deg, #C62828 0%, #E53935 100%)',
    gradientText: 'linear-gradient(135deg, #C62828 0%, #E53935 100%)',
    modalBackground: '#1E1E1E',
    modalHeaderBackground: 'linear-gradient(90deg, #8D6E63 0%, #CFD8DC 100%)',
    modalBorderColor: '#8D6E63',
    modalOverlayColor: 'rgba(18, 18, 18, 0.85)',
  },
  'demon-slayer': {
    name: 'Demon Slayer',
    primary: '#24AE60', // Tanjiro Green
    secondary: '#0C71C3', // Water Breathing Blue  
    tertiary: '#FBA919', // Zenitsu Yellow
    background: '#14151F', // Night Dark Blue
    accent: '#E61A50', // Nezuko Red
    textPrimary: '#FFFFFF',
    textSecondary: '#B8C6DB',
    cardBackground: '#1C1E2E',
    borderColor: '#363A54',
    error: '#E61A50',
    success: '#24AE60',
    info: '#0C71C3',
    warning: '#FBA919',
    // Additional shades
    primaryLight: '#3DD179',
    primaryDark: '#198F4D',
    secondaryLight: '#2388DB',
    secondaryDark: '#085A9D',
    tertiaryLight: '#FBB746',
    tertiaryDark: '#D89106',
    accentLight: '#FA3A69',
    accentDark: '#C20037',
    backgroundLight: '#1C1E2E',
    backgroundDark: '#0C0D14',
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #24AE60 0%, #3DD179 100%)',
    gradientSecondary: 'linear-gradient(135deg, #0C71C3 0%, #2388DB 100%)',
    gradientAccent: 'linear-gradient(135deg, #E61A50 0%, #FA3A69 100%)',
    gradientText: 'linear-gradient(135deg, #24AE60 0%, #FA3A69 100%)',
    modalBackground: '#1C1E2E',
    modalHeaderBackground: 'linear-gradient(90deg, #24AE60 0%, #E61A50 100%)',
    modalBorderColor: '#E61A50',
    modalOverlayColor: 'rgba(20, 21, 31, 0.85)',
  },
  'jujutsu-kaisen': {
    name: 'Jujutsu Kaisen',
    primary: '#4F46E5', // Purple/Blue
    secondary: '#334155', // Dark Gray
    tertiary: '#94A3B8', // Light Gray
    background: '#0F172A', // Very Dark Blue
    accent: '#DC2626', // Cursed Energy Red
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    cardBackground: '#1E293B',
    borderColor: '#334155',
    error: '#DC2626',
    success: '#16A34A',
    info: '#3B82F6',
    warning: '#FBBF24',
    // Additional shades
    primaryLight: '#6366F1',
    primaryDark: '#4338CA',
    secondaryLight: '#475569',
    secondaryDark: '#1E293B',
    tertiaryLight: '#CBD5E1',
    tertiaryDark: '#64748B',
    accentLight: '#EF4444',
    accentDark: '#B91C1C',
    backgroundLight: '#1E293B',
    backgroundDark: '#020617',
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    gradientSecondary: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    gradientAccent: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    gradientText: 'linear-gradient(135deg, #4F46E5 0%, #DC2626 100%)',
    modalBackground: '#1E293B',
    modalHeaderBackground: 'linear-gradient(90deg, #4F46E5 0%, #DC2626 100%)',
    modalBorderColor: '#DC2626',
    modalOverlayColor: 'rgba(15, 23, 42, 0.85)',
  },
};

// Set default theme key
export const DEFAULT_THEME = 'naruto-dark';

// Create context with default value
const ThemeContext = createContext({
  currentTheme: DEFAULT_THEME,
  changeTheme: () => {},
  isDarkMode: true,
  availableThemes: themes // Add availableThemes to the context
});

export const ThemeProvider = ({ children }) => {
  // Initialize with theme from localStorage or default
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get theme from localStorage on initial render
    const storedTheme = getUserTheme();
    return storedTheme;
  });
  
  // Apply theme CSS variables with smooth transitions
  useEffect(() => {
    const theme = themes[currentTheme] || themes[DEFAULT_THEME];
    const root = document.documentElement;
        
    // Add transition properties for smooth theme switching
    // We add the transition at the beginning to ensure it applies to all changes
    root.style.setProperty('transition', 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease');
    
    // Apply all theme properties as CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      if (key === 'name') return; // Skip the name property
      
      // Handle RGB conversion for certain properties
      if (typeof value === 'string' && value.startsWith('#') && !value.includes('gradient')) {
        const rgb = hexToRgb(value);
        root.style.setProperty(`--${key}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
      
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply theme-specific class to body for CSS selectors
    // Remove all theme classes first
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.endsWith('-theme'))
      .join(' ');
    
    // Add the current theme class
    document.body.classList.add(`${currentTheme}-theme`);
    
    // Store theme preference
    saveUserTheme(currentTheme);
    
  }, [currentTheme]);
  
  // Helper to check if theme uses lighter colors (for contrast purposes)
  const isThemeDark = (themeName) => {
    return themeName !== 'light' && themeName !== 'one-piece';
  };
  
  // Function to change theme with improved transition handling
  const changeTheme = (themeName) => {
    // Validate theme exists, fallback to default
    if (!themes[themeName]) {
      console.warn(`Theme "${themeName}" not found, using default theme.`);
      themeName = DEFAULT_THEME;
    }
        
    // Add transition class to root element before changing theme
    document.documentElement.classList.add('theme-transition-active');
    
    // Apply the new theme
    setCurrentTheme(themeName);
    saveUserTheme(themeName);
    
    // Remove transition class after animation completes to prevent transition buildup
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition-active');
    }, 500); // Match this with your transition duration
  };
  
  return (
    <ThemeContext.Provider value={{
      currentTheme,
      changeTheme,
      isDarkMode: isThemeDark(currentTheme),
      availableThemes: themes // Provide availableThemes in the context
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;