# OtakuList Frontend [Live Demo](https://otakulist-frontend-v1.vercel.app/)

A modern React application for anime enthusiasts to discover, track, and share anime.

## Features

- **Schedule Page**: View anime schedule by day of the week
- **Anime Details**: Comprehensive information about each anime
- **Search & Filters**: Find anime by genre, rating, and more
- **Authentication**: Google OAuth integration
- **User Achievements**: Track progress and earn achievements as you watch anime
- **Custom Themes**: Multiple anime-themed UI options with user preference syncing
- **User Profiles**: Public profiles with achievements, watchlist stats, and social features
- **Dashboard**: Personalized dashboard with stats, watchlist, and settings
- **Caching System**: Efficient API caching for better performance

## Tech Stack

- **Frontend Framework**: React (Functional Components + Hooks)
- **Styling**: Styled Components
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Animations**: Anime.js (to be implemented)
- **API Integration**: Axios
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/otakulist-frontend-v2.git
   cd otakulist-frontend-v2
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

- `/src/components`: Reusable UI components
- `/src/pages`: Page components
- `/src/contexts`: React Context providers
- `/src/hooks`: Custom React hooks
- `/src/services`: API services
- `/src/styles`: Global styles
- `/src/assets`: Static assets

## Theme System

The application features multiple themes, including:
- Default Dark
- Light Mode
- Naruto Dark
- One Piece
- Attack on Titan

Themes are synchronized with the backend and persisted across sessions.

## Achievement System

Users can earn achievements in multiple categories:
- Anime watching achievements (based on completed count)
- Collection achievements
- Social achievements
- Genre-specific achievements
- Special achievements

The achievement progress is visually displayed and synced with the backend.

## Backend Integration

This frontend connects to the Anime-Share backend API at:
`https://otaku-backend.jumpingcrab.com/api/v1`

## License

MIT

## Profile Page Updates

### Instagram-like Mobile Experience

The profile page has been updated to provide an Instagram-like experience on mobile devices while preserving all functionality:

1. **Mobile-specific Header**
   - Custom header component that only appears on mobile screens
   - User avatar alongside username and display name in a horizontal layout
   - Followers/Following stats displayed prominently
   - Action buttons (Follow/Unfollow, Share) optimized for mobile

2. **Responsive Layout**
   - Desktop view shows sidebar with profile info and main content area
   - Mobile view hides sidebar and shows the mobile-specific header instead
   - Content adapts to screen size with appropriate spacing and font sizes

3. **Improved Component Styling**
   - Profile info reorganized for better mobile experience
   - Achievements grid adjusts columns based on screen size
   - Playlists display in a grid optimized for mobile viewing
   - Pagination controls sized appropriately for touch interactions

4. **Visual Enhancements**
   - Consistent styling across all profile components
   - Better use of whitespace on mobile screens
   - Optimized touch targets for mobile interactions
   - Improved visual hierarchy for important information

### Web View Improvements

The desktop experience has also been enhanced:

1. **Better Grid Layout**
   - More balanced column proportions for profile sidebar and content
   - Improved spacing between elements

2. **Visual Consistency**
   - Updated styling for cards, buttons, and interactive elements
   - Consistent hover and active states

3. **Enhanced Playlists**
   - Updated playlist card design
   - Better visual feedback for interactive elements

These changes ensure a cohesive experience across all device sizes while maintaining the application's functionality.
"# otakulist-frontend" 
