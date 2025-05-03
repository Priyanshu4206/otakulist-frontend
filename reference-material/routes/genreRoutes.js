const express = require('express');
const router = express.Router();
const { 
  getAllGenres, 
  getAnimeByGenre, 
  getPopularGenres 
} = require('../controllers/genreController');
const { validateParams } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const genreIdParamSchema = Joi.object({
  id: Joi.number().integer().required()
});

const animeByGenreQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('popularity', 'score', 'title').default('popularity')
});

const popularGenresQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10)
});

/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Get all genres
 *     description: Retrieve a list of all available anime genres
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: Successfully retrieved genres
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
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Action"
 *                       count:
 *                         type: integer
 *                         description: Number of anime in this genre
 *                         example: 3964
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllGenres);

/**
 * @swagger
 * /genres/popular:
 *   get:
 *     summary: Get popular genres
 *     description: Retrieve a list of the most popular anime genres based on the number of anime
 *     tags: [Genres]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of genres to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved popular genres
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
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Action"
 *                       count:
 *                         type: integer
 *                         description: Number of anime in this genre
 *                         example: 3964
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
router.get('/popular', validateParams(popularGenresQuerySchema), getPopularGenres);

/**
 * @swagger
 * /genres/{id}/anime:
 *   get:
 *     summary: Get anime by genre ID
 *     description: Retrieve a list of anime belonging to a specific genre
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the genre
 *         example: 1
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
 *         description: Sort criteria for results
 *         example: "score"
 *     responses:
 *       200:
 *         description: Successfully retrieved anime list
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
 *                         example: 5114
 *                       malId:
 *                         type: integer
 *                         example: 5114
 *                       titles:
 *                         type: object
 *                         properties:
 *                           default:
 *                             type: string
 *                             example: "Fullmetal Alchemist: Brotherhood"
 *                           japanese:
 *                             type: string
 *                             example: "鋼の錬金術師 FULLMETAL ALCHEMIST"
 *                           english:
 *                             type: string
 *                             example: "Fullmetal Alchemist: Brotherhood"
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg"
 *                       type:
 *                         type: string
 *                         example: "TV"
 *                       episodes:
 *                         type: integer
 *                         example: 64
 *                       status:
 *                         type: string
 *                         example: "Finished Airing"
 *                       score:
 *                         type: number
 *                         format: float
 *                         example: 9.13
 *                 genre:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Action"
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
 *                       example: 3964
 *                     pages:
 *                       type: integer
 *                       example: 199
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Genre not found
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
router.get('/:id/anime', 
  validateParams(genreIdParamSchema, 'params'),
  validateParams(animeByGenreQuerySchema),
  getAnimeByGenre
);

module.exports = router; 