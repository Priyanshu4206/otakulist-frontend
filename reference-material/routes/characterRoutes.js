const express = require('express');
const router = express.Router();
const { 
  getCharacterById, 
  searchCharacters, 
  getPopularCharacters,
  getCharactersByAnime
} = require('../controllers/characterController');
const { validateParams } = require('../middleware/validation');
const Joi = require('joi');

/**
 * Validate parameters
 * @param {object} schema - Joi validation schema
 * @param {string} source - Source of parameters ('query' or 'body')
 */
const characterIdParamSchema = Joi.object({
  id: Joi.number().integer().required()
});

const animeIdParamSchema = Joi.object({
  animeId: Joi.number().integer().required()
});

const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const animeCharactersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  mainOnly: Joi.string().valid('true', 'false', '1', '0').default('true')
});

/**
 * @swagger
 * /characters/search:
 *   get:
 *     summary: Search for characters
 *     description: Search for anime characters by name or other keywords
 *     tags: [Characters]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query string
 *         example: "Mikasa"
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
 *     responses:
 *       200:
 *         description: Successfully retrieved character search results
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
 *                         example: 40881
 *                       name:
 *                         type: string
 *                         example: "Mikasa Ackerman"
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/characters/9/215563.jpg"
 *                       role:
 *                         type: string
 *                         example: "Main"
 *                       anime:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 16498
 *                           title:
 *                             type: string
 *                             example: "Attack on Titan"
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
router.get('/search', validateParams(searchQuerySchema), searchCharacters);

/**
 * @swagger
 * /characters/popular:
 *   get:
 *     summary: Get popular characters
 *     description: Retrieve a list of popular anime characters sorted by popularity rating
 *     tags: [Characters]
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
 *     responses:
 *       200:
 *         description: Successfully retrieved popular characters
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
 *                         example: 417
 *                       name:
 *                         type: string
 *                         example: "Levi Ackerman"
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/characters/2/241413.jpg"
 *                       favorites:
 *                         type: integer
 *                         example: 128563
 *                       anime:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 16498
 *                           title:
 *                             type: string
 *                             example: "Attack on Titan"
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/popular', validateParams(paginationSchema), getPopularCharacters);

/**
 * @swagger
 * /characters/anime/{animeId}:
 *   get:
 *     summary: Get characters by anime ID
 *     description: Retrieve all characters associated with a specific anime
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the anime to get characters for
 *         example: 16498
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
 *         name: mainOnly
 *         schema:
 *           type: string
 *           enum: [true, false, 1, 0]
 *           default: true
 *         description: Whether to only include main characters
 *         example: true
 *     responses:
 *       200:
 *         description: Successfully retrieved anime characters
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
 *                         example: 40881
 *                       name:
 *                         type: string
 *                         example: "Mikasa Ackerman"
 *                       image:
 *                         type: string
 *                         example: "https://cdn.myanimelist.net/images/characters/9/215563.jpg"
 *                       role:
 *                         type: string
 *                         example: "Main"
 *                       favorites:
 *                         type: integer
 *                         example: 84762
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
 *                       example: 32
 *                     pages:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Invalid anime ID
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
router.get('/anime/:animeId', 
  validateParams(animeIdParamSchema, 'params'), 
  validateParams(animeCharactersQuerySchema, 'query'), 
  getCharactersByAnime);

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Get character by ID
 *     description: Retrieve detailed information about a specific character by ID
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the character to retrieve
 *         example: 40881
 *     responses:
 *       200:
 *         description: Successfully retrieved character details
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
 *                       example: 40881
 *                     name:
 *                       type: string
 *                       example: "Mikasa Ackerman"
 *                     name_kanji:
 *                       type: string
 *                       example: "ミカサ・アッカーマン"
 *                     about:
 *                       type: string
 *                       example: "Mikasa Ackerman is Eren's adoptive sister and the main female protagonist of the series..."
 *                     image:
 *                       type: string
 *                       example: "https://cdn.myanimelist.net/images/characters/9/215563.jpg"
 *                     favorites:
 *                       type: integer
 *                       example: 84762
 *                     animeography:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           anime:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 16498
 *                               title:
 *                                 type: string
 *                                 example: "Attack on Titan"
 *                               image:
 *                                 type: string
 *                                 example: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
 *                           role:
 *                             type: string
 *                             example: "Main"
 *                     voice_actors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 7184
 *                           name:
 *                             type: string
 *                             example: "Yui Ishikawa"
 *                           image:
 *                             type: string
 *                             example: "https://cdn.myanimelist.net/images/voiceactors/2/44825.jpg"
 *                           language:
 *                             type: string
 *                             example: "Japanese"
 *       400:
 *         description: Invalid character ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Character not found
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
router.get('/:id', validateParams(characterIdParamSchema, 'params'), getCharacterById);

module.exports = router; 