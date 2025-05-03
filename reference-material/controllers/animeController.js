const { formatResponse, AppError, catchAsync } = require('../utils/controllerUtils');
const logger = require('../utils/logger')('Anime');
const animeService = require('../services/animeService');

/**
 * Get anime by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAnimeById = catchAsync(async (req, res, next) => {
  const animeId = parseInt(req.params.id);
  logger.info(`Fetching anime with ID: ${animeId}`);
  
  const anime = await animeService.getAnimeById(animeId);
  
  if (!anime) {
    logger.warn(`Anime not found with ID: ${animeId}`);
    throw AppError.notFound('Anime');
  }
  
  logger.info(`Successfully fetched anime: ${anime.title}`);
  return res.json(formatResponse(anime));
});

/**
 * Get anime staff
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAnimeStaff = catchAsync(async (req, res, next) => {
  const animeId = parseInt(req.params.id);
  logger.info(`Fetching staff for anime ID: ${animeId}`);
  
  const staff = await animeService.getAnimeStaff(animeId);
  
  if (!staff) {
    logger.warn(`Staff not found for anime ID: ${animeId}`);
    throw AppError.notFound('Anime staff');
  }
  
  logger.info(`Successfully fetched staff for anime ID: ${animeId}`);
  return res.json(formatResponse(staff));
});

/**
 * Get anime episodes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAnimeEpisodes = catchAsync(async (req, res, next) => {
  const animeId = parseInt(req.params.id);
  const page = parseInt(req.query.page) || 1;
  logger.info(`Fetching episodes for anime ID: ${animeId}, page: ${page}`);
  
  const episodes = await animeService.getAnimeEpisodes(animeId, page);
  
  logger.info(`Successfully fetched ${episodes.length} episodes for anime ID: ${animeId}`);
  return res.json(formatResponse(episodes));
});

/**
 * Get anime recommendations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAnimeRecommendations = catchAsync(async (req, res, next) => {
  const animeId = parseInt(req.params.id);
  logger.info(`Fetching recommendations for anime ID: ${animeId}`);
  
  const recommendations = await animeService.getAnimeRecommendations(animeId);
  
  logger.info(`Successfully fetched ${recommendations.length} recommendations for anime ID: ${animeId}`);
  return res.json(formatResponse(recommendations));
});

/**
 * Get similar anime
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAnimeSimilar = catchAsync(async (req, res, next) => {
  const animeId = parseInt(req.params.id);
  logger.info(`Fetching similar anime for anime ID: ${animeId}`);
  
  const similarAnime = await animeService.getAnimeSimilar(animeId);
  
  logger.info(`Successfully fetched ${similarAnime.length} similar anime for anime ID: ${animeId}`);
  return res.json(formatResponse(similarAnime));
});

/**
 * Get anime reviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAnimeReviews = catchAsync(async (req, res, next) => {
  const animeId = parseInt(req.params.id);
  const page = parseInt(req.query.page) || 1;
  logger.info(`Fetching reviews for anime ID: ${animeId}, page: ${page}`);
  
  const reviews = await animeService.getAnimeReviews(animeId, page);
  
  logger.info(`Successfully fetched ${reviews.length} reviews for anime ID: ${animeId}`);
  return res.json(formatResponse(reviews));
});

/**
 * Get random anime
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRandomAnime = catchAsync(async (req, res, next) => {
  logger.info('Fetching random anime');
  
  const randomAnime = await animeService.getRandomAnime();
  
  if (!randomAnime) {
    logger.error(`Failed to fetch random anime`);
    throw AppError.internal('Failed to fetch random anime');
  }
  
  logger.info(`Successfully fetched random anime: ${randomAnime.title}`);
  return res.json(formatResponse(randomAnime));
});

module.exports = {
  getAnimeById,
  getAnimeStaff,
  getAnimeEpisodes,
  getAnimeRecommendations,
  getAnimeSimilar,
  getAnimeReviews,
  getRandomAnime
}; 