const Playlist = require('../models/Playlist');
const Anime = require('../models/Anime');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { formatResponse, AppError, catchAsync, createPagination } = require('../utils/controllerUtils');
const logger = require('../utils/logger')('Playlist');

/**
 * @desc    Create a new playlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.createPlaylist = catchAsync(async (req, res) => {
  const { name, description, isPublic = true, animeIds = [] } = req.body;
  const user = req.user;
  
  logger.info(`Creating new playlist for user ${user._id}: ${name}`);
  
  // Validate required fields
  if (!name) {
    logger.warn('Playlist creation failed: Name is required');
    throw AppError.badRequest('Playlist name is required');
  }
  
  // Check if playlist with the same name exists for this user
  const existingPlaylist = await Playlist.findOne({
    owner: user._id,
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  
  if (existingPlaylist) {
    logger.warn(`Playlist creation failed: Duplicate name "${name}" for user ${user._id}`);
    throw AppError.badRequest('You already have a playlist with this name');
  }
  
  // Validate animeIds if provided
  let anime = [];
  if (animeIds && animeIds.length > 0) {
    logger.info(`Validating ${animeIds.length} anime IDs for playlist creation`);
    anime = await Anime.find({ malId: { $in: animeIds } })
      .select('malId titles.default images.jpg')
      .lean();
    
    if (anime.length === 0) {
      logger.warn('Playlist creation failed: No valid anime provided');
      throw AppError.badRequest('No valid anime provided');
    }
  }
  
  // Create the playlist
  const playlist = await Playlist.create({
    name,
    description: description || '',
    isPublic,
    owner: user._id,
    items: anime.map(item => ({
      anime: {
        malId: item.malId,
        title: item.titles.default,
        imageUrl: item.images.jpg.imageUrl
      },
      addedAt: Date.now()
    })),
    animeCount: anime.length
  });
  
  logger.info(`Playlist created successfully: ${playlist._id}`);
  
  // Log activity if public
  if (isPublic) {
    logger.info(`Creating activity log for public playlist: ${playlist._id}`);
    await ActivityLog.createActivity({
      userId: user._id,
      activityType: 'playlist_create',
      targetId: playlist._id,
      targetModel: 'Playlist',
      isPublic: true
    });
  }
  
  return res.status(201).json(formatResponse(playlist));
});

/**
 * @desc    Get playlist by slug
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getPlaylist = catchAsync(async (req, res) => {
  const { slug } = req.params;
  logger.info(`Fetching playlist with slug: ${slug}`);
  
  // Find playlist
  const playlist = await Playlist.findOne({ slug })
    .populate('owner', 'username displayName avatarUrl')
    .lean();
  
  if (!playlist) {
    logger.warn(`Playlist not found with slug: ${slug}`);
    throw AppError.notFound('Playlist');
  }
  
  // If playlist is private, check ownership
  if (!playlist.isPublic && (!req.user || playlist.owner._id.toString() !== req.user._id.toString())) {
    logger.warn(`Unauthorized access attempt to private playlist: ${slug}`);
    throw AppError.forbidden('This playlist is private');
  }
  
  logger.info(`Successfully fetched playlist: ${slug}`);
  return res.json(formatResponse(playlist));
});

/**
 * @desc    Update playlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.updatePlaylist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, isPublic } = req.body;
  const user = req.user;
  
  logger.info(`Updating playlist ${id} for user ${user._id}`);
  
  // Find playlist
  const playlist = await Playlist.findById(id);
  
  if (!playlist) {
    logger.warn(`Playlist not found for update: ${id}`);
    throw AppError.notFound('Playlist');
  }
  
  // Check ownership
  if (playlist.owner.toString() !== user._id.toString()) {
    logger.warn(`Unauthorized update attempt on playlist ${id} by user ${user._id}`);
    throw AppError.forbidden('You can only update your own playlists');
  }
  
  // Update fields
  if (name) playlist.name = name;
  if (description !== undefined) playlist.description = description;
  if (isPublic !== undefined) playlist.isPublic = isPublic;
  
  await playlist.save();
  
  logger.info(`Playlist ${id} updated successfully`);
  
  // Log activity if changing to public
  if (isPublic && !playlist.isPublic) {
    logger.info(`Creating activity log for newly public playlist: ${id}`);
    await ActivityLog.createActivity({
      userId: user._id,
      activityType: 'playlist_update',
      targetId: playlist._id,
      targetModel: 'Playlist',
      isPublic: true
    });
  }
  
  return res.json(formatResponse(playlist));
});

/**
 * @desc    Delete playlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.deletePlaylist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  
  logger.info(`Deleting playlist ${id} for user ${user._id}`);
  
  // Find playlist
  const playlist = await Playlist.findById(id);
  
  if (!playlist) {
    logger.warn(`Playlist not found for deletion: ${id}`);
    throw AppError.notFound('Playlist');
  }
  
  // Check ownership
  if (playlist.owner.toString() !== user._id.toString()) {
    logger.warn(`Unauthorized deletion attempt on playlist ${id} by user ${user._id}`);
    throw AppError.forbidden('You can only delete your own playlists');
  }
  
  // Delete playlist
  await playlist.remove();
  
  logger.info(`Playlist ${id} deleted successfully`);
  
  // Log activity
  await ActivityLog.createActivity({
    userId: user._id,
    activityType: 'playlist_delete',
    targetId: id,
    targetModel: 'Playlist',
    isPublic: false
  });
  
  return res.json(formatResponse({ 
    success: true,
    message: 'Playlist deleted successfully'
  }));
});

/**
 * @desc    Add anime to playlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.addAnimeToPlaylist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { animeId } = req.body;
  const user = req.user;
  
  if (!animeId) {
    throw AppError.badRequest('Anime ID is required');
  }
  
  // Find playlist
  const playlist = await Playlist.findById(id);
  
  if (!playlist) {
    throw AppError.notFound('Playlist');
  }
  
  // Check ownership
  if (playlist.owner.toString() !== user._id.toString()) {
    throw AppError.forbidden('You can only update your own playlists');
  }
  
  // Check if anime exists
  const anime = await Anime.findOne({ malId: animeId })
    .select('malId titles.default images.jpg')
    .lean();
  
  if (!anime) {
    throw AppError.notFound('Anime');
  }
  
  // Check if anime is already in playlist
  const exists = playlist.items.some(item => 
    item.anime.malId === anime.malId
  );
  
  if (exists) {
    throw AppError.badRequest('Anime is already in this playlist');
  }
  
  // Add anime to playlist
  playlist.items.push({
    anime: {
      malId: anime.malId,
      title: anime.titles.default,
      imageUrl: anime.images.jpg.imageUrl
    },
    addedAt: Date.now()
  });
  
  playlist.animeCount = playlist.items.length;
  await playlist.save();
  
  return res.json(formatResponse(playlist));
});

/**
 * @desc    Remove anime from playlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.removeAnimeFromPlaylist = catchAsync(async (req, res) => {
  const { id, animeId } = req.params;
  const user = req.user;
  
  // Find playlist
  const playlist = await Playlist.findById(id);
  
  if (!playlist) {
    throw AppError.notFound('Playlist');
  }
  
  // Check ownership
  if (playlist.owner.toString() !== user._id.toString()) {
    throw AppError.forbidden('You can only update your own playlists');
  }
  
  // Remove anime from playlist
  playlist.items = playlist.items.filter(item => 
    item.anime.malId !== parseInt(animeId)
  );
  
  playlist.animeCount = playlist.items.length;
  await playlist.save();
  
  return res.json(formatResponse(playlist));
});

/**
 * @desc    Like/unlike playlist
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.toggleLike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  
  // Find playlist
  const playlist = await Playlist.findById(id);
  
  if (!playlist) {
    throw AppError.notFound('Playlist');
  }
  
  // Check if playlist is public
  if (!playlist.isPublic) {
    throw AppError.forbidden('Cannot like a private playlist');
  }
  
  // Check if user has already liked
  const alreadyLiked = playlist.likes.some(
    like => like.toString() === user._id.toString()
  );
  
  // Toggle like
  if (alreadyLiked) {
    // Unlike
    playlist.likes = playlist.likes.filter(
      like => like.toString() !== user._id.toString()
    );
  } else {
    // Like
    playlist.likes.push(user._id);
    
    // Create notification if not owner
    if (playlist.owner.toString() !== user._id.toString()) {
      await Notification.createNotification({
        recipient: playlist.owner,
        sender: user._id,
        type: 'playlist_like',
        message: `${user.username} liked your playlist "${playlist.name}"`,
        targetId: playlist._id,
        targetModel: 'Playlist'
      });
      
      // Create activity
      await ActivityLog.createActivity({
        userId: user._id,
        activityType: 'playlist_like',
        targetId: playlist._id,
        targetModel: 'Playlist',
        isPublic: true
      });
    }
  }
  
  await playlist.save();
  
  return res.json(formatResponse({
    liked: !alreadyLiked,
    likesCount: playlist.likes.length
  }));
}); 