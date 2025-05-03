# Anime-Share Frontend

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
"# otakulist-frontend" 
