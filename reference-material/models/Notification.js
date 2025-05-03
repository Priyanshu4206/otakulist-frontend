const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'follow',
      'playlist_like',
      'playlist_comment',
      'comment_reply',
      'achievement',
      'system'
    ],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['Playlist', 'User', 'Comment'],
    required: function() {
      return !!this.targetId;
    }
  },
  message: {
    type: String,
    trim: true
  },
  extraData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster lookups
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1 });

// Methods
NotificationSchema.methods.toJSON = function() {
  return {
    id: this._id,
    recipient: this.recipient,
    sender: this.sender,
    type: this.type,
    read: this.read,
    targetId: this.targetId,
    targetModel: this.targetModel,
    message: this.message,
    extraData: this.extraData,
    createdAt: this.createdAt
  };
};

NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

// Static methods
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

NotificationSchema.statics.getUserNotifications = function(userId, limit = 20, skip = 0) {
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('sender', 'username username_slug displayName avatarUrl');
};

NotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );
};

// Utility to create notification
NotificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification; 