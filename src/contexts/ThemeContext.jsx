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
// Define theme color palettes with improved contrast for anime themes
export const themes = {
  'naruto-dark': {
    name: 'Naruto Dark',
    primary: '#FF7800', // Naruto Orange - slightly more vibrant
    secondary: '#2B4C9B', // Sasuke Blue - deeper blue for better contrast
    tertiary: '#7ED957', // Sakura Green - vibrant for chakra feeling
    background: '#1A1A24', // Dark ninja night background
    accent: '#E83C41', // Akatsuki cloud red
    textPrimary: '#FFFFFF', // Pure white for better readability
    textSecondary: '#E0E0E0', // Lighter gray for better contrast
    cardBackground: '#272736', // Slightly bluish dark for cards
    borderColor: '#3D3D52', // Subtle border for scrolls/UI elements
    error: '#FF4D4D', // Bright red like Kurama chakra
    success: '#7ED957', // Using tertiary as success
    info: '#4D9DE0', // Rasengan blue
    warning: '#FFD166', // Kyuubi chakra yellow
    // Additional shades
    primaryLight: '#FFA64D', // Lighter Orange
    primaryDark: '#E56300', // Darker Orange
    secondaryLight: '#5B79C7', // Sasuke lightning
    secondaryDark: '#203872', // Darker Blue like Sasuke's clothing
    tertiaryLight: '#A2EC85', // Lighter Green for healing jutsu
    tertiaryDark: '#52AF2C', // Darker Green
    accentLight: '#F76065', // Lighter Akatsuki red
    accentDark: '#C32328', // Darker accent
    backgroundLight: '#272736', // surface/lighter background
    backgroundDark: '#12121B', // Darker background
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #FF7800 0%, #FFA64D 100%)',
    gradientSecondary: 'linear-gradient(135deg, #2B4C9B 0%, #5B79C7 100%)',
    gradientAccent: 'linear-gradient(135deg, #E83C41 0%, #F76065 100%)',
    gradientText: 'linear-gradient(135deg, #FF7800 0%, #FFA64D 100%)',
    modalBackground: '#23243A',
    modalHeaderBackground: 'linear-gradient(90deg, #FF7800 0%, #FFA64D 100%)',
    modalBorderColor: '#FF7800',
    modalOverlayColor: 'rgba(26, 26, 36, 0.85)',
  },
  'attack-on-titan': {
    name: 'Attack on Titan',
    primary: '#A67951', // Wall/Titan skin color
    secondary: '#536D81', // Scout Regiment uniform blue-gray
    tertiary: '#4E7F3A', // Scout Regiment cape green
    background: '#0F0F11', // Dark like the show's atmosphere
    accent: '#B71C1C', // Blood red
    textPrimary: '#F0F0F0', // Off-white for parchment feel
    textSecondary: '#B0BEC5', // Grayish for worn look
    cardBackground: '#1D1D20', // Stone-like texture dark
    borderColor: '#3A3A40', // Walls
    error: '#B71C1C', // Blood red
    success: '#4E7F3A', // Scout green
    info: '#536D81', // ODM gear blue-gray
    warning: '#C99D66', // Wood/leather color
    // Additional shades
    primaryLight: '#BF9777', // Lighter wall color
    primaryDark: '#805C3D', // Darker wall
    secondaryLight: '#7990A3', // Lighter ODM gear
    secondaryDark: '#3A4C5A', // Darker uniform
    tertiaryLight: '#6DA352', // Lighter cape
    tertiaryDark: '#3A6029', // Darker cape green
    accentLight: '#D32F2F', // Brighter blood red
    accentDark: '#8B0000', // Darker blood
    backgroundLight: '#1D1D20', // Slightly lighter dark
    backgroundDark: '#080809', // Titan basement dark
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #A67951 0%, #BF9777 100%)',
    gradientSecondary: 'linear-gradient(135deg, #536D81 0%, #7990A3 100%)',
    gradientAccent: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)',
    gradientText: 'linear-gradient(135deg, #F0F0F0 0%, #B0BEC5 100%)',
    modalBackground: '#1D1D20',
    modalHeaderBackground: 'linear-gradient(90deg, #A67951 0%, #B71C1C 100%)',
    modalBorderColor: '#536D81',
    modalOverlayColor: 'rgba(15, 15, 17, 0.85)',
  },
  'demon-slayer': {
    name: 'Demon Slayer',
    primary: '#24A66B', // Tanjiro Green - slightly adjusted
    secondary: '#0A5CD1', // Water Breathing Blue - deeper
    tertiary: '#FFC107', // Zenitsu Yellow - vibrant
    background: '#0E1223', // Darker night for demons
    accent: '#E3175D', // Nezuko Pink-Red - vibrant
    textPrimary: '#FFFFFF', // Pure white
    textSecondary: '#C7CDE8', // Light blue-tinted gray
    cardBackground: '#1A1F37', // Deeper blue-night
    borderColor: '#303A5C', // Hashira uniform edge
    error: '#E3175D', // Nezuko Pink-Red
    success: '#24A66B', // Tanjiro Green
    info: '#0A5CD1', // Water Blue
    warning: '#FFC107', // Zenitsu Yellow
    // Additional shades
    primaryLight: '#35D989', // Lighter Green
    primaryDark: '#1A7F52', // Darker Green
    secondaryLight: '#2A7AEF', // Lightning blue
    secondaryDark: '#0848A3', // Darker blue
    tertiaryLight: '#FFD54F', // Lighter Yellow
    tertiaryDark: '#FFA000', // Darker Yellow
    accentLight: '#F63977', // Lighter pink-red
    accentDark: '#B91048', // Deeper pink-red
    backgroundLight: '#1A1F37', // Lighter night
    backgroundDark: '#090C18', // Deepest night
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #24A66B 0%, #35D989 100%)',
    gradientSecondary: 'linear-gradient(135deg, #0A5CD1 0%, #2A7AEF 100%)',
    gradientAccent: 'linear-gradient(135deg, #E3175D 0%, #F63977 100%)',
    gradientText: 'linear-gradient(135deg, #FFFFFF 0%, #C7CDE8 100%)',
    modalBackground: '#1A1F37',
    modalHeaderBackground: 'linear-gradient(90deg, #24A66B 0%, #E3175D 100%)',
    modalBorderColor: '#E3175D',
    modalOverlayColor: 'rgba(14, 18, 35, 0.85)',
  },
  'solo-leveling-dark': {
    name: 'Solo Leveling Dark Blue',
    primary: '#41A6F6', // Status window blue
    secondary: '#1E3A5F', // Dark blue hunter uniform
    tertiary: '#3CEC97', // System message green
    background: '#0A121F', // Shadow monarch darkness
    accent: '#BB86FC', // Purple magic/gates
    textPrimary: '#FFFFFF', // White text
    textSecondary: '#A0B4CC', // Blue-tinged secondary text
    cardBackground: '#15243A', // Status window background
    borderColor: '#2A405C', // Window border
    error: '#FF5252', // Danger red
    success: '#3CEC97', // System success green
    info: '#41A6F6', // Info blue
    warning: '#FFAB40', // Warning amber
    // Additional shades
    primaryLight: '#68B9F8', // Lighter blue
    primaryDark: '#2D88D8', // Darker blue
    secondaryLight: '#2C527E', // Lighter navy blue
    secondaryDark: '#132A45', // Darker navy
    tertiaryLight: '#67F5B1', // Lighter system green
    tertiaryDark: '#2BC77E', // Darker system green
    accentLight: '#CFACFD', // Lighter magic purple
    accentDark: '#9A67EA', // Darker magic purple
    backgroundLight: '#15243A', // Lighter shadow
    backgroundDark: '#060B15', // Deeper shadow
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #41A6F6 0%, #68B9F8 100%)',
    gradientSecondary: 'linear-gradient(135deg, #1E3A5F 0%, #2C527E 100%)',
    gradientAccent: 'linear-gradient(135deg, #BB86FC 0%, #CFACFD 100%)',
    gradientText: 'linear-gradient(135deg, #FFFFFF 0%, #A0B4CC 100%)',
    modalBackground: '#15243A',
    modalHeaderBackground: 'linear-gradient(90deg, #41A6F6 0%, #BB86FC 100%)',
    modalBorderColor: '#41A6F6',
    modalOverlayColor: 'rgba(10, 18, 31, 0.85)',
  },
  'solo-leveling-purple': {
    name: 'Solo Leveling Purple',
    primary: '#8E42D1', // Shadow monarch purple - darker
    secondary: '#4B1480', // Deeper royal purple - more saturated
    tertiary: '#23856E', // Teal for skills - darker
    background: '#0A001A', // Deep purple-black - even darker
    accent: '#2F5FC8', // Magic blue - deeper
    textPrimary: '#FFFFFF', // White text
    textSecondary: '#B6A0D1', // Light purple text - slightly darker
    cardBackground: '#1A0033', // Status window purple - darker
    borderColor: '#2E0852', // Window border purple - darker
    error: '#E03E3E', // Error red - deeper
    success: '#2DA363', // Success green - darker
    info: '#2969C6', // Info blue - deeper
    warning: '#E67E00', // Warning orange - deeper
    // Additional shades
    primaryLight: '#A668DE', // Lighter purple - toned down
    primaryDark: '#6A2C9E', // Darker purple - deeper
    secondaryLight: '#661AA4', // Medium purple - darker
    secondaryDark: '#360D5A', // Darkest purple - deeper
    tertiaryLight: '#32A994', // Lighter teal - darker
    tertiaryDark: '#1A6652', // Deeper teal - darker
    accentLight: '#4776E0', // Lighter magic blue - darker
    accentDark: '#1B4AA8', // Deeper magic blue - darker
    backgroundLight: '#1A0033', // Lighter background - darker
    backgroundDark: '#050010', // Deepest background - darker
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #8E42D1 0%, #A668DE 100%)',
    gradientSecondary: 'linear-gradient(135deg, #4B1480 0%, #661AA4 100%)',
    gradientAccent: 'linear-gradient(135deg, #2F5FC8 0%, #4776E0 100%)',
    gradientText: 'linear-gradient(135deg, #FFFFFF 0%, #B6A0D1 100%)',
    modalBackground: '#1A0033',
    modalHeaderBackground: 'linear-gradient(90deg, #8E42D1 0%, #4B1480 100%)',
    modalBorderColor: '#8E42D1',
    modalOverlayColor: 'rgba(10, 0, 26, 0.9)',
  },
  'jujutsu-kaisen': {
    name: 'Jujutsu Kaisen',
    primary: '#5438DC', // Gojo's blue/purple
    secondary: '#303B4D', // Dark uniform gray
    tertiary: '#7E889A', // Lighter uniform gray
    background: '#0D1117', // Cursed energy dark
    accent: '#EF2D56', // Blood/Sukuna red
    textPrimary: '#F5F9FF', // Clean white with slight blue tint
    textSecondary: '#A2AEC1', // Subdued blue-gray
    cardBackground: '#1B2536', // Domain expansion background
    borderColor: '#303B4D', // Uniform trim
    error: '#EF2D56', // Sukuna red
    success: '#1ABC9C', // Teal for Megumi's shikigami
    info: '#4361EE', // Cursed energy blue
    warning: '#F7B801', // Nobara's hammer glow
    // Additional shades
    primaryLight: '#7258F6', // Lighter cursed energy
    primaryDark: '#392CBD', // Darker Gojo blue
    secondaryLight: '#4A5568', // Lighter uniform
    secondaryDark: '#1E262F', // Darker uniform
    tertiaryLight: '#A0AAC0', // Lightest gray
    tertiaryDark: '#5E6B81', // Darker gray
    accentLight: '#FF5377', // Lighter blood red
    accentDark: '#D01B41', // Darker blood red
    backgroundLight: '#1B2536', // Lighter cursed energy
    backgroundDark: '#07090D', // Deepest cursed energy
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #5438DC 0%, #7258F6 100%)',
    gradientSecondary: 'linear-gradient(135deg, #303B4D 0%, #4A5568 100%)',
    gradientAccent: 'linear-gradient(135deg, #EF2D56 0%, #FF5377 100%)',
    gradientText: 'linear-gradient(135deg, #5438DC 0%, #7258F6 100%)',
    modalBackground: '#1B2536',
    modalHeaderBackground: 'linear-gradient(90deg, #5438DC 0%, #EF2D56 100%)',
    modalBorderColor: '#5438DC',
    modalOverlayColor: 'rgba(13, 17, 23, 0.85)',
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