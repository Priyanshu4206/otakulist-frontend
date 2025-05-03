const Anime = require('../models/Anime');
const { formatResponse, AppError, catchAsync } = require('../utils/controllerUtils');
const logger = require('../utils/logger')('Search');
const jikanService = require('../services/jikanService');
const { processAnimeData } = require('../utils/animeProcessing');
const { setCache } = require('../config/redis');

/**
 * Process genres parameter to ensure it's an array
 */
const processGenres = (genres) => {
  if (!genres) return [];
  
  if (Array.isArray(genres)) {
    return genres;
  }
  
  if (typeof genres === 'string') {
    return genres.split(',').map(g => g.trim()).filter(Boolean);
  }
  
  return [genres].filter(Boolean);
};

/**
 * Get sort options for MongoDB
 */
const getSortOptions = (sort) => {
  if (sort === 'popularity') return { popularity: -1 };
  if (sort === 'score') return { score: -1 };
  if (sort === 'title') return { 'titles.default': 1 };
  return { score: -1 }; // Default sort
};

/**
 * Build MongoDB query from search parameters
 */
const buildQuery = (params) => {
  const {
    q = '',
    type,
    status,
    rating,
    genres,
    min_score,
    max_score
  } = params;

  const mongoQuery = {};
  const processedGenres = processGenres(genres);
  
  // Text search if query is provided
  if (q && q.trim()) {
    mongoQuery.$or = [
      { 'titles.default': { $regex: q, $options: 'i' } },
      { 'titles.english': { $regex: q, $options: 'i' } },
      { 'titles.japanese': { $regex: q, $options: 'i' } },
      { 'titles.synonyms': { $regex: q, $options: 'i' } }
    ];
    logger.info(`Searching for anime with query: "${q}"`);
  }
  
  // Add filters
  if (type) {
    mongoQuery.type = type;
    logger.info(`Filtering by type: ${type}`);
  }
  if (status) {
    mongoQuery.status = status;
    logger.info(`Filtering by status: ${status}`);
  }
  
  // Rating filter - partial matching for ratings
  if (rating) {
    mongoQuery.rating = { $regex: `^${rating}`, $options: 'i' };
    logger.info(`Filtering by rating: ${rating}`);
  }
  
  // Score range filter
  if (min_score !== undefined || max_score !== undefined) {
    mongoQuery.score = {};
    if (min_score !== undefined) {
      mongoQuery.score.$gte = parseFloat(min_score);
      logger.info(`Filtering by minimum score: ${min_score}`);
    }
    if (max_score !== undefined) {
      mongoQuery.score.$lte = parseFloat(max_score);
      logger.info(`Filtering by maximum score: ${max_score}`);
    }
  }
  
  // Genre filter
  if (processedGenres.length > 0) {
    mongoQuery['genres.name'] = { $in: processedGenres };
    logger.info(`Filtering by genres: ${processedGenres.join(', ')}`);
  }
  
  return mongoQuery;
};

/**
 * @desc    Search anime with query parameters
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.searchAnime = catchAsync(async (req, res) => {
  const params = req.method === 'GET' ? req.query : req.body;
  const { page = 1, limit = 20, sort = 'score', q = '' } = params;
  
  logger.info(`Starting anime search with parameters: page=${page}, limit=${limit}, sort=${sort}`);
  
  // Build query
  const mongoQuery = buildQuery(params);
  
  // Get sort options
  const sortOption = getSortOptions(sort);
  logger.info(`Using sort option: ${JSON.stringify(sortOption)}`);
  
  // Get count for pagination
  let total = await Anime.countDocuments(mongoQuery);
  logger.info(`Found ${total} total results matching the criteria in database`);
  
  // Get paginated results
  let animeList = await Anime.find(mongoQuery)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  
  // If results are empty or very few and we have a search query, try Jikan API
  if (animeList.length < 5 && q.trim()) {
    logger.info(`Found only ${animeList.length} results for "${q}", trying Jikan API`);
    
    try {
      // Map our params to Jikan API format
      const jikanParams = {};
      if (params.type) jikanParams.type = params.type.toLowerCase();
      if (params.status) jikanParams.status = params.status;
      if (params.rating) jikanParams.rating = params.rating;
      if (params.min_score) jikanParams.min_score = params.min_score;
      if (params.max_score) jikanParams.max_score = params.max_score;
      if (params.genres) {
        const genresList = processGenres(params.genres);
        if (genresList.length > 0) {
          jikanParams.genres = genresList.join(',');
        }
      }
      
      // Call Jikan search API
      const jikanResults = await jikanService.searchAnime(q, jikanParams, 1);
      
      if (jikanResults.data && jikanResults.data.length > 0) {
        logger.info(`Found ${jikanResults.data.length} results from Jikan API for "${q}"`);
        
        // Process and store results in database for future use
        try {
          // Use the animeProcessing utility to save the data to database
          await processAnimeData(jikanResults.data, `search query ${q}`);
          
          // Cache the search results with normalized key
          const cacheKey = `search:${q.toLowerCase().replace(/\s+/g, '_')}`;
          await setCache(cacheKey, { data: jikanResults.data }, 60 * 60 * 24); // 24 hour TTL
          
          logger.info(`Saved Jikan results to database and cache for "${q}"`);
          
          // Re-query the database to get the newly added items with our original sorting
          animeList = await Anime.find(mongoQuery)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
          
          // Update total count
          total = await Anime.countDocuments(mongoQuery);
        } catch (error) {
          logger.error(`Error processing Jikan results: ${error.message}`);
        }
      } else {
        logger.info(`No results found from Jikan API for "${q}"`);
      }
    } catch (error) {
      logger.error(`Error fetching from Jikan API: ${error.message}`);
      // Continue with existing results rather than failing
    }
  }
  
  logger.info(`Returning ${animeList.length} results for page ${page}`);
  
  // Format result
  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  };
  
  return res.json(formatResponse(animeList, pagination));
});

/**
 * @desc    Get anime details by ID
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getAnimeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching anime details for ID: ${id}`);
  
  let anime = await Anime.findOne({ malId: id }).lean();
  
  // If not found in database, try to fetch from Jikan API
  if (!anime) {
    logger.info(`Anime with ID ${id} not found in database, trying Jikan API`);
    
    try {
      // Fetch from Jikan API
      const jikanResult = await jikanService.getAnime(id);
      
      if (jikanResult.data) {
        logger.info(`Found anime with ID ${id} from Jikan API, saving to database`);
        
        // Process and save to database
        try {
          await processAnimeData([jikanResult.data], `getAnimeById ${id}`);
          
          // Fetch the newly saved anime from database
          anime = await Anime.findOne({ malId: id }).lean();
          
          // Cache the result
          if (anime) {
            const cacheKey = `anime:${id}`;
            await setCache(cacheKey, { data: anime }, 60 * 60 * 24 * 7); // 7 days TTL
            logger.info(`Cached anime with ID ${id}`);
          }
        } catch (error) {
          logger.error(`Error processing Jikan result for ID ${id}: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error(`Error fetching anime with ID ${id} from Jikan API: ${error.message}`);
    }
  }
  
  if (!anime) {
    logger.warn(`Anime not found with ID: ${id} in database or Jikan API`);
    throw AppError.notFound('Anime');
  }
  
  logger.info(`Successfully fetched anime details for ID: ${id}`);
  return res.json(formatResponse(anime));
});

/**
 * @desc    Get random anime
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getRandomAnime = catchAsync(async (req, res) => {
  logger.info('Fetching random anime');
  
  const count = await Anime.countDocuments();
  const random = Math.floor(Math.random() * count);
  
  const anime = await Anime.findOne().skip(random).lean();
  
  if (!anime) {
    logger.warn('No anime found for random selection');
    throw AppError.notFound('Anime');
  }
  
  logger.info(`Successfully fetched random anime with ID: ${anime.malId}`);
  return res.json(formatResponse(anime));
}); 