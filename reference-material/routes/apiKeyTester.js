/**
 * API Key Tester Routes
 * 
 * Provides endpoints to test API key authentication
 */

const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middleware/apiKeyMiddleware');
const logger = require('../utils/logger')('ApiKeyTester');

/**
 * @route   GET /api/v1/test/open
 * @desc    Test route that doesn't require API key
 * @access  Public
 */
router.get('/open', (req, res) => {
  logger.info(`Open test endpoint accessed from ${req.ip}`);
  res.json({
    success: true,
    message: 'This endpoint is open to anyone',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/v1/test/secure
 * @desc    Test route that requires API key
 * @access  Secured with API key
 */
router.get('/secure', validateApiKey, (req, res) => {
  logger.info(`Secure test endpoint accessed successfully with valid API key from ${req.ip}`);
  res.json({
    success: true,
    message: 'API key is valid! This endpoint is only accessible with a valid API key',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 