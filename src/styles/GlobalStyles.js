import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Theme variables are set dynamically by ThemeContext */
    
    /* Layout sizes */
    --sidebar-width: 240px;
    --sidebar-collapsed-width: 60px;
    --header-height: 60px;
    
    /* Toast specific vars (fallback values, will be overridden by theme) */
    --success: #10B981;
    --success-rgb: 16, 185, 129;
    --danger: #EF4444;
    --danger-rgb: 239, 68, 68;
    --warning: #F59E0B;
    --warning-rgb: 245, 158, 11;
    --info: #3B82F6;
    --info-rgb: 59, 130, 246;
    --white: #FFFFFF;
    --dangerLight: rgba(239, 68, 68, 0.1);
    --dangerDark: #B91C1C;
    
    /* Default transitions for theme changes */
    --theme-transition: 0.4s ease;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    color: var(--textPrimary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color var(--theme-transition), color var(--theme-transition);
    min-height: 100%;
    width: 100%;
  }

  /* Add smooth transitions to common elements */
  h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, select, textarea {
    transition: color var(--theme-transition), background-color var(--theme-transition), border-color var(--theme-transition), box-shadow var(--theme-transition);
  }

  /* Apply transitions to cards, buttons, and other UI elements */
  div[class*="Card"], div[class*="Container"], button, select, input, textarea, header, footer, nav, aside {
    transition: background-color var(--theme-transition), 
                color var(--theme-transition), 
                border-color var(--theme-transition),
                box-shadow var(--theme-transition);
  }

  a {
    color: var(--primary);
    text-decoration: none;
    transition: color var(--theme-transition);
    
    &:hover {
      color: var(--primaryLight);
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  /* Layout */
  .app-container {
    display: flex;
    min-height: 100dvh;
  }

  .main-content {
    flex: 1;
    padding: 1.5rem;
    margin-left: var(--sidebar-collapsed-width);
    transition: margin-left 0.3s ease, background-color var(--theme-transition);

    @media (max-width: 768px) {
      margin-left: 0;
      padding: 1rem;
    }
  }

  /* Utility classes */
  .container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .text-center {
    text-align: center;
  }

  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-5 { margin-top: 1.25rem; }

  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-5 { margin-bottom: 1.25rem; }
  
  /* Root element background color */
  #root {
    min-height: 100dvh;
    transition: background-color var(--theme-transition);
    overflow: visible !important;
    position: relative;
    z-index: 0;
  }

  /* Special class for transition periods */
  .theme-transition-active {
    /* Add transitions to all elements during theme changes */
    transition: background-color var(--theme-transition),
                color var(--theme-transition),
                border-color var(--theme-transition),
                box-shadow var(--theme-transition) !important;
  }
  
  /* Ensure body allows for overflow elements */
  body {
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
  }
  
  .theme-transition-active * {
    transition: background-color var(--theme-transition),
                color var(--theme-transition),
                border-color var(--theme-transition),
                box-shadow var(--theme-transition) !important;
  }

    /* Hide Scrollbars */
  ::-webkit-scrollbar {
    display: none;
  }
  
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

export default GlobalStyles; 