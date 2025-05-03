const Watchlist = require('../models/Watchlist');
const Anime = require('../models/Anime');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { formatResponse, AppError, catchAsync } = require('../utils/controllerUtils');
const logger = require('../utils/logger')('Watchlist');

/**
 * @desc    Add/update anime in watchlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.addUpdateWatchlist = catchAsync(async (req, res) => {
  const { animeId, status, rating, progress, notes } = req.body;
  const user = req.user;
  
  logger.info(`User ${user._id} attempting to ${req.method === 'POST' ? 'add' : 'update'} anime ${animeId} in watchlist`);
  
  // Validate required fields
  if (!animeId || !status) {
    logger.warn(`Missing required fields: animeId=${animeId}, status=${status}`);
    throw AppError.badRequest('Anime ID and status are required');
  }
  
  // Validate status
  const validStatuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
  if (!validStatuses.includes(status)) {
    logger.warn(`Invalid status provided: ${status}`);
    throw AppError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Validate rating if provided
  if (rating !== undefined && (rating < 0 || rating > 10)) {
    logger.warn(`Invalid rating provided: ${rating}`);
    throw AppError.badRequest('Rating must be between 0 and 10');
  }
  
  // Check if anime exists
  const anime = await Anime.findOne({ malId: animeId })
    .select('malId titles.default images.jpg episodes')
    .lean();
  
  if (!anime) {
    logger.warn(`Anime not found with ID: ${animeId}`);
    throw AppError.notFound('Anime');
  }
  
  logger.info(`Found anime: ${anime.titles.default} (${animeId})`);
  
  // Check if watchlist entry already exists
  let watchlistEntry = await Watchlist.findOne({
    user: user._id,
    'anime.malId': animeId
  });
  
  // Update existing entry or create new one
  const oldStatus = watchlistEntry ? watchlistEntry.status : null;
  
  if (watchlistEntry) {
    logger.info(`Updating existing watchlist entry for anime ${animeId}`);
    // Update existing entry
    watchlistEntry.status = status;
    if (rating !== undefined) watchlistEntry.rating = rating;
    if (progress !== undefined) watchlistEntry.progress = progress;
    if (notes !== undefined) watchlistEntry.notes = notes;
    watchlistEntry.updatedAt = Date.now();
  } else {
    logger.info(`Creating new watchlist entry for anime ${animeId}`);
    // Create new entry
    watchlistEntry = new Watchlist({
      user: user._id,
      anime: {
        malId: anime.malId,
        title: anime.titles.default,
        imageUrl: anime.images.jpg.imageUrl,
        totalEpisodes: anime.episodes || 0
      },
      status,
      rating: rating || 0,
      progress: progress || 0,
      notes: notes || ''
    });
  }
  
  await watchlistEntry.save();
  logger.info(`Successfully ${oldStatus ? 'updated' : 'added'} anime ${animeId} to watchlist with status: ${status}`);
  
  // Log activity
  await ActivityLog.createActivity({
    userId: user._id,
    activityType: oldStatus ? 'watchlist_update' : 'watchlist_add',
    targetId: anime.malId,
    targetModel: 'Anime',
    details: {
      animeTitle: anime.titles.default,
      status,
      oldStatus
    },
    isPublic: true
  });
  
  // After updating the watchlist status
  if (req.body.status === 'completed') {
    // Get the count of completed anime for the user
    const completedAnimeCount = await Watchlist.countDocuments({
      userId: user._id,
      status: 'completed'
    });
    
    // Update user achievements
    const achievementResult = await user.updateAchievements(completedAnimeCount);
    
    if (achievementResult.newAchievement) {
      // Create activity for the achievement
      await ActivityLog.createActivity({
        userId: user._id,
        activityType: 'achievement_unlocked',
        targetId: user._id,
        targetModel: 'User',
        isPublic: true,
        extraData: {
          title: achievementResult.title,
          description: achievementResult.description
        }
      });
      
      // Create notification for the achievement
      await Notification.createNotification({
        recipient: user._id,
        type: 'achievement',
        message: `Congratulations! You've earned the "${achievementResult.title}" title - ${achievementResult.description}`,
        extraData: {
          achievementTitle: achievementResult.title
        }
      });
      
      // Add achievement info to the response
      watchlistEntry.newAchievement = {
        title: achievementResult.title,
        description: achievementResult.description
      };
    }
    
    await user.save();
  }
  
  // After adding to watchlist, check for collection achievements
  const watchlistCount = await Watchlist.countDocuments({ userId: user._id });
  const achievementResult = await user.checkCollectionAchievements(watchlistCount);

  if (achievementResult.newAchievement) {
    // Create activity for achievement
    await ActivityLog.createActivity({
      userId: user._id,
      activityType: 'achievement_unlocked',
      targetId: user._id,
      targetModel: 'User',
      isPublic: true,
      extraData: {
        title: achievementResult.title,
        description: achievementResult.description
      }
    });
    
    // Create notification
    await Notification.createNotification({
      recipient: user._id,
      type: 'achievement',
      message: `Congratulations! You've earned the "${achievementResult.title}" title - ${achievementResult.description}`,
      extraData: {
        achievementTitle: achievementResult.title
      }
    });
    
    // Add achievement info to the response
    watchlistEntry.newAchievement = {
      title: achievementResult.title,
      description: achievementResult.description
    };
    
    await user.save();
  }
  
  return res.json(formatResponse(watchlistEntry));
});

/**
 * @desc    Get user's watchlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getWatchlist = catchAsync(async (req, res) => {
  const { status, sort = 'updatedAt', order = 'desc' } = req.query;
  const user = req.user;
  
  logger.info(`User ${user._id} fetching watchlist with filters: status=${status}, sort=${sort}, order=${order}`);
  
  // Build query
  const query = { user: user._id };
  if (status) query.status = status;
  
  // Build sort options
  const sortOption = {};
  if (sort === 'title') {
    sortOption['anime.title'] = order === 'desc' ? -1 : 1;
  } else if (sort === 'rating') {
    sortOption.rating = order === 'desc' ? -1 : 1;
  } else if (sort === 'progress') {
    sortOption.progress = order === 'desc' ? -1 : 1;
  } else {
    sortOption.updatedAt = order === 'desc' ? -1 : 1;
  }
  
  // Get watchlist
  const watchlist = await Watchlist.find(query)
    .sort(sortOption)
    .lean();
  
  logger.info(`Found ${watchlist.length} anime in user's watchlist`);
  
  // Get counts by status
  const counts = await Watchlist.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Format counts
  const statusCounts = {
    watching: 0,
    completed: 0,
    on_hold: 0,
    dropped: 0,
    plan_to_watch: 0
  };
  
  counts.forEach(item => {
    statusCounts[item._id] = item.count;
  });
  
  logger.info(`Watchlist status counts: ${JSON.stringify(statusCounts)}`);
  
  return res.json(formatResponse({
    watchlist,
    counts: statusCounts
  }));
});

/**
 * @desc    Get watchlist by status
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getWatchlistByStatus = catchAsync(async (req, res) => {
  const { status } = req.params;
  const { sort = 'updatedAt', order = 'desc' } = req.query;
  const user = req.user;
  
  logger.info(`User ${user._id} fetching watchlist with status: ${status}`);
  
  // Validate status
  const validStatuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
  if (!validStatuses.includes(status)) {
    logger.warn(`Invalid status requested: ${status}`);
    throw AppError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Build sort options
  const sortOption = {};
  if (sort === 'title') {
    sortOption['anime.title'] = order === 'desc' ? -1 : 1;
  } else if (sort === 'rating') {
    sortOption.rating = order === 'desc' ? -1 : 1;
  } else if (sort === 'progress') {
    sortOption.progress = order === 'desc' ? -1 : 1;
  } else {
    sortOption.updatedAt = order === 'desc' ? -1 : 1;
  }
  
  // Get watchlist
  const watchlist = await Watchlist.find({
    user: user._id,
    status
  })
    .sort(sortOption)
    .lean();
  
  logger.info(`Found ${watchlist.length} anime in user's ${status} watchlist`);
  
  return res.json(formatResponse(watchlist));
});

/**
 * @desc    Remove anime from watchlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.removeFromWatchlist = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const user = req.user;
  
  logger.info(`User ${user._id} attempting to remove anime ${animeId} from watchlist`);
  
  // Find watchlist entry
  const watchlistEntry = await Watchlist.findOne({
    user: user._id,
    'anime.malId': animeId
  });
  
  if (!watchlistEntry) {
    logger.warn(`Watchlist entry not found for anime ${animeId}`);
    throw AppError.notFound('Watchlist entry');
  }
  
  // Get anime title for activity log
  const animeTitle = watchlistEntry.anime.title;
  
  // Remove from watchlist
  await watchlistEntry.remove();
  logger.info(`Successfully removed anime ${animeId} from watchlist`);
  
  // Log activity
  await ActivityLog.createActivity({
    userId: user._id,
    activityType: 'watchlist_remove',
    targetId: parseInt(animeId),
    targetModel: 'Anime',
    details: {
      animeTitle
    },
    isPublic: false
  });
  
  return res.json(formatResponse({
    success: true,
    message: 'Removed from watchlist'
  }));
}); 