const Notification = require('../models/Notification');
const { formatResponse, AppError, catchAsync, createPagination } = require('../utils/controllerUtils');

/**
 * @desc    Get user's notifications
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const user = req.user;
  
  // Build query
  const query = { recipient: user._id };
  if (unreadOnly === 'true' || unreadOnly === true) {
    query.isRead = false;
  }
  
  // Get notifications with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('sender', 'username displayName avatarUrl')
    .lean();
  
  // Get total count for pagination
  let total = await Notification.countDocuments(query);
  
  const pagination = createPagination(page, limit, total);
  
  return res.json(formatResponse(notifications, pagination));
});

/**
 * @desc    Mark notification as read
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  
  // Find notification
  const notification = await Notification.findOne({
    _id: id,
    recipient: user._id
  });
  
  if (!notification) {
    throw AppError.notFound('Notification');
  }
  
  // Mark as read if not already read
  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();
  }
  
  return res.json(formatResponse({
    success: true,
    message: 'Notification marked as read'
  }));
});

/**
 * @desc    Mark all notifications as read
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.markAllAsRead = catchAsync(async (req, res) => {
  const user = req.user;
  
  // Update all unread notifications for this user
  const result = await Notification.updateMany(
    { recipient: user._id, isRead: false },
    { isRead: true, readAt: Date.now() }
  );
  
  return res.json(formatResponse({
    success: true,
    message: 'All notifications marked as read',
    count: result.nModified
  }));
});

/**
 * @desc    Get unread notification count
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getUnreadCount = catchAsync(async (req, res) => {
  const user = req.user;
  
  // Get unread count
  const count = await Notification.countDocuments({
    recipient: user._id,
    isRead: false
  });
  
  return res.json(formatResponse({
    unreadCount: count
  }));
});

/**
 * @desc    Delete notification
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  
  // Find notification
  const notification = await Notification.findOne({
    _id: id,
    recipient: user._id
  });
  
  if (!notification) {
    throw AppError.notFound('Notification');
  }
  
  // Delete notification
  await notification.remove();
  
  return res.json(formatResponse({
    success: true,
    message: 'Notification deleted'
  }));
}); 