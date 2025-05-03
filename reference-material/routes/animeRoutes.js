const express = require('express');
const router = express.Router();
const Joi = require('joi');
const animeController = require('../controllers/animeController');
const { validateParams } = require('../middleware/validation');

// Validation schemas
const animeIdSchema = Joi.object({
  id: Joi.number().integer().required().description('Anime ID from MyAnimeList')
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).description('Page number, starting from 1')
});

// Routes
/**
 * @swagger
 * /anime/random:
 *   get:
 *     summary: Get a random anime
 *     description: Retrieves information for a randomly selected anime
 *     tags: [Anime]
 *     responses:
 *       200:
 *         description: Successfully retrieved random anime
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
 *                       type: integer
 *                       example: 5114
 *                     title:
 *                       type: string
 *                       example: "Fullmetal Alchemist: Brotherhood"
 *                     synopsis:
 *                       type: string
 *                     image:
 *                       type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/random', animeController.getRandomAnime);

/**
 * @swagger
 * /anime/{id}:
 *   get:
 *     summary: Get anime by ID
 *     description: Retrieves detailed information about an anime by its ID
 *     tags: [Anime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime ID from MyAnimeList
 *     responses:
 *       200:
 *         description: Successfully retrieved anime information
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
 *                       type: integer
 *                       example: 5114
 *                     title:
 *                       type: string
 *                       example: "Fullmetal Alchemist: Brotherhood"
 *                     synopsis:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "Finished Airing"
 *                     episodes:
 *                       type: integer
 *                       example: 64
 *                     score:
 *                       type: number
 *                       format: float
 *                       example: 9.13
 *       400:
 *         description: Invalid ID supplied
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
 */
router.get(
  '/:id',
  validateParams(animeIdSchema, 'params'),
  animeController.getAnimeById
);

/**
 * @swagger
 * /anime/{id}/staff:
 *   get:
 *     summary: Get anime staff
 *     description: Retrieves staff information for an anime by its ID
 *     tags: [Anime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime ID from MyAnimeList
 *     responses:
 *       200:
 *         description: Successfully retrieved staff information
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
 *                       person:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       positions:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Invalid ID supplied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Staff information not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/staff',
  validateParams(animeIdSchema, 'params'),
  animeController.getAnimeStaff
);

/**
 * @swagger
 * /anime/{id}/episodes:
 *   get:
 *     summary: Get anime episodes
 *     description: Retrieves episode information for an anime by its ID
 *     tags: [Anime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime ID from MyAnimeList
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number, starting from 1
 *     responses:
 *       200:
 *         description: Successfully retrieved episodes
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
 *                     episodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           number:
 *                             type: integer
 *                           aired:
 *                             type: string
 *                             format: date
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *       400:
 *         description: Invalid parameters supplied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/episodes',
  validateParams(animeIdSchema, 'params'),
  validateParams(paginationSchema),
  animeController.getAnimeEpisodes
);

/**
 * @swagger
 * /anime/{id}/recommendations:
 *   get:
 *     summary: Get anime recommendations
 *     description: Retrieves recommended anime for a given anime ID
 *     tags: [Anime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime ID from MyAnimeList
 *     responses:
 *       200:
 *         description: Successfully retrieved recommendations
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
 *                         type: integer
 *                       title:
 *                         type: string
 *                       image:
 *                         type: string
 *       400:
 *         description: Invalid ID supplied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/recommendations',
  validateParams(animeIdSchema, 'params'),
  animeController.getAnimeRecommendations
);

/**
 * @swagger
 * /anime/{id}/similar:
 *   get:
 *     summary: Get similar anime
 *     description: Retrieves similar anime for a given anime ID
 *     tags: [Anime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime ID from MyAnimeList
 *     responses:
 *       200:
 *         description: Successfully retrieved similar anime
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
 *                         type: integer
 *                       title:
 *                         type: string
 *                       image:
 *                         type: string
 *       400:
 *         description: Invalid ID supplied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/similar',
  validateParams(animeIdSchema, 'params'),
  animeController.getAnimeSimilar
);

/**
 * @swagger
 * /anime/{id}/reviews:
 *   get:
 *     summary: Get anime reviews
 *     description: Retrieves reviews for an anime by its ID
 *     tags: [Anime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime ID from MyAnimeList
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number, starting from 1
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews
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
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           user:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                           content:
 *                             type: string
 *                           score:
 *                             type: number
 *                           date:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *       400:
 *         description: Invalid parameters supplied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/reviews',
  validateParams(animeIdSchema, 'params'),
  validateParams(paginationSchema),
  animeController.getAnimeReviews
);

module.exports = router; 