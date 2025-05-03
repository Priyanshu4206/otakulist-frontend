const mongoose = require('mongoose');
const logger = require('../utils/logger')('User');

const UserSchema = new mongoose.Schema({
  // Authentication-related fields
  email: {
    type: String,
    required: true,
    unique: true,  // This creates an index automatically
    trim: true,
    lowercase: true
  },
  googleId: {
    type: String,
    sparse: true,  // Allows null values
    index: true    // Single index declaration
  },
  username: {
    type: String,
    required: true,
    unique: true,  // This creates an index automatically
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  username_slug: {
    type: String,
    unique: true,  // This creates an index automatically
    lowercase: true
  },
  
  // Profile fields
  displayName: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    default: 'https://otakulist-images-prod.s3.amazonaws.com/default-avatar.png'
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  preferences: {
    genres: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true
    }]
  },
  
  // Settings and preferences
  settings: {
    receiveNotifications: {
      type: Boolean,
      default: true
    },
    showWatchlist: {
      type: Boolean,
      default: true
    },
    showFollowing: {
      type: Boolean,
      default: true
    },
    interfaceTheme: {
      type: String,
      default: 'theme1'
    }
  },
  
  // User achievements
  achievements: {
    animeWatchedCount: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: 'Newbie'
    },
    unlockedTitles: [{
      title: String,
      description: String,
      unlockedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Social features
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Timestamps and status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.googleId;
      return ret;
    }
  }
});

// Add pre-save hook to manually generate username_slug
UserSchema.pre('save', function(next) {
  // Only update slug if username is modified or it's a new document
  if (this.isModified('username') || this.isNew) {
    try {
      // Simple slug generation - lowercase and replace spaces/special chars with hyphens
      this.username_slug = this.username.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-');     // Replace multiple hyphens with single hyphen
      
      logger.info(`Generated username_slug: ${this.username_slug} for user ${this.email}`);
    } catch (error) {
      logger.error(`Error generating username_slug: ${error.message}`);
      // Fallback in case of error
      this.username_slug = this.username.toLowerCase();
    }
  }
  next();
});

// Methods to interact with the model
UserSchema.methods.toProfileJSON = function() {
  const start = Date.now();
  
  try {
    // Get all possible achievements
    const allAchievements = User.getAllAchievements();
    
    // Format unlocked titles into a map for easier lookup
    const unlockedMap = {};
    if (this.achievements && this.achievements.unlockedTitles) {
      this.achievements.unlockedTitles.forEach(achievement => {
        unlockedMap[achievement.title] = {
          ...achievement.toObject ? achievement.toObject() : achievement,
          unlocked: true
        };
      });
    }
    
    // Build achievement info with unlocked status
    const achievementInfo = {
      current: this.achievements?.title || 'Newbie',
      animeWatchedCount: this.achievements?.animeWatchedCount || 0,
      unlockedCount: Object.keys(unlockedMap).length,
      unlockedTitles: this.achievements?.unlockedTitles || []
    };
    
    const result = {
      id: this._id,
      username: this.username,
      username_slug: this.username_slug,
      displayName: this.displayName,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      preferences: this.preferences,
      settings: this.settings,
      achievements: achievementInfo,
      followersCount: Array.isArray(this.followers) ? this.followers.length : 0,
      followingCount: Array.isArray(this.following) ? this.following.length : 0,
      createdAt: this.createdAt
    };
    
    const duration = Date.now() - start;
    if (duration > 50) { // Log only if it takes more than 50ms
      logger.warn(`User.toProfileJSON slow execution: ${duration}ms for user ${this._id}`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Error in toProfileJSON: ${error.message} for user ${this._id}`);
    // Return minimal profile to avoid breaking the app
    return {
      id: this._id,
      username: this.username || 'unknown',
      createdAt: this.createdAt || new Date()
    };
  }
};

// Static method to get all possible achievements
UserSchema.statics.getAllAchievements = function() {
  // Define all possible achievements
  return {
    anime: [
      { threshold: 0, title: 'Newbie', description: 'Started your anime journey', type: 'anime', icon: 'rookie_icon' },
      { threshold: 10, title: 'Binge Watcher', description: 'Completed 10+ anime series', type: 'anime', icon: 'binge_icon' },
      { threshold: 25, title: 'Anime Enthusiast', description: 'Completed 25+ anime series', type: 'anime', icon: 'enthusiast_icon' },
      { threshold: 50, title: 'Otaku Master', description: 'Completed 50+ anime series', type: 'anime', icon: 'master_icon' },
      { threshold: 100, title: 'Anime Sage', description: 'Completed 100+ anime series', type: 'anime', icon: 'sage_icon' },
      { threshold: 200, title: 'Legendary Weeb', description: 'Completed 200+ anime series', type: 'anime', icon: 'legendary_icon' }
    ],
    social: [
      { threshold: 10, title: 'Socialite', description: 'Followed by 10+ other users', type: 'social', icon: 'socialite_icon' },
      { threshold: 50, title: 'Influencer', description: 'Followed by 50+ other users', type: 'social', icon: 'influencer_icon' },
      { threshold: 100, title: 'Celebrity', description: 'Followed by 100+ other users', type: 'social', icon: 'celebrity_icon' }
    ],
    collection: [
      { threshold: 50, title: 'Collector', description: 'Added 50+ anime to your watchlist', type: 'collection', icon: 'collector_icon' },
      { threshold: 100, title: 'Curator', description: 'Added 100+ anime to your watchlist', type: 'collection', icon: 'curator_icon' },
      { threshold: 200, title: 'Librarian', description: 'Added 200+ anime to your watchlist', type: 'collection', icon: 'librarian_icon' }
    ],
    genre: [
      { threshold: 10, title: 'Action Fan', description: 'Completed 10+ action anime', type: 'genre', genre: 'action', icon: 'action_icon' },
      { threshold: 10, title: 'Romance Expert', description: 'Completed 10+ romance anime', type: 'genre', genre: 'romance', icon: 'romance_icon' },
      { threshold: 10, title: 'Fantasy Enthusiast', description: 'Completed 10+ fantasy anime', type: 'genre', genre: 'fantasy', icon: 'fantasy_icon' },
      { threshold: 10, title: 'Sci-Fi Geek', description: 'Completed 10+ sci-fi anime', type: 'genre', genre: 'sci-fi', icon: 'scifi_icon' }
    ],
    special: [
      { title: 'Early Adopter', description: 'Joined during the beta phase', type: 'special', condition: 'beta_user', icon: 'early_icon' },
      { title: 'Loyal Fan', description: 'Active member for over 1 year', type: 'special', condition: 'account_age_1y', icon: 'loyal_icon' },
      { title: 'Dedicated Reviewer', description: 'Rated 50+ anime', type: 'special', condition: 'ratings_50', icon: 'reviewer_icon' }
    ]
  };
};

// Update the achievement methods to use the centralized achievement definitions
UserSchema.methods.updateAchievements = async function(animeCompletedCount) {
  const achievements = User.getAllAchievements().anime;
  
  let achievementResult = { newAchievement: false };
  
  // Update anime watched count and check for achievements
  if (animeCompletedCount !== undefined && this.achievements.animeWatchedCount !== animeCompletedCount) {
    // Update the anime watched count
    this.achievements.animeWatchedCount = animeCompletedCount;
    
    // Find the highest title the user qualifies for
    let newTitle = null;
    let newTitleInfo = null;
    
    for (let i = achievements.length - 1; i >= 0; i--) {
      if (animeCompletedCount >= achievements[i].threshold) {
        newTitle = achievements[i].title;
        newTitleInfo = achievements[i];
        break;
      }
    }
    
    // Check if new title is different from current one and not already unlocked
    if (newTitle && this.achievements.title !== newTitle) {
      const alreadyUnlocked = this.achievements.unlockedTitles.some(
        t => t.title === newTitle
      );
      
      // Update current title
      this.achievements.title = newTitle;
      
      // Add to unlocked titles if not already there
      if (!alreadyUnlocked) {
        this.achievements.unlockedTitles.push({
          title: newTitleInfo.title,
          description: newTitleInfo.description,
          type: newTitleInfo.type,
          unlockedAt: new Date()
        });
        
        // Set result
        achievementResult = { 
          newAchievement: true, 
          title: newTitleInfo.title, 
          description: newTitleInfo.description,
          type: newTitleInfo.type
        };
      }
    }
  }
  
  return achievementResult;
};

// Check for social achievements (called when someone follows the user)
UserSchema.methods.checkSocialAchievements = async function() {
  const socialAchievements = User.getAllAchievements().social;
  
  const followerCount = this.followers.length;
  
  // Find highest achievement unlocked
  let highestAchievement = null;
  
  for (let i = socialAchievements.length - 1; i >= 0; i--) {
    if (followerCount >= socialAchievements[i].threshold) {
      highestAchievement = socialAchievements[i];
      break;
    }
  }
  
  if (highestAchievement) {
    // Check if already unlocked
    const alreadyUnlocked = this.achievements.unlockedTitles.some(
      t => t.title === highestAchievement.title
    );
    
    if (!alreadyUnlocked) {
      // Add to unlocked titles
      this.achievements.unlockedTitles.push({
        title: highestAchievement.title,
        description: highestAchievement.description,
        type: highestAchievement.type,
        unlockedAt: new Date()
      });
      
      return {
        newAchievement: true,
        title: highestAchievement.title,
        description: highestAchievement.description,
        type: highestAchievement.type
      };
    }
  }
  
  return { newAchievement: false };
};

// Check for collection achievements
UserSchema.methods.checkCollectionAchievements = async function(watchlistCount) {
  const collectionAchievements = User.getAllAchievements().collection;
  
  // Find highest achievement unlocked
  let highestAchievement = null;
  
  for (let i = collectionAchievements.length - 1; i >= 0; i--) {
    if (watchlistCount >= collectionAchievements[i].threshold) {
      highestAchievement = collectionAchievements[i];
      break;
    }
  }
  
  if (highestAchievement) {
    // Check if already unlocked
    const alreadyUnlocked = this.achievements.unlockedTitles.some(
      t => t.title === highestAchievement.title
    );
    
    if (!alreadyUnlocked) {
      // Add to unlocked titles
      this.achievements.unlockedTitles.push({
        title: highestAchievement.title,
        description: highestAchievement.description,
        type: highestAchievement.type,
        unlockedAt: new Date()
      });
      
      return {
        newAchievement: true,
        title: highestAchievement.title,
        description: highestAchievement.description,
        type: highestAchievement.type
      };
    }
  }
  
  return { newAchievement: false };
};

// Static methods with added logging
UserSchema.statics.findByUsername = function(username) {
  const start = Date.now();
  logger.info(`User.findByUsername: Looking up user by username_slug: ${username}`);
  
  return this.findOne({ username_slug: username })
    .then(user => {
      const duration = Date.now() - start;
      logger.info(`User.findByUsername completed in ${duration}ms, found: ${!!user}`);
      return user;
    })
    .catch(err => {
      logger.error(`User.findByUsername error: ${err.message}`);
      throw err;
    });
};

UserSchema.statics.findByEmail = function(email) {
  const start = Date.now();
  const lowerEmail = email.toLowerCase();
  logger.info(`User.findByEmail: Looking up user by email: ${lowerEmail}`);
  
  return this.findOne({ email: lowerEmail })
    .then(user => {
      const duration = Date.now() - start;
      logger.info(`User.findByEmail completed in ${duration}ms, found: ${!!user}`);
      return user;
    })
    .catch(err => {
      logger.error(`User.findByEmail error: ${err.message}`);
      throw err;
    });
};

UserSchema.statics.findByGoogleId = function(googleId) {
  const start = Date.now();
  logger.info(`User.findByGoogleId: Looking up user by googleId`); // Not logging ID for privacy
  
  return this.findOne({ googleId })
    .then(user => {
      const duration = Date.now() - start;
      logger.info(`User.findByGoogleId completed in ${duration}ms, found: ${!!user}`);
      return user;
    })
    .catch(err => {
      logger.error(`User.findByGoogleId error: ${err.message}`);
      throw err;
    });
};

const User = mongoose.model('User', UserSchema);

module.exports = User;