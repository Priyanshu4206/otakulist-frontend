const User = require('../models/User');
const Playlist = require('../models/Playlist');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { formatResponse, AppError, catchAsync, createPagination } = require('../utils/controllerUtils');
const { deleteFile, getKeyFromUrl, uploadFileToS3 } = require('../utils/s3Uploader');
const logger = require('../utils/logger')('User');

/**
 * @desc    Get user profile by username
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getUserProfile = catchAsync(async (req, res) => {
  const { username } = req.params;
  
  // Find user by username slug
  const user = await User.findOne({ username_slug: username });
  
  if (!user) {
    throw AppError.notFound('User');
  }
  
  // Get user's public playlists
  const playlists = await Playlist.find({
    owner: user._id,
    isPublic: true
  }).select('name slug description animeCount coverImage').sort('-createdAt');
  
  // Check if logged-in user is following this user
  const isFollowing = req.user ? 
    req.user.following.includes(user._id) : false;
  
  // Return profile with additional data
  return res.json(formatResponse({
    ...user.toProfileJSON(),
    playlists,
    isFollowing
  }));
});

/**
 * @desc    Update user profile
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const { username, displayName, bio, preferences, settings } = req.body;
  const user = req.user;
  
  // Check if username is changed and available
  if (username && username !== user.username) {
    // Validate username format
    if (username.length < 3 || username.length > 30) {
      throw AppError.badRequest('Username must be between 3 and 30 characters');
    }
    
    // Check if username is taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw AppError.badRequest('Username is already taken');
    }
    
    user.username = username;
  }
  
  // Update other fields
  if (displayName) user.displayName = displayName;
  if (bio !== undefined) user.bio = bio;
  if (preferences) {
    user.preferences = {
      genres: preferences.genres || user.preferences.genres,
      tags: preferences.tags || user.preferences.tags
    };
  }
  
  // Update user settings if provided
  if (settings) {
    // Initialize settings object if it doesn't exist
    if (!user.settings) {
      user.settings = {};
    }
    
    // Update each setting if provided
    if (settings.receiveNotifications !== undefined) {
      user.settings.receiveNotifications = settings.receiveNotifications;
    }
    
    if (settings.showWatchlist !== undefined) {
      user.settings.showWatchlist = settings.showWatchlist;
    }
    
    if (settings.showFollowing !== undefined) {
      user.settings.showFollowing = settings.showFollowing;
    }
    
    if (settings.interfaceTheme) {
      user.settings.interfaceTheme = settings.interfaceTheme;
    }
  }
  
  await user.save();
  
  // Log activity
  await ActivityLog.createActivity({
    userId: user._id,
    activityType: 'profile_update',
    targetId: user._id,
    targetModel: 'User',
    isPublic: true
  });
  
  return res.json(formatResponse(user.toProfileJSON()));
});

/**
 * @desc    Upload user avatar
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.uploadAvatar = catchAsync(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatError('No file uploaded', 400));
    }

    // Delete old avatar if exists
    if (req.user.avatarUrl) {
      const oldKey = getKeyFromUrl(req.user.avatarUrl);
      if (oldKey) {
        try {
          await deleteFile(oldKey);
        } catch (deleteError) {
          logger.error(`Error deleting old avatar: ${deleteError.message}`);
          // Continue with upload even if old avatar deletion fails
        }
      }
    }

    // Upload new avatar to S3
    const uploadResult = await uploadFileToS3(req.file, 'avatars');
    logger.info('Avatar uploaded successfully', { location: uploadResult.location });

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: uploadResult.location },
      { new: true, select: '-password' }
    );

    return res.json(formatResponse({
      message: 'Avatar uploaded successfully',
      user: updatedUser
    }));
  } catch (error) {
    logger.error(`Error uploading avatar: ${error.message} ${req.file ? `(file: ${req.file.originalname}, type: ${req.file.mimetype}, size: ${req.file.size})` : '(no file)'}`);
    return res.status(500).json(formatServerError('Error uploading avatar'));
  }
});

/**
 * @desc    Follow a user
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.followUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;
  
  // Check if user exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    throw AppError.notFound('User');
  }
  
  // Can't follow yourself
  if (userId === currentUser.id) {
    throw AppError.badRequest('You cannot follow yourself');
  }
  
  // Check if already following
  if (currentUser.following.includes(userId)) {
    throw AppError.badRequest('You are already following this user');
  }
  
  // Add to following
  currentUser.following.push(userId);
  await currentUser.save();
  
  // Add to followers of the other user
  userToFollow.followers.push(currentUser._id);
  
  // Check for social achievements
  const achievementResult = await userToFollow.checkSocialAchievements();
  
  await userToFollow.save();
  
  // Create activity
  await ActivityLog.createActivity({
    userId: currentUser._id,
    activityType: 'user_follow',
    targetId: userToFollow._id,
    targetModel: 'User',
    isPublic: true
  });
  
  // Create notification for being followed
  await Notification.createNotification({
    recipient: userToFollow._id,
    sender: currentUser._id,
    type: 'follow',
    message: `${currentUser.username} started following you`,
    targetId: currentUser._id,
    targetModel: 'User'
  });
  
  // If user unlocked a new achievement, create notification for it too
  if (achievementResult.newAchievement) {
    // Create activity for achievement
    await ActivityLog.createActivity({
      userId: userToFollow._id,
      activityType: 'achievement_unlocked',
      targetId: userToFollow._id,
      targetModel: 'User',
      isPublic: true,
      extraData: {
        title: achievementResult.title,
        description: achievementResult.description
      }
    });
    
    // Create notification
    await Notification.createNotification({
      recipient: userToFollow._id,
      type: 'achievement',
      message: `Congratulations! You've earned the "${achievementResult.title}" title - ${achievementResult.description}`,
      extraData: {
        achievementTitle: achievementResult.title
      }
    });
  }
  
  return res.json(formatResponse({
    followingCount: currentUser.following.length
  }));
});

/**
 * @desc    Unfollow a user
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.unfollowUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;
  
  // Check if user exists
  const userToUnfollow = await User.findById(userId);
  if (!userToUnfollow) {
    throw AppError.notFound('User');
  }
  
  // Check if not following
  if (!currentUser.following.includes(userId)) {
    throw AppError.badRequest('You are not following this user');
  }
  
  // Remove from following
  currentUser.following = currentUser.following.filter(
    id => id.toString() !== userId
  );
  await currentUser.save();
  
  // Remove from followers of the other user
  userToUnfollow.followers = userToUnfollow.followers.filter(
    id => id.toString() !== currentUser._id.toString()
  );
  await userToUnfollow.save();
  
  // Create activity
  await ActivityLog.createActivity({
    userId: currentUser._id,
    activityType: 'user_unfollow',
    targetId: userToUnfollow._id,
    targetModel: 'User',
    isPublic: false
  });
  
  return res.json(formatResponse({
    followingCount: currentUser.following.length
  }));
});

/**
 * @desc    Get user activity feed
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getActivityFeed = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const currentUser = req.user;
  
  // Get IDs of users the current user follows
  const followingIds = currentUser.following;
  
  // Get activities from followed users
  const activities = await ActivityLog.find({
    $or: [
      { userId: { $in: followingIds }, isPublic: true },
      { userId: currentUser._id }
    ]
  })
    .sort('-createdAt')
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .populate('userId', 'username displayName avatarUrl')
    .lean();
  
  // Get count for pagination
  const total = await ActivityLog.countDocuments({
    $or: [
      { userId: { $in: followingIds }, isPublic: true },
      { userId: currentUser._id }
    ]
  });
  
  const pagination = createPagination(page, limit, total);
  
  return res.json(formatResponse(activities, pagination));
});

/**
 * @desc    Get recommended users
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getRecommendedUsers = catchAsync(async (req, res) => {
  const user = req.user;
  
  // Get users with similar preferences
  // that current user is not following
  // and limit to 5
  const recommendedUsers = await User.find({
    _id: { $ne: user._id, $nin: user.following },
    'preferences.genres': { $in: user.preferences.genres },
    isActive: true
  })
    .select('username displayName avatarUrl followers bio')
    .limit(5)
    .lean();
  
  return res.json(formatResponse(recommendedUsers));
});

/**
 * @desc    Get user's followers
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getFollowers = catchAsync(async (req, res) => {
  let userId;
  
  // For routes like /users/followers (no username parameter)
  // Or protected routes that should use the current user
  if (!req.params.username && req.user) {
    userId = req.user._id;
  }
  // For routes like /users/:username/followers
  else if (req.params.username) {
    const targetUser = await User.findOne({ username_slug: req.params.username });
    if (!targetUser) {
      throw AppError.notFound('User');
    }
    userId = targetUser._id;
  } 
  // No username in params and no authenticated user
  else {
    throw AppError.unauthorized('Authentication required');
  }
  
  // Get pagination parameters
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Populate followers with pagination
  const userWithFollowers = await User.findById(userId)
    .select('followers')
    .populate({
      path: 'followers',
      select: 'username username_slug displayName avatarUrl bio',
      options: { 
        limit: parseInt(limit)
      }
    })
    .lean();
  
  if (!userWithFollowers) {
    throw AppError.notFound('User');
  }
  
  // Handle pagination manually since MongoDB's populate limit doesn't work with skip
  const allFollowers = userWithFollowers.followers || [];
  const startIndex = skip;
  const endIndex = Math.min(startIndex + parseInt(limit), allFollowers.length);
  const paginatedFollowers = allFollowers.slice(startIndex, endIndex);
  
  // Get total followers count for pagination
  const total = allFollowers.length;
  
  // Create pagination info
  const pagination = createPagination(page, limit, total);
  
  // Return followers with pagination data
  return res.json(formatResponse(paginatedFollowers, pagination));
});

/**
 * @desc    Get users that the current user is following
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getFollowing = catchAsync(async (req, res) => {
  let userId;
  
  // For routes like /users/following (no username parameter)
  // Or protected routes that should use the current user
  if (!req.params.username && req.user) {
    userId = req.user._id;
  }
  // For routes like /users/:username/following
  else if (req.params.username) {
    const targetUser = await User.findOne({ username_slug: req.params.username });
    if (!targetUser) {
      throw AppError.notFound('User');
    }
    userId = targetUser._id;
  } 
  // No username in params and no authenticated user
  else {
    throw AppError.unauthorized('Authentication required');
  }
  
  // Get pagination parameters
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Populate following with pagination
  const userWithFollowing = await User.findById(userId)
    .select('following')
    .populate({
      path: 'following',
      select: 'username username_slug displayName avatarUrl bio',
      options: { 
        limit: parseInt(limit)
      }
    })
    .lean();
  
  if (!userWithFollowing) {
    throw AppError.notFound('User');
  }
  
  // Handle pagination manually since MongoDB's populate limit doesn't work with skip
  const allFollowing = userWithFollowing.following || [];
  const startIndex = skip;
  const endIndex = Math.min(startIndex + parseInt(limit), allFollowing.length);
  const paginatedFollowing = allFollowing.slice(startIndex, endIndex);
  
  // Get total following count for pagination
  const total = allFollowing.length;
  
  // Create pagination info
  const pagination = createPagination(page, limit, total);
  
  // Return following with pagination data
  return res.json(formatResponse(paginatedFollowing, pagination));
});

/**
 * @desc    Update user achievements when anime is completed
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.updateAchievements = catchAsync(async (req, res) => {
  const { animeCount } = req.body;
  const user = req.user;
  
  if (animeCount === undefined) {
    throw AppError.badRequest('Anime count is required');
  }
  
  // Update achievements based on the anime count
  const achievementResult = await user.updateAchievements(animeCount);
  await user.save();
  
  // If a new achievement was unlocked, create a notification
  if (achievementResult.newAchievement) {
    // Create activity
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
      type: 'system',
      message: `Congratulations! You've earned the "${achievementResult.title}" title - ${achievementResult.description}`,
      extraData: {
        achievementTitle: achievementResult.title
      }
    });
  }
  
  return res.json(formatResponse({
    achievements: user.achievements,
    newAchievementUnlocked: achievementResult.newAchievement
  }));
});

/**
 * @desc    Get all available achievements in the system
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getAllAchievements = catchAsync(async (req, res) => {
  const allAchievements = User.getAllAchievements();
  
  // Transform into a more frontend-friendly format
  const formattedAchievements = {
    categories: [
      {
        id: 'anime',
        name: 'Anime Watching',
        description: 'Achievements earned by watching anime',
        achievements: allAchievements.anime
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Achievements earned through social interactions',
        achievements: allAchievements.social
      },
      {
        id: 'collection',
        name: 'Collection',
        description: 'Achievements earned by building your anime collection',
        achievements: allAchievements.collection
      },
      {
        id: 'genre',
        name: 'Genre Specialist',
        description: 'Achievements earned by watching specific genres',
        achievements: allAchievements.genre
      },
      {
        id: 'special',
        name: 'Special',
        description: 'Special achievements for dedicated users',
        achievements: allAchievements.special
      }
    ],
    totalCount: Object.values(allAchievements).reduce((acc, arr) => acc + arr.length, 0)
  };
  
  return res.json(formatResponse(formattedAchievements));
});

/**
 * @desc    Get detailed achievements for a user
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getUserAchievements = catchAsync(async (req, res) => {
  let userId;
  
  // For routes like /users/achievements (no username parameter)
  // Or protected routes that should use the current user
  if (!req.params.username && req.user) {
    userId = req.user._id;
  }
  // For routes like /users/:username/achievements
  else if (req.params.username) {
    const targetUser = await User.findOne({ username_slug: req.params.username });
    if (!targetUser) {
      throw AppError.notFound('User');
    }
    userId = targetUser._id;
  } 
  // No username in params and no authenticated user
  else {
    throw AppError.unauthorized('Authentication required');
  }
  
  // Get user with populated achievements
  const user = await User.findById(userId);
  
  if (!user) {
    throw AppError.notFound('User');
  }
  
  // Get all possible achievements
  const allAchievements = User.getAllAchievements();
  
  // Create a map of unlocked achievements for easier lookup
  const unlockedMap = {};
  if (user.achievements && user.achievements.unlockedTitles) {
    user.achievements.unlockedTitles.forEach(achievement => {
      unlockedMap[achievement.title] = {
        ...achievement.toObject(),
        unlocked: true
      };
    });
  }
  
  // Process each category to include unlock status
  const processedCategories = Object.entries(allAchievements).map(([categoryId, achievements]) => {
    const processedAchievements = achievements.map(achievement => {
      const unlocked = unlockedMap[achievement.title] !== undefined;
      return {
        ...achievement,
        unlocked,
        unlockedAt: unlocked ? unlockedMap[achievement.title].unlockedAt : null,
        progress: getAchievementProgress(user, achievement)
      };
    });
    
    // Get category name based on ID
    let categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    let categoryDescription = '';
    
    switch(categoryId) {
      case 'anime':
        categoryName = 'Anime Watching';
        categoryDescription = 'Achievements earned by watching anime';
        break;
      case 'social':
        categoryName = 'Social';
        categoryDescription = 'Achievements earned through social interactions';
        break;
      case 'collection':
        categoryName = 'Collection';
        categoryDescription = 'Achievements earned by building your anime collection';
        break;
      case 'genre':
        categoryName = 'Genre Specialist';
        categoryDescription = 'Achievements earned by watching specific genres';
        break;
      case 'special':
        categoryName = 'Special';
        categoryDescription = 'Special achievements for dedicated users';
        break;
    }
    
    return {
      id: categoryId,
      name: categoryName,
      description: categoryDescription,
      achievements: processedAchievements,
      unlockedCount: processedAchievements.filter(a => a.unlocked).length,
      totalCount: processedAchievements.length
    };
  });
  
  // Calculate achievement stats
  const totalAchievements = Object.values(allAchievements).reduce(
    (acc, achievements) => acc + achievements.length, 0
  );
  
  const totalUnlocked = user.achievements.unlockedTitles 
    ? user.achievements.unlockedTitles.length 
    : 0;
  
  return res.json(formatResponse({
    username: user.username,
    displayName: user.displayName,
    current: user.achievements.title,
    animeWatchedCount: user.achievements.animeWatchedCount,
    categories: processedCategories,
    stats: {
      totalUnlocked,
      totalAchievements,
      completionPercentage: Math.round((totalUnlocked / totalAchievements) * 100)
    }
  }));
});

// Helper function to calculate achievement progress
function getAchievementProgress(user, achievement) {
  if (!achievement.threshold) {
    return 100; // For achievements without thresholds
  }
  
  let currentValue = 0;
  let progressPercentage = 0;
  
  switch(achievement.type) {
    case 'anime':
      currentValue = user.achievements.animeWatchedCount || 0;
      break;
    case 'social':
      currentValue = user.followers ? user.followers.length : 0;
      break;
    case 'collection':
      // We don't have direct access to watchlist count here, 
      // so this would need to be calculated elsewhere
      currentValue = 0; 
      break;
    case 'genre':
      // Genre-specific anime count would need additional data
      currentValue = 0;
      break;
  }
  
  // Calculate percentage (capped at 100%)
  progressPercentage = Math.min(Math.round((currentValue / achievement.threshold) * 100), 100);
  
  return {
    current: currentValue,
    target: achievement.threshold,
    percentage: progressPercentage
  };
} 