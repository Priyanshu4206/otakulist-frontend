const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'playlist_create',
      'playlist_update',
      'playlist_like',
      'playlist_comment',
      'watchlist_add',
      'watchlist_update',
      'watchlist_status_change',
      'user_follow',
      'user_unfollow',
      'profile_update',
      'achievement_unlocked'
    ],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['Playlist', 'User', 'Watchlist'],
    required: function() {
      return !!this.targetId;
    }
  },
  animeId: {
    type: String,
    trim: true
  },
  extraData: {
    type: mongoose.Schema.Types.Mixed
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster lookups
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, activityType: 1 });
ActivityLogSchema.index({ targetId: 1 });

// Methods
ActivityLogSchema.methods.toJSON = function() {
  return {
    id: this._id,
    userId: this.userId,
    activityType: this.activityType,
    targetId: this.targetId,
    targetModel: this.targetModel,
    animeId: this.animeId,
    extraData: this.extraData,
    isPublic: this.isPublic,
    createdAt: this.createdAt
  };
};

// Static methods
ActivityLogSchema.statics.getUserActivities = function(userId, limit = 20, skip = 0) {
  return this.find({ userId, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username username_slug avatarUrl')
    .populate({
      path: 'targetId',
      select: 'name slug animeIds username username_slug',
      options: { lean: true }
    });
};

ActivityLogSchema.statics.getFeedForUser = async function(userId, limit = 20, skip = 0) {
  // Get users this user is following
  const user = await mongoose.model('User').findById(userId).select('following');
  if (!user || !user.following.length) {
    return [];
  }

  return this.find({
    userId: { $in: user.following },
    isPublic: true
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username username_slug displayName avatarUrl')
    .populate({
      path: 'targetId',
      select: 'name slug animeIds username username_slug',
      options: { lean: true }
    });
};

// Utility to create activity log entries
ActivityLogSchema.statics.createActivity = function(data) {
  return this.create(data);
};

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = ActivityLog; 