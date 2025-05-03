const express = require('express');
const router = express.Router();
const { 
  searchAnime, 
  getAnimeById, 
  getRandomAnime 
} = require('../controllers/searchController');
const { validateParams } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const searchSchema = Joi.object({
  q: Joi.string().min(1),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string(),
  status: Joi.string(),
  rating: Joi.string(),
  genres: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  min_score: Joi.number().min(0).max(10),
  max_score: Joi.number().min(0).max(10),
  sort: Joi.string().valid('popularity', 'score', 'title').default('score')
});

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search anime
 *     description: Search for anime using various filter criteria
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query text
 *         example: "fullmetal"
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Anime type (TV, Movie, OVA, etc.)
 *         example: "TV"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Airing status (Airing, Finished Airing, etc.)
 *         example: "Finished Airing"
 *       - in: query
 *         name: rating
 *         schema:
 *           type: string
 *         description: Age rating (G, PG, R, etc.)
 *         example: "PG-13"
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
 *         name: min_score
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         description: Minimum score rating
 *         example: 7.5
 *       - in: query
 *         name: max_score
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         description: Maximum score rating
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popularity, score, title]
 *           default: score
 *         description: Sort results by specified field
 *         example: "score"
 *     responses:
 *       200:
 *         description: Successful anime search results
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
 *                       type:
 *                         type: string
 *                         example: "TV"
 *                       status:
 *                         type: string
 *                         example: "Finished Airing"
 *                       episodes:
 *                         type: integer
 *                         example: 64
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg"
 *                       score:
 *                         type: number
 *                         format: float
 *                         example: 9.13
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
router.get('/', validateParams(searchSchema), searchAnime);

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Search anime (with request body)
 *     description: Search for anime using various filter criteria in the request body (useful for complex queries)
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *                 description: Search query text
 *                 example: "fullmetal"
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 20
 *                 description: Number of results per page
 *                 example: 20
 *               type:
 *                 type: string
 *                 description: Anime type (TV, Movie, OVA, etc.)
 *                 example: "TV"
 *               status:
 *                 type: string
 *                 description: Airing status (Airing, Finished Airing, etc.)
 *                 example: "Finished Airing"
 *               rating:
 *                 type: string
 *                 description: Age rating (G, PG, R, etc.)
 *                 example: "PG-13"
 *               genres:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *                 description: Genres to filter by (comma-separated or array)
 *                 example: ["Action", "Adventure"]
 *               min_score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Minimum score rating
 *                 example: 7.5
 *               max_score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Maximum score rating
 *                 example: 10
 *               sort:
 *                 type: string
 *                 enum: [popularity, score, title]
 *                 default: score
 *                 description: Sort results by specified field
 *                 example: "score"
 *     responses:
 *       200:
 *         description: Successful anime search results
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
 *                       type:
 *                         type: string
 *                         example: "TV"
 *                       status:
 *                         type: string
 *                         example: "Finished Airing"
 *                       episodes:
 *                         type: integer
 *                         example: 64
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg"
 *                       score:
 *                         type: number
 *                         format: float
 *                         example: 9.13
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
router.post('/', searchAnime);

/**
 * @swagger
 * /search/anime/{id}:
 *   get:
 *     summary: Get anime by ID
 *     description: Retrieve detailed information about a specific anime by its ID
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime ID
 *         example: 5114
 *     responses:
 *       200:
 *         description: Successful anime retrieval
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
 *                     malId:
 *                       type: integer
 *                       example: 5114
 *                     titles:
 *                       type: object
 *                       properties:
 *                         default:
 *                           type: string
 *                           example: "Fullmetal Alchemist: Brotherhood"
 *                         japanese:
 *                           type: string
 *                           example: "鋼の錬金術師 FULLMETAL ALCHEMIST"
 *                         english:
 *                           type: string
 *                           example: "Fullmetal Alchemist: Brotherhood"
 *                     type:
 *                       type: string
 *                       example: "TV"
 *                     source:
 *                       type: string
 *                       example: "Manga"
 *                     status:
 *                       type: string
 *                       example: "Finished Airing"
 *                     episodes:
 *                       type: integer
 *                       example: 64
 *                     airing:
 *                       type: boolean
 *                       example: false
 *                     aired:
 *                       type: object
 *                       properties:
 *                         from:
 *                           type: string
 *                           format: date
 *                           example: "2009-04-05"
 *                         to:
 *                           type: string
 *                           format: date
 *                           example: "2010-07-04"
 *                     duration:
 *                       type: string
 *                       example: "24 min per ep"
 *                     rating:
 *                       type: string
 *                       example: "R - 17+ (violence & profanity)"
 *                     score:
 *                       type: number
 *                       format: float
 *                       example: 9.13
 *                     scored_by:
 *                       type: integer
 *                       example: 1223320
 *                     rank:
 *                       type: integer
 *                       example: 1
 *                     popularity:
 *                       type: integer
 *                       example: 3
 *                     members:
 *                       type: integer
 *                       example: 2438897
 *                     favorites:
 *                       type: integer
 *                       example: 202748
 *                     synopsis:
 *                       type: string
 *                     background:
 *                       type: string
 *                     season:
 *                       type: string
 *                       example: "spring"
 *                     year:
 *                       type: integer
 *                       example: 2009
 *                     image:
 *                       type: string
 *                       example: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg"
 *                     genres:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Action"
 *                     studios:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 4
 *                           name:
 *                             type: string
 *                             example: "Bones"
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
router.get('/anime/:id', getAnimeById);

/**
 * @swagger
 * /search/random:
 *   get:
 *     summary: Get a random anime
 *     description: Retrieves a randomly selected anime from the database
 *     tags: [Search]
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
 *                     malId:
 *                       type: integer
 *                       example: 5114
 *                     titles:
 *                       type: object
 *                       properties:
 *                         default:
 *                           type: string
 *                           example: "Fullmetal Alchemist: Brotherhood"
 *                     image:
 *                       type: string
 *                       example: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg"
 *                     score:
 *                       type: number
 *                       format: float
 *                       example: 9.13
 *                     type:
 *                       type: string
 *                       example: "TV"
 *       404:
 *         description: No anime found
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
router.get('/random', getRandomAnime);

module.exports = router; 