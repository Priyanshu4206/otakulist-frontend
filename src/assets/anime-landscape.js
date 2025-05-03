import mhaTheme from "../assets/images/dark-nebula.jpg";
import darkTheme from "../assets/images/dark-theme.jpg";
import narutoBg from "../assets/images/naruto-bg.webp";

// Anime-themed background images
export const backgroundImages = [mhaTheme, darkTheme, narutoBg];

// Theme-based gradient overlays
export const themeGradients = {
  // Theme-specific gradients matching the theme keys in ThemeContext
  "naruto-dark": "linear-gradient(135deg, rgba(22, 22, 27, 0.7) 0%, rgba(15, 15, 18, 0.8) 100%)",
  "dark": "linear-gradient(135deg, rgba(14, 14, 18, 0.75) 0%, rgba(10, 10, 15, 0.85) 100%)",
  "light": "linear-gradient(135deg, rgba(249, 250, 251, 0.7) 0%, rgba(243, 244, 246, 0.8) 100%)",
  "default": "linear-gradient(135deg, rgba(24, 23, 29, 0.75) 0%, rgba(18, 18, 21, 0.85) 100%)",
  "one-piece": "linear-gradient(135deg, rgba(11, 59, 130, 0.7) 0%, rgba(9, 46, 101, 0.8) 100%)",
  "attack-on-titan": "linear-gradient(135deg, rgba(18, 18, 18, 0.8) 0%, rgba(10, 10, 10, 0.85) 100%)",
  "demon-slayer": "linear-gradient(135deg, rgba(20, 21, 31, 0.75) 0%, rgba(12, 13, 20, 0.85) 100%)",
  "jujutsu-kaisen": "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(2, 6, 23, 0.85) 100%)",
  
  // Fallback gradients (used when specific theme gradient is not found)
  fallbackLight: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 240, 250, 0.85) 100%)",
  fallbackDark: "linear-gradient(135deg, rgba(20, 20, 35, 0.8) 0%, rgba(10, 10, 25, 0.85) 100%)",
};

// Accent colors for animations
export const accentColors = {
  primary: "#6366F1",
  secondary: "#4F46E5",
  accent1: "#F472B6",
  accent2: "#34D399",
  accent3: "#FBBF24",
};

// SVG elements for animations
export const svgElements = {
  star: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
  </svg>`,

  cloud: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"></path>
  </svg>`,

  sakura: `<svg viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor">
    <path d="M50 0 C60 25 75 40 100 50 C75 60 60 75 50 100 C40 75 25 60 0 50 C25 40 40 25 50 0 Z"></path>
  </svg>`,
};

// Anime-inspired quotes for the hero section
export const animeQuotes = [
  { text: "Whatever happens, happens.", author: "Spike Spiegel, Cowboy Bebop" },
  {
    text: "I'll take a potato chip... and eat it!",
    author: "Light Yagami, Death Note",
  },
  {
    text: "The world isn't perfect. But it's there for us, doing the best it can.",
    author: "Roy Mustang, Fullmetal Alchemist",
  },
  {
    text: "If you don't take risks, you can't create a future!",
    author: "Monkey D. Luffy, One Piece",
  },
  {
    text: "It's not the face that makes someone a monster; it's the choices they make.",
    author: "Naruto Uzumaki, Naruto",
  },
];

// Feature list for home page
export const featuresList = [
  {
    title: "Extensive Anime Database",
    description:
      "Access our comprehensive collection of over 15,000 anime titles with detailed information, ratings, and reviews.",
    icon: "Database",
    gradient: "linear-gradient(135deg, #6366F1 0%, #A78BFA 100%)",
  },
  {
    title: "Personalized Recommendations",
    description:
      "Discover new anime tailored to your taste through our advanced recommendation algorithm.",
    icon: "Sparkles",
    gradient: "linear-gradient(135deg, #F472B6 0%, #EC4899 100%)",
  },
  {
    title: "Real-time Schedules",
    description:
      "Stay updated with accurate airing schedules and never miss a new episode of your favorite shows.",
    icon: "Calendar",
    gradient: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
  },
  {
    title: "Custom Watch Lists",
    description:
      "Create and manage multiple watch lists to organize your anime by any criteria you choose.",
    icon: "ListChecks",
    gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
  },
  {
    title: "Social Community",
    description:
      "Connect with fellow anime enthusiasts, share recommendations, and participate in discussions.",
    icon: "Users",
    gradient: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
  },
  {
    title: "Synchronization Across Devices",
    description:
      "Access your account and lists seamlessly across all your devices with our cloud synchronization.",
    icon: "Cloud",
    gradient: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
  },
];
