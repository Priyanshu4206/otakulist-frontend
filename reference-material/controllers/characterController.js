const Character = require('../models/Character');
const characterService = require('../services/characterService');
const jikanService = require('../services/jikanService');
const { formatResponse, AppError, catchAsync, createPagination } = require('../utils/controllerUtils');
const logger = require('../utils/logger')('Character');
const { getCache, setCache } = require('../config/redis');

/**
 * @desc    Get character by ID
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getCharacterById = catchAsync(async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching character with ID: ${id}`);
  
  // Try to get from cache first
  const cacheKey = `character:${id}`;
  const cachedCharacter = await getCache(cacheKey);
  if (cachedCharacter) {
    logger.info(`Character ${id} found in cache`);
    return res.json(formatResponse(cachedCharacter));
  }
  
  // Try to get from database
  let character = await Character.findOne({ malId: parseInt(id) }).lean();
  
  // If not found in database, try Jikan API
  if (!character) {
    logger.info(`Character not found in database, trying Jikan API for ID: ${id}`);
    
    try {
      // Try to get from Jikan API
      const response = await jikanService.getCharacter(id);
      
      if (response && response.data) {
        logger.info(`Character ${id} found in Jikan API, saving to database`);
        
        // Transform the character data
        const transformedData = {
          malId: response.data.mal_id,
          name: response.data.name,
          nameKanji: response.data.name_kanji,
          nicknames: response.data.nicknames || [],
          favorites: response.data.favorites,
          about: response.data.about,
          images: {
            jpg: {
              imageUrl: response.data.images?.jpg?.image_url,
              smallImageUrl: response.data.images?.jpg?.small_image_url,
              largeImageUrl: response.data.images?.jpg?.large_image_url
            },
            webp: {
              imageUrl: response.data.images?.webp?.image_url,
              smallImageUrl: response.data.images?.webp?.small_image_url,
              largeImageUrl: response.data.images?.webp?.large_image_url
            }
          },
          animeography: response.data.anime?.map(anime => ({
            malId: anime.mal_id,
            title: anime.title,
            url: anime.url,
            role: anime.role,
            images: anime.images || {}
          })) || [],
          mangaography: response.data.manga?.map(manga => ({
            malId: manga.mal_id,
            title: manga.title,
            url: manga.url,
            role: manga.role,
            images: manga.images || {}
          })) || [],
          voiceActors: response.data.voices?.map(voice => ({
            malId: voice.person.mal_id,
            name: voice.person.name,
            language: voice.language,
            url: voice.person.url
          })) || [],
          lastUpdated: new Date()
        };
        
        // Save to database
        character = await Character.findOneAndUpdate(
          { malId: parseInt(id) },
          transformedData,
          { new: true, upsert: true, lean: true }
        );
        
        // Cache the result
        await setCache(cacheKey, character, 60 * 60 * 24 * 7); // 7 days TTL
        
        logger.info(`Successfully saved character ${id} to database and cache`);
      }
    } catch (error) {
      logger.error(`Error fetching character from Jikan API: ${error.message}`);
    }
  }
  
  if (!character) {
    logger.warn(`Character not found with ID: ${id} in database or Jikan API`);
    throw AppError.notFound('Character');
  }
  
  // Cache if not already cached
  if (!cachedCharacter) {
    await setCache(cacheKey, character, 60 * 60 * 24 * 7); // 7 days TTL
  }
  
  logger.info(`Successfully fetched character with ID: ${id}`);
  return res.json(formatResponse(character));
});

/**
 * @desc    Search characters
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.searchCharacters = catchAsync(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  
  if (!q) {
    logger.warn('Search request received without search term');
    throw AppError.badRequest('Search term is required');
  }
  
  logger.info(`Searching characters with query: "${q}", page: ${page}, limit: ${limit}`);
  
  // Try to get from cache first
  const cacheKey = `search:character:${q}:page:${page}:limit:${limit}`;
  const cachedResults = await getCache(cacheKey);
  
  if (cachedResults) {
    logger.info(`Character search results for "${q}" found in cache`);
    return res.json(formatResponse(cachedResults.data, cachedResults.pagination));
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Search from database
  let characters = await Character.find({ 
    name: { $regex: q, $options: 'i' } 
  })
    .sort({ favorites: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  let total = await Character.countDocuments({ 
    name: { $regex: q, $options: 'i' } 
  });
  
  // If not enough results, try Jikan API
  if (characters.length < 5 && q.trim().length > 0) {
    logger.info(`Only ${characters.length} characters found in database for "${q}", trying Jikan API`);
    
    try {
      const response = await jikanService.searchCharacters(q, {}, 1);
      
      if (response && response.data && response.data.length > 0) {
        logger.info(`Found ${response.data.length} characters from Jikan API for "${q}"`);
        
        // Transform and save characters to database
        const bulkOps = response.data.map(char => ({
          updateOne: {
            filter: { malId: char.mal_id },
            update: {
              $set: {
                malId: char.mal_id,
                name: char.name,
                nameKanji: char.name_kanji,
                nicknames: [],
                favorites: char.favorites,
                about: char.about,
                images: {
                  jpg: {
                    imageUrl: char.images?.jpg?.image_url,
                    smallImageUrl: char.images?.jpg?.small_image_url,
                    largeImageUrl: char.images?.jpg?.large_image_url
                  },
                  webp: {
                    imageUrl: char.images?.webp?.image_url,
                    smallImageUrl: char.images?.webp?.small_image_url,
                    largeImageUrl: char.images?.webp?.large_image_url
                  }
                },
                animeography: [],
                mangaography: [],
                voiceActors: [],
                lastUpdated: new Date()
              }
            },
            upsert: true
          }
        }));
        
        // Save to database
        await Character.bulkWrite(bulkOps);
        logger.info(`Saved ${bulkOps.length} characters to database from Jikan search`);
        
        // Re-query to get updated results
        characters = await Character.find({ 
          name: { $regex: q, $options: 'i' } 
        })
          .sort({ favorites: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
        
        total = await Character.countDocuments({ 
          name: { $regex: q, $options: 'i' } 
        });
      }
    } catch (error) {
      logger.error(`Error searching characters from Jikan API: ${error.message}`);
      // Continue with existing results
    }
  }
  
  const pagination = createPagination(page, limit, total);
  logger.info(`Found ${characters.length} characters matching query: "${q}"`);
  
  // Cache the results
  const resultsToCache = {
    data: characters,
    pagination
  };
  
  await setCache(cacheKey, resultsToCache, 60 * 60 * 24); // 24 hours TTL
  
  return res.json(formatResponse(characters, pagination));
});

/**
 * @desc    Get popular characters
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getPopularCharacters = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  logger.info(`Fetching popular characters, page: ${page}, limit: ${limit}`);
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const characters = await Character.find()
    .sort({ favorites: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  let total = await Character.countDocuments();
  
  const pagination = createPagination(page, limit, total);
  logger.info(`Successfully fetched ${characters.length} popular characters`);
  
  return res.json(formatResponse(characters, pagination));
});

/**
 * @desc    Get characters by anime ID
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getCharactersByAnime = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const { page = 1, limit = 20, mainOnly = 'true' } = req.query;
  
  logger.info(`Fetching characters for anime ID: ${animeId}, mainOnly: ${mainOnly}`);
  
  // Convert mainOnly string to boolean
  const mainOnlyBool = mainOnly === 'true' || mainOnly === '1';
  
  const result = await characterService.getCharactersByAnime(parseInt(animeId), {
    page,
    limit,
    mainOnly: mainOnlyBool
  });
  
  logger.info(`Successfully fetched ${result.data.length} characters for anime ID: ${animeId}`);
  return res.json(formatResponse(result.data, result.pagination));
}); 