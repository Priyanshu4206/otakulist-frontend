const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { standardLimiter } = require('../middleware/rateLimiter');
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount, 
  deleteNotification 
} = require('../controllers/notificationController');

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user's notifications
 *     description: Retrieves a paginated list of the authenticated user's notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
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
 *           maximum: 50
 *           default: 20
 *         description: Number of notifications per page
 *         example: 20
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filter by read status (true for read, false for unread, omit for all)
 *         example: false
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [FOLLOW, WATCHLIST_COMMENT, PLAYLIST_COMMENT, PLAYLIST_LIKE, SYSTEM]
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
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
 *                         type: string
 *                         example: "60e5c7b8f5a9c82d4c8b4567"
 *                       user:
 *                         type: string
 *                         description: ID of the user receiving the notification
 *                         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                       type:
 *                         type: string
 *                         enum: [FOLLOW, WATCHLIST_COMMENT, PLAYLIST_COMMENT, PLAYLIST_LIKE, SYSTEM]
 *                         example: "FOLLOW"
 *                       message:
 *                         type: string
 *                         example: "animefan123 started following you"
 *                       data:
 *                         type: object
 *                         description: Additional data specific to the notification type
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "5f9d0c1c2b9b8a2a2c9b8a2b"
 *                           username:
 *                             type: string
 *                             example: "animefan123"
 *                       read:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-04-15T19:22:10.123Z"
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
 *       401:
 *         description: Not authenticated
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
router.get('/', protect, standardLimiter, getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to mark as read
 *         example: "60e5c7b8f5a9c82d4c8b4567"
 *     responses:
 *       200:
 *         description: Notification successfully marked as read
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
 *                       type: string
 *                       example: "60e5c7b8f5a9c82d4c8b4567"
 *                     read:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Notification marked as read"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
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
router.patch('/:id/read', protect, standardLimiter, markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Marks all of the current user's unread notifications as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications successfully marked as read
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
 *                     count:
 *                       type: integer
 *                       description: Number of notifications that were marked as read
 *                       example: 12
 *                     message:
 *                       type: string
 *                       example: "All notifications marked as read"
 *       401:
 *         description: Not authenticated
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
router.patch('/read-all', protect, standardLimiter, markAllAsRead);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Retrieves the count of unread notifications for the current user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved unread count
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
 *                     count:
 *                       type: integer
 *                       description: Number of unread notifications
 *                       example: 5
 *       401:
 *         description: Not authenticated
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
router.get('/unread-count', protect, standardLimiter, getUnreadCount);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Deletes a specific notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to delete
 *         example: "60e5c7b8f5a9c82d4c8b4567"
 *     responses:
 *       200:
 *         description: Notification successfully deleted
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
 *                       type: string
 *                       example: "60e5c7b8f5a9c82d4c8b4567"
 *                     message:
 *                       type: string
 *                       example: "Notification deleted successfully"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
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
router.delete('/:id', protect, standardLimiter, deleteNotification);

module.exports = router; 