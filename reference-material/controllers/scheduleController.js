const Anime = require('../models/Anime');
const animeService = require('../services/animeService');
const { formatResponse, catchAsync, createPagination } = require('../utils/controllerUtils');
const logger = require('../utils/logger')('Schedule');
const { getBroadcastInTimezone } = require('../utils/timeUtils');

/**
 * @desc    Get anime schedule by day
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getScheduleByDay = catchAsync(async (req, res) => {
  const { 
    day, 
    page = 1, 
    limit = 20, 
    status, 
    genres,
    sort = 'broadcast',
    timezone
  } = req.query;
  
  logger.info(`Fetching schedule for day: ${day}, page: ${page}, limit: ${limit}${timezone ? `, timezone: ${timezone}` : ''}`);
  
  // Parse genres if provided
  let parsedGenres = [];
  if (genres) {
    parsedGenres = Array.isArray(genres) ? genres : genres.split(',');
    logger.info(`Filtering by genres: ${parsedGenres.join(', ')}`);
  }
  
  // Get sort options
  const sortOption = {};
  if (sort === 'popularity') {
    sortOption.popularity = -1;
    logger.info('Sorting by popularity');
  } else if (sort === 'score') {
    sortOption.score = -1;
    logger.info('Sorting by score');
  } else if (sort === 'title') {
    sortOption.title = 1;
    logger.info('Sorting by title');
  } else {
    // Default sort by broadcast time
    sortOption['broadcast.time'] = 1;
    logger.info('Sorting by broadcast time');
  }
  
  // If timezone is provided, use the timezone-aware logic
  if (timezone) {
    return handleTimezoneAwareSchedule(req, res);
  }
  
  // Regular (non-timezone-aware) logic starts here
  
  // Handle different day formats
  let queryDay;
  if (day) {
    // If it's already in the plural format (e.g., "Fridays")
    if (typeof day === 'string' && day.endsWith('s')) {
      queryDay = day; // Use as is
    } else {
      // Map lowercase singular day to proper broadcast day format
      const dayMap = {
        'monday': 'Mondays',
        'tuesday': 'Tuesdays',
        'wednesday': 'Wednesdays',
        'thursday': 'Thursdays',
        'friday': 'Fridays',
        'saturday': 'Saturdays',
        'sunday': 'Sundays',
        'other': 'Other',
        'unknown': null
      };
      queryDay = dayMap[day.toLowerCase()] || day;
    }
    logger.info(`Converted day format: ${day} -> ${queryDay}`);
  }
  
  const query = {};
  
  // Add filters to query
  if (day) query['broadcast.day'] = queryDay;
  if (status) {
    query.status = status;
    logger.info(`Filtering by status: ${status}`);
  }
  
  // Add genre filter if specified
  if (parsedGenres.length > 0) {
    query['genres.name'] = { $in: parsedGenres };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  logger.info(`Executing query with filters: ${JSON.stringify(query)}`);
  
  const anime = await Anime.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  let total = await Anime.countDocuments(query);
  
  const pagination = createPagination(page, limit, total);
  
  logger.info(`Found ${anime.length} anime matching the criteria`);
  
  // Sort by broadcast time if it's the default sort
  if (sort === 'broadcast') {
    anime.sort((a, b) => {
      // Handle cases where broadcast time might be null or undefined
      const timeA = a.broadcast?.time || '99:99';
      const timeB = b.broadcast?.time || '99:99';
      return timeA.localeCompare(timeB);
    });
    logger.info('Applied secondary sort by broadcast time');
  }
  
  return res.json(formatResponse(anime, pagination));
});

/**
 * Helper function to handle timezone-aware schedule requests
 * @private
 */
const handleTimezoneAwareSchedule = catchAsync(async (req, res) => {
  const { 
    day, 
    page = 1, 
    limit = 20, 
    status, 
    genres,
    sort = 'broadcast',
    timezone = 'IST' // Default to IST, but allow any supported timezone
  } = req.query;
  
  logger.info(`Processing timezone-aware schedule for day: ${day}, timezone: ${timezone}`);
  
  // Parse genres if provided
  let parsedGenres = [];
  if (genres) {
    parsedGenres = Array.isArray(genres) ? genres : genres.split(',');
    logger.info(`Filtering by genres: ${parsedGenres.join(', ')}`);
  }
  
  // Get sort options
  const sortOption = {};
  if (sort === 'popularity') {
    sortOption.popularity = -1;
  } else if (sort === 'score') {
    sortOption.score = -1;
  } else if (sort === 'title') {
    sortOption.title = 1;
  } else {
    // Default sort by broadcast time
    sortOption['broadcast.time'] = 1;
  }
  
  // For timezone-adjusted queries, we'll first get all results based on original data
  // and then convert them to the requested timezone
  
  // The source timezone is generally JST (Asia/Tokyo) for anime broadcasts
  const sourceTimezone = 'JST';
  
  // Define day mapping for both current and filter use
  const dayMap = {
    'monday': 'Mondays',
    'tuesday': 'Tuesdays',
    'wednesday': 'Wednesdays',
    'thursday': 'Thursdays',
    'friday': 'Fridays',
    'saturday': 'Saturdays',
    'sunday': 'Sundays',
    'other': 'Other',
    'unknown': null
  };
  
  // First, determine if we need to filter by day
  // If user specified a day, we need to consider both that day and adjacent days 
  // since timezone conversion might shift broadcasts across day boundaries
  let queryDays = [];
  let dayFilter = {};
  
  if (day) {
    // Normalize the day input (handle case variations)
    const normalizedDay = typeof day === 'string' ? day.toLowerCase() : day;
    
    // Convert day to proper format
    const pluralDays = Object.values(dayMap);
    
    // Check if the day ends with 's' (e.g. "Mondays") or if it's in the day map
    let dayName;
    if (typeof normalizedDay === 'string' && normalizedDay.endsWith('s')) {
      // It might be in the plural form directly (e.g., "mondays")
      const capitalizedDay = normalizedDay.charAt(0).toUpperCase() + normalizedDay.slice(1);
      dayName = pluralDays.includes(capitalizedDay) ? capitalizedDay : null;
    } else {
      dayName = dayMap[normalizedDay];
    }
    
    // If dayName is still not found, try to match against plural days directly (case-insensitive)
    if (!dayName) {
      const matchingDay = pluralDays.find(d => 
        d.toLowerCase() === normalizedDay
      );
      dayName = matchingDay || null;
    }
    
    if (dayName) {
      // Find the day index
      const dayIndex = pluralDays.indexOf(dayName);
      
      if (dayIndex !== -1) {
        // Get previous and next days (with wrap-around)
        const prevDay = pluralDays[(dayIndex - 1 + 7) % 7];
        const nextDay = pluralDays[(dayIndex + 1) % 7];
        
        // Include adjacent days in our query to handle timezone shifts
        queryDays = [prevDay, dayName, nextDay];
        dayFilter = { 'broadcast.day': { $in: queryDays } };
        
        logger.info(`Expanded day query to include adjacent days: ${queryDays.join(', ')}`);
      } else {
        dayFilter = { 'broadcast.day': dayName };
      }
    } else {
      logger.warn(`Invalid day format provided: ${day}`);
    }
  }
  
  // Build the full query
  const query = {
    ...dayFilter
  };
  
  if (status) {
    query.status = status;
    logger.info(`Filtering by status: ${status}`);
  }
  
  // Add genre filter if specified
  if (parsedGenres.length > 0) {
    query['genres.name'] = { $in: parsedGenres };
  }
  
  // Get a larger set of results to account for day shifts due to timezone conversion
  // We'll filter to the correct day after conversion
  const expandedLimit = parseInt(limit) * 3; // Get 3x the requested limit to account for filtering
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  logger.info(`Executing query with filters: ${JSON.stringify(query)}`);
  
  const animeList = await Anime.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(expandedLimit)
    .lean();
  
  // Get total count for correct pagination
  let total = await Anime.countDocuments(query);
  
  logger.info(`Found ${animeList.length} anime matching initial criteria`);
  
  // Convert broadcast times to the requested timezone
  const convertedAnimeList = animeList.map(anime => {
    // Only attempt conversion if broadcast info exists
    if (anime.broadcast && anime.broadcast.time) {
      const convertedBroadcast = getBroadcastInTimezone(anime.broadcast, timezone);
      return {
        ...anime,
        broadcast: convertedBroadcast
      };
    }
    return anime;
  });
  
  // If filtering by day, keep only anime that match the requested day after timezone conversion
  let filteredAnimeList = convertedAnimeList;
  if (day) {
    // Use the same day normalization logic as above for consistency
    const normalizedDay = typeof day === 'string' ? day.toLowerCase() : day;
    
    let targetDay;
    if (typeof normalizedDay === 'string' && normalizedDay.endsWith('s')) {
      const capitalizedDay = normalizedDay.charAt(0).toUpperCase() + normalizedDay.slice(1);
      targetDay = pluralDays.includes(capitalizedDay) ? capitalizedDay : null;
    } else {
      targetDay = dayMap[normalizedDay];
    }
    
    // If not found, try to match directly
    if (!targetDay) {
      const matchingDay = pluralDays.find(d => 
        d.toLowerCase() === normalizedDay
      );
      targetDay = matchingDay || null;
    }
    
    if (targetDay) {
      filteredAnimeList = convertedAnimeList.filter(anime => 
        anime.broadcast && anime.broadcast.day === targetDay
      );
      
      logger.info(`Filtered to ${filteredAnimeList.length} anime broadcasting on ${targetDay} in ${timezone} timezone`);
    } else {
      // If we couldn't resolve the day, just return all results
      logger.warn(`Could not resolve target day for filtering: ${day}`);
    }
  }
  
  // Apply pagination to the timezone-filtered results
  const startIndex = 0; // Already skipped in the DB query
  const endIndex = Math.min(parseInt(limit), filteredAnimeList.length);
  const paginatedResults = filteredAnimeList.slice(startIndex, endIndex);
  
  // Update the total count for pagination accuracy
  if (day) {
    // If we filtered by day, we need to estimate the total count
    const filterRatio = filteredAnimeList.length / animeList.length || 1;
    total = Math.ceil(total * filterRatio);
  }
  
  const pagination = createPagination(page, limit, total);
  
  // Sort by broadcast time if it's the default sort
  if (sort === 'broadcast') {
    paginatedResults.sort((a, b) => {
      // Handle cases where broadcast time might be null or undefined
      const timeA = a.broadcast?.time || '99:99';
      const timeB = b.broadcast?.time || '99:99';
      return timeA.localeCompare(timeB);
    });
    logger.info('Applied secondary sort by broadcast time');
  }
  
  return res.json(formatResponse(paginatedResults, pagination));
});

/**
 * @desc    Get seasonal anime
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getSeasonalAnime = catchAsync(async (req, res) => {
  const { 
    season, 
    year, 
    page = 1, 
    limit = 20, 
    sort = 'broadcast',
    genres,
    status,
    rating
  } = req.query;
  
  logger.info(`Fetching seasonal anime for season: ${season}, year: ${year}, page: ${page}, limit: ${limit}`);
  
  // Parse genres if provided
  let parsedGenres = [];
  if (genres) {
    parsedGenres = Array.isArray(genres) ? genres : genres.split(',');
    logger.info(`Filtering by genres: ${parsedGenres.join(', ')}`);
  }
  
  // Get sort options
  const sortOption = {};
  if (sort === 'popularity') {
    sortOption.popularity = -1;
    logger.info('Sorting by popularity');
  } else if (sort === 'score') {
    sortOption.score = -1;
    logger.info('Sorting by score');
  } else if (sort === 'title') {
    sortOption.title = 1;
    logger.info('Sorting by title');
  } else {
    // Default sort by broadcast time
    sortOption['broadcast.time'] = 1;
    logger.info('Sorting by broadcast time');
  }
  
  const query = {};
  
  // Add filters to query
  if (season) query.season = season;
  if (year) query.year = year;
  if (status) {
    query.status = status;
    logger.info(`Filtering by status: ${status}`);
  }
  if (rating) {
    query.rating = rating;
    logger.info(`Filtering by rating: ${rating}`);
  }
  
  // Add genre filter if specified
  if (parsedGenres.length > 0) {
    query['genres.name'] = { $in: parsedGenres };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  logger.info(`Executing query with filters: ${JSON.stringify(query)}`);
  
  const anime = await Anime.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  let total = await Anime.countDocuments(query);
  
  const pagination = createPagination(page, limit, total);
  
  logger.info(`Found ${anime.length} anime matching the criteria`);
  
  // Sort by broadcast time if it's the default sort
  if (sort === 'broadcast') {
    anime.sort((a, b) => {
      // Handle cases where broadcast time might be null or undefined
      const timeA = a.broadcast?.time || '99:99';
      const timeB = b.broadcast?.time || '99:99';
      return timeA.localeCompare(timeB);
    });
    logger.info('Applied secondary sort by broadcast time');
  }
  
  return res.json(formatResponse(anime, pagination));
});

/**
 * @desc    Get currently airing anime
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getAiringAnime = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    sort = 'popularity',
    genres
  } = req.query;
  
  const query = { status: 'Currently Airing' };
  
  // Parse genres if provided
  let parsedGenres = [];
  if (genres) {
    parsedGenres = Array.isArray(genres) ? genres : genres.split(',');
  }
  
  // Add genre filter if specified
  if (parsedGenres.length > 0) {
    query['genres.name'] = { $in: parsedGenres };
  }
  
  // Get sort options
  const sortOption = {};
  if (sort === 'popularity') sortOption.popularity = -1;
  else if (sort === 'score') sortOption.score = -1;
  else if (sort === 'title') sortOption.title = 1;
  else sortOption.popularity = -1; // Default sort
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const anime = await Anime.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  let total = await Anime.countDocuments(query);
  
  const pagination = createPagination(page, limit, total);
  
  return res.json(formatResponse(anime, pagination));
});

/**
 * @desc    Get upcoming anime
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getUpcomingAnime = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    sort = 'popularity',
    genres 
  } = req.query;
  
  const query = { status: 'Not yet aired' };
  
  // Parse genres if provided
  let parsedGenres = [];
  if (genres) {
    parsedGenres = Array.isArray(genres) ? genres : genres.split(',');
  }
  
  // Add genre filter if specified
  if (parsedGenres.length > 0) {
    query['genres.name'] = { $in: parsedGenres };
  }
  
  // Get sort options
  const sortOption = {};
  if (sort === 'popularity') sortOption.popularity = -1;
  else if (sort === 'score') sortOption.score = -1;
  else if (sort === 'title') sortOption.title = 1;
  else sortOption.popularity = -1; // Default sort
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const anime = await Anime.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  let total = await Anime.countDocuments(query);
  
  const pagination = createPagination(page, limit, total);
  
  return res.json(formatResponse(anime, pagination));
});

/**
 * @desc    Get upcoming season preview
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getUpcomingSeasonPreview = catchAsync(async (req, res) => {
  const upcoming = await animeService.getUpcomingSeason();
  
  return res.json(formatResponse(
    upcoming.data || [],
    upcoming.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  ));
});