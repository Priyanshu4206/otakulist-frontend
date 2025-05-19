import api from '../axiosInstance';
import { processResponse } from '../responseHandler';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[PLAYLIST API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

/**
 * Playlist-related API calls
 */
const playlistAPI = {
  /**
   * Get all playlists for current user
   * @param {number} [page=1]
   * @param {number} [limit=20]
   * @returns {Promise<Object>} User playlists with pagination
   */
  getMyPlaylists: (page = 1, limit = 20) => {
    logger("Playlists", "Getting Current User's playlists", { page, limit });
    return processResponse(api.get('/playlists/my-playlists', { params: { page, limit } }));
  },

  /**
   * Get a playlist by ID
   * @param {string} playlistId
   * @returns {Promise<Object>} Playlist details
   */
  getPlaylistById: (playlistId) => {
    logger("Playlist", "Getting playlist by ID", { playlistId });
    return processResponse(api.get(`/playlists/id/${playlistId}`));
  },

  /**
   * Get a playlist by slug
   * @param {string} slug
   * @returns {Promise<Object>} Playlist details
   */
  getPlaylistBySlug: (slug) => {
    logger("Playlist", "Getting playlist by slug", { slug });
    return processResponse(api.get(`/playlists/${slug}`));
  },

  /**
   * Create a new playlist
   * @param {Object} playlistData - Playlist details
   * @param {string} playlistData.name - Name of the playlist (required)
   * @param {string} [playlistData.description] - Description of the playlist
   * @param {boolean} [playlistData.isPublic=true] - Whether the playlist is public
   * @param {Array<number>} [playlistData.animeIds=[]] - Initial anime IDs to add
   * @returns {Promise<Object>} Created playlist
   */
  createPlaylist: (playlistData) => {
    logger("Playlist", "Creating new playlist", playlistData);
    return processResponse(api.post('/playlists', playlistData));
  },

  /**
   * Create a new playlist or add anime to existing playlist
   * @param {Object} playlistData - Playlist details
   * @param {string} playlistData.playlistName - Name of the playlist
   * @param {number} playlistData.animeId - ID of the anime to add
   * @param {string} [playlistData.description] - Description for a new playlist
   * @param {boolean} [playlistData.isPublic=true] - Whether a new playlist is public
   * @returns {Promise<Object>} Created or updated playlist
   */
  createOrAddToPlaylist: (playlistData) => {
    logger("Playlist", "Creating playlist or adding anime", playlistData);
    return processResponse(api.post('/playlists/add-anime', playlistData));
  },

  /**
   * Update a playlist
   * @param {string} playlistId
   * @param {Object} playlistData - Updated playlist details
   * @param {string} [playlistData.name] - Updated name
   * @param {string} [playlistData.description] - Updated description
   * @param {boolean} [playlistData.isPublic] - Updated visibility
   * @returns {Promise<Object>} Updated playlist
   */
  updatePlaylist: (playlistId, playlistData) => {
    logger("Playlist", "Updating playlist", { playlistId, playlistData });
    return processResponse(api.patch(`/playlists/${playlistId}`, playlistData));
  },

  /**
   * Delete a playlist
   * @param {string} playlistId
   * @returns {Promise<Object>} Deletion result
   */
  deletePlaylist: (playlistId) => {
    logger("Playlist", "Deleting playlist", { playlistId });
    return processResponse(api.delete(`/playlists/${playlistId}`));
  },

  /**
   * Add anime to a playlist
   * @param {string} playlistId
   * @param {number} animeId
   * @returns {Promise<Object>} Updated playlist
   */
  addAnimeToPlaylist: (playlistId, animeId) => {
    logger("Playlist", "Adding anime to playlist", { playlistId, animeId });
    return processResponse(api.post(`/playlists/${playlistId}/anime`, { animeId }));
  },

  /**
   * Remove anime from a playlist
   * @param {string} playlistId
   * @param {number} animeId
   * @returns {Promise<Object>} Updated playlist
   */
  removeAnimeFromPlaylist: (playlistId, animeId) => {
    logger("Playlist", "Removing anime from playlist", { playlistId, animeId });
    return processResponse(api.delete(`/playlists/${playlistId}/anime/${animeId}`));
  },

  /**
   * Get playlists by username
   * @param {string} username
   * @param {number} [page=1]
   * @param {number} [limit=20]
   * @returns {Promise<Object>} User playlists with pagination
   */
  getUserPlaylists: (username, page = 1, limit = 20) => {
    logger("Playlists", "Getting playlists by username", { username, page, limit });
    return processResponse(api.get(`/playlists/user/${username}`, { params: { page, limit } }));
  },

  /**
   * Get all public playlists
   * @param {number} [page=1]
   * @param {number} [limit=20]
   * @returns {Promise<Object>} Public playlists with pagination
   */
  getPublicPlaylists: (page = 1, limit = 20) => {
    logger("Playlists", "Getting public playlists", { page, limit });
    return processResponse(api.get('/playlists/public', { params: { page, limit } }));
  },

  /**
   * Like or unlike a playlist
   * @param {string} playlistId
   * @returns {Promise<Object>} Updated like status and count
   */
  toggleLikePlaylist: (playlistId) => {
    logger("Playlist", "Toggling like on playlist", { playlistId });
    return processResponse(api.post(`/playlists/${playlistId}/like`));
  }
};

export default playlistAPI;