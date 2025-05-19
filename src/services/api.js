/**
 * @fileoverview
 * This is a compatibility layer for maintaining backward compatibility with the old monolithic API structure.
 * It re-exports all the modular API modules from their new locations.
 * 
 * DEPRECATION NOTICE:
 * This file is deprecated and will be removed in a future version.
 * Please import directly from the module files instead:
 * 
 * // Instead of:
 * import { animeAPI } from '../services/api';
 * 
 * // Use:
 * import animeAPI from '../services/modules/animeAPI';
 * // or
 * import { animeAPI } from '../services/modules';
 */

import userAPI from './modules/userAPI';
import animeAPI from './modules/animeAPI';
import authAPI from './modules/authAPI';
import newsAPI from './modules/newsAPI';
import playlistAPI from './modules/playlistAPI';
import leaderboardAPI from './modules/leaderboardAPI';
import genreAPI  from './modules/genreAPI';
import { resetAuthFailedState } from './axiosInstance';
import recommendationAPI from './modules/recommendationAPI';
import scheduleAPI from './modules/scheduleAPI';
import searchAPI from './modules/searchAPI';
export {
  userAPI,
  animeAPI,
  genreAPI,
  authAPI,
  newsAPI,
  playlistAPI,
  leaderboardAPI,
  resetAuthFailedState,
  recommendationAPI,
  scheduleAPI,
  searchAPI
};
