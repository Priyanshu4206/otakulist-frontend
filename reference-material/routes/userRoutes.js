const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { standardLimiter, userActionLimiter } = require('../middleware/rateLimiter');
const { avatarUpload } = require('../utils/s3Uploader');
const { 
  getUserProfile, 
  updateProfile, 
  uploadAvatar,
  followUser, 
  unfollowUser, 
  getActivityFeed,
  getRecommendedUsers,
  getFollowers,
  getFollowing,
  updateAchievements,
  getAllAchievements,
  getUserAchievements
} = require('../controllers/userController');


/**
 * @swagger
 * /users/update:
 *   patch:
 *     summary: Update user profile
 *     description: Updates the current user's profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: User's display name
 *                 example: "Anime Enthusiast"
 *               bio:
 *                 type: string
 *                 description: User's biography
 *                 maxLength: 500
 *                 example: "I love watching anime and discussing plot theories!"
 *               preferences:
 *                 type: object
 *                 properties:
 *                   genres:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: User's preferred genres
 *                     example: ["Action", "Romance", "Fantasy"]
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: User's preferred tags
 *                     example: ["Shonen", "Time Travel", "Magic"]
 *               settings:
 *                 type: object
 *                 properties:
 *                   receiveNotifications:
 *                     type: boolean
 *                     description: Whether the user receives notifications
 *                     example: true
 *                   showWatchlist:
 *                     type: boolean
 *                     description: Whether the user's watchlist is publicly visible
 *                     example: false
 *                   showFollowing:
 *                     type: boolean
 *                     description: Whether users the user is following are publicly visible
 *                     example: true
 *                   interfaceTheme:
 *                     type: string
 *                     description: The UI theme preference of the user
 *                     example: "theme1"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                       example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                     username:
 *                       type: string
 *                       example: "animefan123"
 *                     displayName:
 *                       type: string
 *                       example: "Anime Enthusiast"
 *                     bio:
 *                       type: string
 *                       example: "I love watching anime and discussing plot theories!"
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         genres:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Action", "Romance", "Fantasy"]
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Shonen", "Time Travel", "Magic"]
 *                     settings:
 *                       type: object
 *                       properties:
 *                         receiveNotifications:
 *                           type: boolean
 *                           example: true
 *                         showWatchlist:
 *                           type: boolean
 *                           example: false
 *                         showFollowing:
 *                           type: boolean
 *                           example: true
 *                         interfaceTheme:
 *                           type: string
 *                           example: "naruto-dark"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
router.patch('/update', protect, standardLimiter, updateProfile);

/**
 * @swagger
 * /users/upload-avatar:
 *   post:
 *     summary: Upload avatar image
 *     description: Uploads a new profile avatar image
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPG, PNG, WebP; max 2MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
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
 *                     avatarUrl:
 *                       type: string
 *                       example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123-1621524368423.jpg"
 *       400:
 *         description: Invalid file format or size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
router.post('/upload-avatar', protect, standardLimiter, avatarUpload.single('avatar'), uploadAvatar);

/**
 * @swagger
 * /users/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     description: Follow another user by their ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow
 *         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *     responses:
 *       200:
 *         description: Successfully followed user
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
 *                     message:
 *                       type: string
 *                       example: "You are now following this user"
 *                     followedUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                         username:
 *                           type: string
 *                           example: "animefan123"
 *       400:
 *         description: Bad request - cannot follow yourself or already following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User to follow not found
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
router.post('/follow/:userId', protect, userActionLimiter, followUser);

/**
 * @swagger
 * /users/unfollow/{userId}:
 *   post:
 *     summary: Unfollow a user
 *     description: Unfollow a currently followed user by their ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unfollow
 *         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
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
 *                     message:
 *                       type: string
 *                       example: "You have unfollowed this user"
 *       400:
 *         description: Bad request - not following user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User to unfollow not found
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
router.post('/unfollow/:userId', protect, userActionLimiter, unfollowUser);

/**
 * @swagger
 * /users/followers:
 *   get:
 *     summary: Get current user's followers
 *     description: Get a list of users who are following the current user
 *     tags: [User]
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
 *         description: Number of followers per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved followers
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
 *                         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                       username:
 *                         type: string
 *                         example: "animefan123"
 *                       displayName:
 *                         type: string
 *                         example: "Anime Fan"
 *                       avatarUrl:
 *                         type: string
 *                         example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123.jpg"
 *                       isFollowing:
 *                         type: boolean
 *                         example: false
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
 *                       example: 42
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
router.get('/followers', protect, standardLimiter, getFollowers);

/**
 * @swagger
 * /users/following:
 *   get:
 *     summary: Get users the current user is following
 *     description: Get a list of users that the current user is following
 *     tags: [User]
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
 *         description: Number of followed users per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved following list
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
 *                         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                       username:
 *                         type: string
 *                         example: "animefan123"
 *                       displayName:
 *                         type: string
 *                         example: "Anime Fan"
 *                       avatarUrl:
 *                         type: string
 *                         example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123.jpg"
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
 *                       example: 56
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
router.get('/following', protect, standardLimiter, getFollowing);

/**
 * @swagger
 * /users/feed:
 *   get:
 *     summary: Get activity feed
 *     description: Get activity feed from followed users
 *     tags: [User]
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
 *         description: Number of activities per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved activity feed
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
 *                         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                           username:
 *                             type: string
 *                             example: "animefan123"
 *                           avatarUrl:
 *                             type: string
 *                             example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123.jpg"
 *                       activityType:
 *                         type: string
 *                         example: "WATCHLIST_UPDATE"
 *                         enum: [WATCHLIST_UPDATE, PLAYLIST_CREATE, PLAYLIST_UPDATE, FOLLOW_USER, COMMENT_PLAYLIST]
 *                       content:
 *                         type: object
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
 *                       example: 87
 *                     pages:
 *                       type: integer
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
router.get('/feed', protect, standardLimiter, getActivityFeed);

/**
 * @swagger
 * /users/recommended:
 *   get:
 *     summary: Get recommended users
 *     description: Get recommended users based on preferences and activity
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Number of recommended users to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved recommended users
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
 *                         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                       username:
 *                         type: string
 *                         example: "animefan123"
 *                       username_slug:
 *                         type: string
 *                         example: "animefan123"
 *                       displayName:
 *                         type: string
 *                         example: "Anime Fan"
 *                       avatarUrl:
 *                         type: string
 *                         example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123.jpg"
 *                       bio:
 *                         type: string
 *                         example: "Anime enthusiast from Japan"
 *                       followersCount:
 *                         type: integer
 *                         example: 42
 *                       matchingGenres:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Action", "Romance"]
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
router.get('/recommended', protect, standardLimiter, getRecommendedUsers);

/**
 * @swagger
 * /users/achievements:
 *   post:
 *     summary: Update user achievements
 *     description: Updates user achievements based on the number of completed anime
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               animeCount:
 *                 type: integer
 *                 description: Number of completed anime
 *                 example: 10
 *     responses:
 *       200:
 *         description: Achievements updated successfully
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
 *                     achievements:
 *                       type: object
 *                       properties:
 *                         animeWatchedCount:
 *                           type: integer
 *                           example: 10
 *                         title:
 *                           type: string
 *                           example: "Binge Watcher"
 *                         unlockedTitles:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: "Binge Watcher"
 *                               description:
 *                                 type: string
 *                                 example: "Completed 10+ anime series"
 *                               unlockedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2023-06-15T08:30:00.000Z"
 *                     newAchievementUnlocked:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
router.post('/achievements', protect, standardLimiter, updateAchievements);

/**
 * @swagger
 * /users/achievements/all:
 *   get:
 *     summary: Get all available achievements
 *     description: Retrieves all possible achievements that users can earn on the platform
 *     tags: [User]
 *     responses:
 *       200:
 *         description: All available achievements retrieved successfully
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "anime"
 *                           name:
 *                             type: string
 *                             example: "Anime Watching"
 *                           description:
 *                             type: string
 *                             example: "Achievements earned by watching anime"
 *                           achievements:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 title:
 *                                   type: string
 *                                   example: "Binge Watcher"
 *                                 description:
 *                                   type: string
 *                                   example: "Completed 10+ anime series"
 *                                 threshold:
 *                                   type: integer
 *                                   example: 10
 *                                 type:
 *                                   type: string
 *                                   example: "anime"
 *                                 icon:
 *                                   type: string
 *                                   example: "binge_icon"
 *                     totalCount:
 *                       type: integer
 *                       example: 16
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/achievements/all', standardLimiter, getAllAchievements);

/**
 * @swagger
 * /users/achievements:
 *   get:
 *     summary: Get current user's achievements
 *     description: Get detailed achievement information for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's achievements
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
 *                     username:
 *                       type: string
 *                       example: "animefan123"
 *                     displayName:
 *                       type: string
 *                       example: "Anime Fan"
 *                     current:
 *                       type: string
 *                       example: "Binge Watcher"
 *                     animeWatchedCount:
 *                       type: integer
 *                       example: 15
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "anime"
 *                           name:
 *                             type: string
 *                             example: "Anime Watching"
 *                           description:
 *                             type: string
 *                             example: "Achievements earned by watching anime"
 *                           achievements:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 title:
 *                                   type: string
 *                                   example: "Binge Watcher"
 *                                 description:
 *                                   type: string
 *                                   example: "Completed 10+ anime series"
 *                                 threshold:
 *                                   type: integer
 *                                   example: 10
 *                                 type:
 *                                   type: string
 *                                   example: "anime"
 *                                 icon:
 *                                   type: string
 *                                   example: "binge_icon"
 *                                 unlocked:
 *                                   type: boolean
 *                                   example: true
 *                                 unlockedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                   example: "2023-09-15T14:30:00.000Z"
 *                                 progress:
 *                                   type: object
 *                                   properties:
 *                                     current:
 *                                       type: integer
 *                                       example: 15
 *                                     target:
 *                                       type: integer
 *                                       example: 10
 *                                     percentage:
 *                                       type: integer
 *                                       example: 100
 *                           unlockedCount:
 *                             type: integer
 *                             example: 2
 *                           totalCount:
 *                             type: integer
 *                             example: 6
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalUnlocked:
 *                           type: integer
 *                           example: 5
 *                         totalAchievements:
 *                           type: integer
 *                           example: 16
 *                         completionPercentage:
 *                           type: integer
 *                           example: 31
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
router.get('/achievements', protect, standardLimiter, getUserAchievements);

/**
 * @swagger
 * /users/{username}/achievements:
 *   get:
 *     summary: Get a user's achievements by username
 *     description: Get detailed achievement information for a specific user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user whose achievements to retrieve
 *         example: "animefan123"
 *     responses:
 *       200:
 *         description: Successfully retrieved user's achievements
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
 *                     username:
 *                       type: string
 *                       example: "animefan123"
 *                     displayName:
 *                       type: string
 *                       example: "Anime Fan"
 *                     current:
 *                       type: string
 *                       example: "Binge Watcher"
 *                     animeWatchedCount:
 *                       type: integer
 *                       example: 15
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "anime"
 *                           name:
 *                             type: string
 *                             example: "Anime Watching"
 *                           description:
 *                             type: string
 *                             example: "Achievements earned by watching anime"
 *                           achievements:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 title:
 *                                   type: string
 *                                   example: "Binge Watcher"
 *                                 description:
 *                                   type: string
 *                                   example: "Completed 10+ anime series"
 *                                 threshold:
 *                                   type: integer
 *                                   example: 10
 *                                 type:
 *                                   type: string
 *                                   example: "anime"
 *                                 icon:
 *                                   type: string
 *                                   example: "binge_icon"
 *                                 unlocked:
 *                                   type: boolean
 *                                   example: true
 *                                 unlockedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                   example: "2023-09-15T14:30:00.000Z"
 *                                 progress:
 *                                   type: object
 *                                   properties:
 *                                     current:
 *                                       type: integer
 *                                       example: 15
 *                                     target:
 *                                       type: integer
 *                                       example: 10
 *                                     percentage:
 *                                       type: integer
 *                                       example: 100
 *                           unlockedCount:
 *                             type: integer
 *                             example: 2
 *                           totalCount:
 *                             type: integer
 *                             example: 6
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalUnlocked:
 *                           type: integer
 *                           example: 5
 *                         totalAchievements:
 *                           type: integer
 *                           example: 16
 *                         completionPercentage:
 *                           type: integer
 *                           example: 31
 *       404:
 *         description: User not found
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
router.get('/:username/achievements', standardLimiter, getUserAchievements);

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the public profile of a user by their username. If authenticated, returns additional information.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user to retrieve
 *         example: "animefan123"
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                       example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                     username:
 *                       type: string
 *                       example: "animefan123"
 *                     username_slug:
 *                       type: string
 *                       example: "animefan123"
 *                     displayName:
 *                       type: string
 *                       example: "Anime Fan"
 *                     avatarUrl:
 *                       type: string
 *                       example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123.jpg"
 *                     bio:
 *                       type: string
 *                       example: "Anime enthusiast from Japan"
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         genres:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Action", "Romance", "Fantasy"]
 *                     followersCount:
 *                       type: integer
 *                       example: 42
 *                     followingCount:
 *                       type: integer
 *                       example: 56
 *                     isFollowing:
 *                       type: boolean
 *                       description: Only present if authenticated
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-15T08:30:00.000Z"
 *       404:
 *         description: User not found
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
router.get('/:username', optionalAuth, standardLimiter, getUserProfile);

/**
 * @swagger
 * /users/{username}/followers:
 *   get:
 *     summary: Get a user's followers by username
 *     description: Get a list of users who are following the specified user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user whose followers to retrieve
 *         example: "animefan123"
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
 *         description: Number of followers per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved followers
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
 *                         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                       username:
 *                         type: string
 *                         example: "animefan123"
 *                       displayName:
 *                         type: string
 *                         example: "Anime Fan"
 *                       avatarUrl:
 *                         type: string
 *                         example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123.jpg"
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
 *                       example: 42
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       404:
 *         description: User not found
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
router.get('/:username/followers', standardLimiter, getFollowers);

/**
 * @swagger
 * /users/{username}/following:
 *   get:
 *     summary: Get users a specified user is following
 *     description: Get a list of users that the specified user is following
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user whose following list to retrieve
 *         example: "animefan123"
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
 *         description: Number of followed users per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved following list
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
 *                         example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                       username:
 *                         type: string
 *                         example: "animefan123"
 *                       displayName:
 *                         type: string
 *                         example: "Anime Fan"
 *                       avatarUrl:
 *                         type: string
 *                         example: "https://otakulist-images-prod.s3.amazonaws.com/avatars/user123.jpg"
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
 *                       example: 56
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       404:
 *         description: User not found
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
router.get('/:username/following', standardLimiter, getFollowing);

module.exports = router; 