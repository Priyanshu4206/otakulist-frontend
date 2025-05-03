const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { standardLimiter } = require('../middleware/rateLimiter');
const { validateParams } = require('../middleware/validation');
const { 
  addUpdateWatchlist, 
  getWatchlist, 
  getWatchlistByStatus, 
  removeFromWatchlist 
} = require('../controllers/watchlistController');
const Joi = require('joi');

// Validation schemas
const watchlistAddSchema = Joi.object({
  animeId: Joi.number().integer().required(),
  status: Joi.string().valid('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch').required(),
  rating: Joi.number().min(0).max(10).default(0),
  progress: Joi.number().min(0).default(0),
  notes: Joi.string().allow('', null).default('')
});

const watchlistQuerySchema = Joi.object({
  status: Joi.string().valid('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'),
  sort: Joi.string().valid('title', 'rating', 'progress', 'updatedAt').default('updatedAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const watchlistStatusSchema = Joi.object({
  status: Joi.string().valid('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch').required()
});

/**
 * @swagger
 * /watchlist:
 *   post:
 *     summary: Add or update anime in watchlist
 *     description: Add a new anime to the user's watchlist or update an existing entry
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animeId
 *               - status
 *             properties:
 *               animeId:
 *                 type: integer
 *                 description: ID of the anime to add/update
 *                 example: 5114
 *               status:
 *                 type: string
 *                 enum: [watching, completed, on_hold, dropped, plan_to_watch]
 *                 description: Watching status for this anime
 *                 example: "watching"
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 default: 0
 *                 description: User's rating of the anime (0-10)
 *                 example: 8.5
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Number of episodes watched
 *                 example: 15
 *               notes:
 *                 type: string
 *                 description: User's personal notes about the anime
 *                 example: "Great character development"
 *     responses:
 *       200:
 *         description: Anime successfully added/updated in watchlist
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
 *                       example: "60d21b4667d0d8992e610c85"
 *                     user:
 *                       type: string
 *                       example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                     anime:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 5114
 *                         title:
 *                           type: string
 *                           example: "Fullmetal Alchemist: Brotherhood"
 *                         image:
 *                           type: string
 *                           example: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg"
 *                         totalEpisodes:
 *                           type: integer
 *                           example: 64
 *                     status:
 *                       type: string
 *                       example: "watching"
 *                     rating:
 *                       type: number
 *                       example: 8.5
 *                     progress:
 *                       type: integer
 *                       example: 15
 *                     notes:
 *                       type: string
 *                       example: "Great character development"
 *                     updatedAt:
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
 *       404:
 *         description: Anime not found
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
router.post('/', protect, standardLimiter, validateParams(watchlistAddSchema, 'body'), addUpdateWatchlist);

/**
 * @swagger
 * /watchlist:
 *   get:
 *     summary: Get user's watchlist
 *     description: Retrieve the current user's watchlist with optional filtering and sorting
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [watching, completed, on_hold, dropped, plan_to_watch]
 *         description: Filter watchlist by status
 *         example: "watching"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title, rating, progress, updatedAt]
 *           default: updatedAt
 *         description: Field to sort by
 *         example: "updatedAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *         example: "desc"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved watchlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       anime:
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
 *                           totalEpisodes:
 *                             type: integer
 *                             example: 64
 *                       status:
 *                         type: string
 *                         example: "watching"
 *                       rating:
 *                         type: number
 *                         example: 8.5
 *                       progress:
 *                         type: integer
 *                         example: 15
 *                       notes:
 *                         type: string
 *                         example: "Great character development"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-05-01T14:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     pages:
 *                       type: integer
 *                       example: 3
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
router.get('/', protect, standardLimiter, validateParams(watchlistQuerySchema), getWatchlist);

/**
 * @swagger
 * /watchlist/status/{status}:
 *   get:
 *     summary: Get watchlist by status
 *     description: Retrieve watchlist entries filtered by a specific status
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [watching, completed, on_hold, dropped, plan_to_watch]
 *         description: Status to filter by
 *         example: "watching"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title, rating, progress, updatedAt]
 *           default: updatedAt
 *         description: Field to sort by
 *         example: "rating"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *         example: "desc"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved watchlist filtered by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       anime:
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
 *                           totalEpisodes:
 *                             type: integer
 *                             example: 64
 *                       status:
 *                         type: string
 *                         example: "watching"
 *                       rating:
 *                         type: number
 *                         example: 8.5
 *                       progress:
 *                         type: integer
 *                         example: 15
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-05-01T14:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 12
 *                     pages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid status
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
router.get('/status/:status', protect, standardLimiter, validateParams(watchlistStatusSchema, 'params'), getWatchlistByStatus);

/**
 * @swagger
 * /watchlist/{animeId}:
 *   delete:
 *     summary: Remove anime from watchlist
 *     description: Delete an anime entry from the user's watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the anime to remove from watchlist
 *         example: 5114
 *     responses:
 *       200:
 *         description: Successfully removed anime from watchlist
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
 *                       example: "Anime removed from watchlist"
 *                     animeId:
 *                       type: integer
 *                       example: 5114
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Anime not found in watchlist
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
router.delete('/:animeId', protect, standardLimiter, removeFromWatchlist);

module.exports = router; 