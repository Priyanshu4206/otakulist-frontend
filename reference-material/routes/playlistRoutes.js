const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { standardLimiter, userActionLimiter } = require('../middleware/rateLimiter');
const { validateParams } = require('../middleware/validation');
const { 
  createPlaylist, 
  getPlaylist, 
  updatePlaylist, 
  deletePlaylist, 
  addAnimeToPlaylist, 
  removeAnimeFromPlaylist, 
  toggleLike 
} = require('../controllers/playlistController');
const Joi = require('joi');

// Validation schemas
const createPlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow('', null),
  isPublic: Joi.boolean().default(true),
  animeIds: Joi.array().items(Joi.number().integer()).default([])
});

const updatePlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().allow('', null),
  isPublic: Joi.boolean()
});

const addAnimeSchema = Joi.object({
  animeId: Joi.number().integer().required()
});

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Create a new playlist
 *     description: Create a new anime playlist with optional initial anime entries
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Name of the playlist
 *                 example: "My Favorite Shonen Anime"
 *               description:
 *                 type: string
 *                 description: Description of the playlist
 *                 example: "A collection of my favorite shonen anime series"
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the playlist is publicly viewable
 *                 example: true
 *               animeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Initial anime IDs to add to the playlist
 *                 example: [5114, 11061, 30276]
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a12b5e67d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "My Favorite Shonen Anime"
 *                     slug:
 *                       type: string
 *                       example: "my-favorite-shonen-anime-60a12b5e"
 *                     description:
 *                       type: string
 *                       example: "A collection of my favorite shonen anime series"
 *                     isPublic:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                         username:
 *                           type: string
 *                           example: "animefan123"
 *                     animeCount:
 *                       type: integer
 *                       example: 3
 *                     likesCount:
 *                       type: integer
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T14:30:00.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', protect, standardLimiter, validateParams(createPlaylistSchema, 'body'), createPlaylist);

/**
 * @swagger
 * /playlists/{slug}:
 *   get:
 *     summary: Get playlist by slug
 *     description: Retrieve a playlist by its unique slug. Authentication is optional and provides additional data if the user owns the playlist.
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug identifier for the playlist
 *         example: "my-favorite-shonen-anime-60a12b5e"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved playlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a12b5e67d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "My Favorite Shonen Anime"
 *                     slug:
 *                       type: string
 *                       example: "my-favorite-shonen-anime-60a12b5e"
 *                     description:
 *                       type: string
 *                       example: "A collection of my favorite shonen anime series"
 *                     isPublic:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                         username:
 *                           type: string
 *                           example: "animefan123"
 *                         avatarUrl:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                     anime:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5114
 *                           title:
 *                             type: string
 *                             example: "Fullmetal Alchemist: Brotherhood"
 *                           image:
 *                             type: string
 *                             example: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg"
 *                           synopsis:
 *                             type: string
 *                             example: "After a horrific alchemy experiment goes wrong..."
 *                           type:
 *                             type: string
 *                             example: "TV"
 *                           score:
 *                             type: number
 *                             format: float
 *                             example: 9.13
 *                     likesCount:
 *                       type: integer
 *                       example: 15
 *                     isLiked:
 *                       type: boolean
 *                       example: false
 *                     isOwner:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T14:30:00.000Z"
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', optionalAuth, standardLimiter, getPlaylist);

/**
 * @swagger
 * /playlists/{id}:
 *   patch:
 *     summary: Update playlist
 *     description: Update an existing playlist's details
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the playlist to update
 *         example: "60a12b5e67d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: New name for the playlist
 *                 example: "Updated Shonen Anime Collection"
 *               description:
 *                 type: string
 *                 description: Updated description
 *                 example: "My updated collection of shonen anime series"
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the playlist is publicly viewable
 *                 example: false
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a12b5e67d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "Updated Shonen Anime Collection"
 *                     slug:
 *                       type: string
 *                       example: "updated-shonen-anime-collection-60a12b5e"
 *                     description:
 *                       type: string
 *                       example: "My updated collection of shonen anime series"
 *                     isPublic:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to update this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', protect, standardLimiter, validateParams(updatePlaylistSchema, 'body'), updatePlaylist);

/**
 * @swagger
 * /playlists/{id}:
 *   delete:
 *     summary: Delete playlist
 *     description: Delete a playlist and all its entries
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the playlist to delete
 *         example: "60a12b5e67d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Playlist deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Playlist deleted successfully"
 *                     id:
 *                       type: string
 *                       example: "60a12b5e67d0d8992e610c85"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to delete this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', protect, standardLimiter, deletePlaylist);

/**
 * @swagger
 * /playlists/{id}/anime:
 *   post:
 *     summary: Add anime to playlist
 *     description: Add a specific anime to an existing playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the playlist to add anime to
 *         example: "60a12b5e67d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animeId
 *             properties:
 *               animeId:
 *                 type: integer
 *                 description: ID of the anime to add
 *                 example: 1535
 *     responses:
 *       200:
 *         description: Anime added to playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Anime added to playlist"
 *                     playlistId:
 *                       type: string
 *                       example: "60a12b5e67d0d8992e610c85"
 *                     animeId:
 *                       type: integer
 *                       example: 1535
 *                     anime:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1535
 *                         title:
 *                           type: string
 *                           example: "Death Note"
 *                         image:
 *                           type: string
 *                           example: "https://cdn.myanimelist.net/images/anime/9/9453.jpg"
 *       400:
 *         description: Invalid input data or anime already in playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to modify this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Playlist or anime not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/anime', protect, standardLimiter, validateParams(addAnimeSchema, 'body'), addAnimeToPlaylist);

/**
 * @swagger
 * /playlists/{id}/anime/{animeId}:
 *   delete:
 *     summary: Remove anime from playlist
 *     description: Remove a specific anime from a playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the playlist
 *         example: "60a12b5e67d0d8992e610c85"
 *       - in: path
 *         name: animeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the anime to remove
 *         example: 1535
 *     responses:
 *       200:
 *         description: Anime removed from playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Anime removed from playlist"
 *                     playlistId:
 *                       type: string
 *                       example: "60a12b5e67d0d8992e610c85"
 *                     animeId:
 *                       type: integer
 *                       example: 1535
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to modify this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Playlist not found or anime not in playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/anime/:animeId', protect, standardLimiter, removeAnimeFromPlaylist);

/**
 * @swagger
 * /playlists/{id}/like:
 *   post:
 *     summary: Like/unlike playlist
 *     description: Toggle like status for a playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the playlist to like/unlike
 *         example: "60a12b5e67d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                       example: true
 *                     likesCount:
 *                       type: integer
 *                       example: 16
 *                     playlistId:
 *                       type: string
 *                       example: "60a12b5e67d0d8992e610c85"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/like', protect, userActionLimiter, toggleLike);

module.exports = router; 