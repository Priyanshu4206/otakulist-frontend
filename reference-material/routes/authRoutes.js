const express = require('express');
const passport = require('passport');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');
const { 
  getCurrentUser, 
  logout, 
  googleCallback,
  updatePassword,
  deleteAccount
} = require('../controllers/authController');
const User = require('../models/User');
const { logger } = require('../utils/controllerUtils');
const { formatResponse, formatError, formatServerError } = require('../utils/response');

// Initialize Passport OAuth strategy
require('../config/passport');

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     description: Redirects the user to Google's OAuth consent screen to begin the authentication process
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [web, mobile]
 *         description: Client platform type (web or mobile)
 *     responses:
 *       302:
 *         description: Redirects to Google's authentication page
 */
router.get('/google', authLimiter, (req, res, next) => {
  // Forward platform type to callback if present
  const platform = req.query.platform;
  const state = platform ? { platform } : undefined;
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state ? JSON.stringify(state) : undefined
  })(req, res, next);
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     description: Processes the callback from Google after user authentication and issues JWT tokens
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code returned by Google
 *     responses:
 *       200:
 *         description: Authentication successful
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
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "5f8d0c1c2b9b8a2a2c9b8a2a"
 *                         username:
 *                           type: string
 *                           example: "animefan123"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *       401:
 *         description: Authentication failed
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
router.get('/google/callback', googleCallback);

/**
 * @swagger
 * /auth/google/mobile:
 *   post:
 *     summary: Mobile Google authentication
 *     description: Authenticates a mobile user using Google ID token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token from mobile client
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.post('/google/mobile', authLimiter, (req, res, next) => {
  // This would be implemented in src/controllers/authController.js
  res.status(501).json({ 
    success: false, 
    message: 'Mobile authentication not implemented yet. Use the standard OAuth flow with platform=mobile parameter.'
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile of the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
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
 *                       example: "https://otakulist-images-prod.s3.amazonaws.com/default-avatar.png"
 *                     bio:
 *                       type: string
 *                       example: "I love anime!"
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         genres:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Action", "Adventure"]
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Shonen", "Fantasy"]
 *                     followersCount:
 *                       type: integer
 *                       example: 5
 *                     followingCount:
 *                       type: integer
 *                       example: 10
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-04-01T12:00:00Z"
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
router.get('/me', protect, getCurrentUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the current user by clearing the authentication cookie
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Logged out successfully"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /auth/update-password:
 *   patch:
 *     summary: Update user password
 *     description: Updates the password for the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldPassword123"
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 example: "newPassword456"
 *                 description: User's new password
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid request - missing fields or incorrect current password
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
 */
router.patch('/update-password', protect, updatePassword);

/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: Delete user account
 *     description: Deactivates the current user's account (soft delete)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Account deactivated successfully"
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
router.delete('/delete-account', protect, deleteAccount);

/**
 * @swagger
 * /auth/check-username/{username}:
 *   get:
 *     summary: Check username availability
 *     description: Checks if a username is available for registration
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to check for availability
 *         example: "animefan123"
 *     responses:
 *       200:
 *         description: Username availability check result
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
 *                     available:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid username format
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
router.get('/check-username/:username', authLimiter, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check if username meets requirements
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json(formatError('Username must be between 3 and 30 characters'));
    }
    
    // Check if username is available
    const existingUser = await User.findOne({ username });
    
    return res.status(200).json(formatResponse({
      available: !existingUser
    }));
  } catch (error) {
    logger.error(`Error checking username: ${error.message}`);
    return res.status(500).json(formatServerError());
  }
});

module.exports = router; 