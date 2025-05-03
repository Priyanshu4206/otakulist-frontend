const Anime = require('../models/Anime');
const { formatResponse, AppError, catchAsync, createPagination } = require('../utils/controllerUtils');
const logger = require('../utils/logger')('Genre');

/**
 * @desc    Get all genres
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getAllGenres = catchAsync(async (req, res) => {
  logger.info('Fetching all genres');
  
  const genres = await Anime.aggregate([
    { $unwind: '$genres' },
    { $group: { _id: '$genres.malId', name: { $first: '$genres.name' } } },
    { $sort: { name: 1 } },
    { $project: { _id: 0, id: '$_id', name: 1 } }
  ]);
  
  logger.info(`Successfully fetched ${genres.length} genres`);
  return res.json(formatResponse(genres));
});

/**
 * @desc    Get anime by genre
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getAnimeByGenre = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, sort = 'popularity' } = req.query;
  
  logger.info(`Fetching anime for genre ID: ${id}, page: ${page}, limit: ${limit}, sort: ${sort}`);
  
  // Validate genre ID
  if (!id || isNaN(parseInt(id))) {
    logger.warn(`Invalid genre ID provided: ${id}`);
    throw AppError.badRequest('Valid genre ID is required');
  }
  
  const genreId = parseInt(id);
  
  // Check if genre exists
  const genreExists = await Anime.findOne({ 'genres.malId': genreId }).lean();
  
  if (!genreExists) {
    logger.warn(`Genre not found with ID: ${genreId}`);
    throw AppError.notFound('Genre');
  }
  
  // Get genre name
  const genre = genreExists.genres.find(g => g.malId === genreId);
  
  // Get sort options
  const sortOption = {};
  if (sort === 'popularity') sortOption.popularity = -1;
  else if (sort === 'score') sortOption.score = -1;
  else if (sort === 'title') sortOption['titles.default'] = 1;
  else sortOption.popularity = -1; // Default sort
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const anime = await Anime.find({ 'genres.malId': genreId })
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  const total = await Anime.countDocuments({ 'genres.malId': genreId });
  
  const pagination = createPagination(page, limit, total);
  
  logger.info(`Successfully fetched ${anime.length} anime for genre: ${genre.name}`);
  return res.json(formatResponse({
    genre: genre.name,
    anime
  }, pagination));
});

/**
 * @desc    Get popular genres
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getPopularGenres = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;
  logger.info(`Fetching top ${limit} popular genres`);
  
  const genres = await Anime.aggregate([
    { $unwind: '$genres' },
    { $group: { 
      _id: '$genres.malId', 
      name: { $first: '$genres.name' },
      count: { $sum: 1 }
    }},
    { $sort: { count: -1 } },
    { $limit: parseInt(limit) },
    { $project: { _id: 0, id: '$_id', name: 1, count: 1 } }
  ]);
  
  logger.info(`Successfully fetched ${genres.length} popular genres`);
  return res.json(formatResponse(genres));
}); 