const express = require('express');
const router = express.Router();
const { 
  getScheduleByDay, 
  getSeasonalAnime, 
  getAiringAnime, 
  getUpcomingAnime,
  getUpcomingSeasonPreview
} = require('../controllers/scheduleController');
const Joi = require('joi');
const { validateParams } = require('../middleware/validation');

/**
 * Validate parameters
 * @param {object} schema - Joi validation schema
 * @param {string} source - Source of parameters ('query' or 'body')
 */
const scheduleQuerySchema = Joi.object({
  day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'other', 'unknown'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('Currently Airing', 'Finished Airing', 'Not yet aired'),
  sort: Joi.string().valid('popularity', 'score', 'title', 'broadcast').default('popularity'),
  genres: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  rating: Joi.string(),
  timezone: Joi.string().optional().description('Target timezone (e.g., IST, EST, PST, UTC, or region format like Asia/Kolkata)')
});

const seasonQuerySchema = Joi.object({
  season: Joi.string().valid('winter', 'spring', 'summer', 'fall').required(),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 2).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  genres: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  status: Joi.string().valid('Currently Airing', 'Finished Airing', 'Not yet aired'),
  rating: Joi.string(),
  sort: Joi.string().valid('popularity', 'score', 'title').default('score')
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('popularity', 'score', 'title').default('popularity'),
  genres: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  )
});

/**
 * @swagger
 * /schedule:
 *   get:
 *     summary: Get anime schedule
 *     description: Retrieves anime schedule, optionally filtered by day of the week
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday, other, unknown]
 *         description: Day of the week to filter by
 *         example: "saturday"
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
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Currently Airing, Finished Airing, Not yet aired]
 *         description: Airing status to filter by
 *         example: "Currently Airing"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popularity, score, title, broadcast]
 *           default: popularity
 *         description: Field to sort the results by
 *         example: "popularity"
 *       - in: query
 *         name: genres
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Genres to filter by (comma-separated or array)
 *         example: "Action,Adventure"
 *       - in: query
 *         name: rating
 *         schema:
 *           type: string
 *         description: Age rating to filter by (G, PG, PG-13, R, etc.)
 *         example: "PG-13"
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *           enum: [JST, IST, EST, PST, UTC, BST, CEST, AEST]
 *         description: Target timezone for broadcast times (defaults to JST if not specified)
 *         example: "IST"
 *     responses:
 *       200:
 *         description: Successfully retrieved schedule
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
 *                         example: 51535
 *                       title:
 *                         type: string
 *                         example: "Jujutsu Kaisen 2nd Season"
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg"
 *                       broadcast:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             example: "saturday"
 *                           time:
 *                             type: string
 *                             example: "23:00"
 *                           timezone:
 *                             type: string
 *                             example: "Asia/Tokyo"
 *                           originalDay:
 *                             type: string
 *                             description: "Original day in source timezone (if timezone conversion was applied)"
 *                           originalTime:
 *                             type: string
 *                             description: "Original time in source timezone (if timezone conversion was applied)"
 *                       score:
 *                         type: number
 *                         format: float
 *                         example: 8.65
 *                       type:
 *                         type: string
 *                         example: "TV"
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Action"
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
 *       400:
 *         description: Invalid parameters
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
router.get('/', validateParams(scheduleQuerySchema), getScheduleByDay);

/**
 * @swagger
 * /schedule/seasonal:
 *   get:
 *     summary: Get seasonal anime
 *     description: Retrieves anime for a specific season and year
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: season
 *         required: true
 *         schema:
 *           type: string
 *           enum: [winter, spring, summer, fall]
 *         description: Anime season
 *         example: "spring"
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1990
 *           maximum: 2026
 *         description: Year of the season
 *         example: 2023
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
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *         example: 20
 *       - in: query
 *         name: genres
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Genres to filter by (comma-separated or array)
 *         example: "Action,Drama"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Currently Airing, Finished Airing, Not yet aired]
 *         description: Airing status to filter by
 *         example: "Currently Airing"
 *       - in: query
 *         name: rating
 *         schema:
 *           type: string
 *         description: Age rating to filter by (G, PG, PG-13, R, etc.)
 *         example: "PG-13"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popularity, score, title]
 *           default: score
 *         description: Field to sort the results by
 *         example: "score"
 *     responses:
 *       200:
 *         description: Successfully retrieved seasonal anime
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
 *                     season:
 *                       type: string
 *                       example: "spring"
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                     anime:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 51535
 *                           title:
 *                             type: string
 *                             example: "Jujutsu Kaisen 2nd Season"
 *                           image:
 *                             type: string
 *                             example: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg"
 *                           score:
 *                             type: number
 *                             format: float
 *                             example: 8.65
 *                           type:
 *                             type: string
 *                             example: "TV"
 *                           genres:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 name:
 *                                   type: string
 *                                   example: "Action"
 *                           season:
 *                             type: string
 *                             example: "spring"
 *                           year:
 *                             type: integer
 *                             example: 2023
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
 *                       example: 55
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Invalid parameters
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
router.get('/seasonal', validateParams(seasonQuerySchema), getSeasonalAnime);

/**
 * @swagger
 * /schedule/airing:
 *   get:
 *     summary: Get currently airing anime
 *     description: Retrieves anime that are currently airing
 *     tags: [Schedule]
 *     parameters:
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
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *         example: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popularity, score, title]
 *           default: popularity
 *         description: Field to sort the results by
 *         example: "popularity"
 *       - in: query
 *         name: genres
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Genres to filter by (comma-separated or array)
 *         example: "Action,Comedy"
 *     responses:
 *       200:
 *         description: Successfully retrieved currently airing anime
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
 *                         example: 51535
 *                       title:
 *                         type: string
 *                         example: "Jujutsu Kaisen 2nd Season"
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg"
 *                       broadcast:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             example: "saturday"
 *                           time:
 *                             type: string
 *                             example: "23:00"
 *                       score:
 *                         type: number
 *                         format: float
 *                         example: 8.65
 *                       type:
 *                         type: string
 *                         example: "TV"
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Action"
 *                       status:
 *                         type: string
 *                         example: "Currently Airing"
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
 *                       example: 100
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Invalid parameters
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
router.get('/airing', validateParams(paginationSchema), getAiringAnime);

/**
 * @swagger
 * /schedule/upcoming:
 *   get:
 *     summary: Get upcoming anime
 *     description: Retrieves anime that will be released in the near future
 *     tags: [Schedule]
 *     parameters:
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
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *         example: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popularity, score, title]
 *           default: popularity
 *         description: Field to sort the results by
 *         example: "popularity"
 *       - in: query
 *         name: genres
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Genres to filter by (comma-separated or array)
 *         example: "Action,Fantasy"
 *     responses:
 *       200:
 *         description: Successfully retrieved upcoming anime
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
 *                         example: 54112
 *                       title:
 *                         type: string
 *                         example: "Upcoming Anime Title"
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/anime/1234/56789.jpg"
 *                       aired:
 *                         type: object
 *                         properties:
 *                           from:
 *                             type: string
 *                             format: date
 *                             example: "2023-10-01"
 *                           to:
 *                             type: string
 *                             format: date
 *                             example: null
 *                       type:
 *                         type: string
 *                         example: "TV"
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Action"
 *                       status:
 *                         type: string
 *                         example: "Not yet aired"
 *                       season:
 *                         type: string
 *                         example: "fall"
 *                       year:
 *                         type: integer
 *                         example: 2023
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
 *                       example: 80
 *                     pages:
 *                       type: integer
 *                       example: 4
 *       400:
 *         description: Invalid parameters
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
router.get('/upcoming', validateParams(paginationSchema), getUpcomingAnime);

/**
 * @swagger
 * /schedule/upcoming/preview:
 *   get:
 *     summary: Get upcoming season preview
 *     description: Retrieves a preview of the upcoming anime season with summary statistics
 *     tags: [Schedule]
 *     responses:
 *       200:
 *         description: Successfully retrieved upcoming season preview
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
 *                     season:
 *                       type: string
 *                       example: "fall"
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                     count:
 *                       type: integer
 *                       example: 50
 *                     topAnime:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 54112
 *                           title:
 *                             type: string
 *                             example: "Popular Upcoming Anime"
 *                           image:
 *                             type: string
 *                             example: "https://cdn.myanimelist.net/images/anime/1234/56789.jpg"
 *                           popularity:
 *                             type: integer
 *                             example: 10
 *                     genreStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Action"
 *                           count:
 *                             type: integer
 *                             example: 25
 *                     typeStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "TV"
 *                           count:
 *                             type: integer
 *                             example: 40
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/upcoming/preview', getUpcomingSeasonPreview);

module.exports = router; 