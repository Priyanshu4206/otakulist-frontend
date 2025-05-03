const User = require('../models/User');
const { formatResponse, AppError, catchAsync } = require('../utils/controllerUtils');
const { sendTokenResponse, generateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger')('Auth');
const { google } = require('googleapis');
const { getAllConfig } = require('../config/env');

// Get config values
const config = getAllConfig();

// Configure Google OAuth2
const oauth2Client = new google.auth.OAuth2(
  config.googleClientId,
  config.googleClientSecret,
  config.googleCallbackUrl
);

/**
 * Generate a unique username from display name
 * @param {string} displayName - User's display name from Google
 * @returns {string} - A unique username
 */
const generateUniqueUsername = async (displayName) => {
  // Try to generate a username from display name
  let username = displayName
    .replace(/\s+/g, '')  // Remove spaces
    .substring(0, 20);    // Limit length
  
  // Ensure username is at least 3 characters
  if (username.length < 3) {
    username = `user${Math.floor(1000 + Math.random() * 9000)}`;
  }
  
  // Add random suffix to help with uniqueness
  username = `${username}${Math.floor(100 + Math.random() * 900)}`;
  
  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    // Add another random number if username exists
    username = `${username}${Math.floor(100 + Math.random() * 900)}`;
  }
  
  return username;
};

/**
 * @desc    Get current user profile
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.getCurrentUser = catchAsync(async (req, res) => {
  // User is already available in req.user from protect middleware
  const user = req.user;
  
  return res.json(formatResponse(user.toProfileJSON()));
});

/**
 * @desc    Logout user (clear cookie)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.logout = catchAsync(async (req, res) => {
  // Clear both token and jwt cookies
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', 'none', cookieOptions);
  res.cookie('jwt', 'none', cookieOptions);
  
  return res.json(formatResponse({ success: true, message: 'Logged out successfully' }));
});

/**
 * @desc    Google OAuth callback handler
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.googleCallback = catchAsync(async (req, res) => {
  try {
    const { code, state } = req.query;
    const platform = state ? JSON.parse(state).platform : 'web';

    if (!code) {
      logger.error(`No code provided in Google callback`);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data: profile } = await google.people({
      version: 'v1',
      auth: oauth2Client
    }).people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos'
    });

    const email = profile.emailAddresses[0].value;
    const displayName = profile.names[0].displayName;
    const googleId = profile.resourceName.split('/')[1];
    const avatarUrl = profile.photos?.[0]?.url;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save();
        logger.info(`Linked Google account to existing user: ${email}`);
      }
    }

    if (!user) {
      const username = await generateUniqueUsername(displayName);
      user = await User.create({
        email,
        googleId,
        username,
        displayName,
        avatarUrl
      });
      logger.info(`Created new user with Google: ${email}`);
    }

    const token = generateToken(user._id);

    if (platform === 'android') {
      return res.json(formatResponse({
        token,
        user: user.toJSON()
      }));
    }

    // For web, set httpOnly cookie and redirect
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: config.cookieMaxAge // Use config value instead of hardcoded
    });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    logger.error(`Google OAuth callback error: ${error.message}`);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

/**
 * @desc    Update user password
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Check if passwords are provided
  if (!currentPassword || !newPassword) {
    throw AppError.badRequest('Please provide current and new password');
  }
  
  // Get current user with password field
  const user = await User.findById(req.user.id).select('+password');
  
  // Check if user has a password (might be OAuth only user)
  if (!user.password) {
    throw AppError.badRequest('You don\'t have a password set. Please use social login.');
  }
  
  // Check if current password is correct
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw AppError.badRequest('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Send new token response
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Delete account
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 */
exports.deleteAccount = catchAsync(async (req, res) => {
  // Get the user by ID
  const user = req.user;
  
  // Set user to inactive instead of deletion
  user.isActive = false;
  await user.save();
  
  // Clear both token and jwt cookies
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', 'none', cookieOptions);
  res.cookie('jwt', 'none', cookieOptions);
  
  return res.json(formatResponse({ 
    success: true, 
    message: 'Account deactivated successfully' 
  }));
}); 