const mongoose = require('mongoose');
const logger = require('../utils/logger')('PlaylistModel');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,  // This already creates an index automatically
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeIds: [{
    type: String,
    trim: true
  }],
  animeCount: {
    type: Number,
    default: 0
  },
  coverImage: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Set anime count before saving
PlaylistSchema.pre('save', function(next) {
  if (this.isModified('animeIds')) {
    this.animeCount = this.animeIds.length;
  }
  next();
});

// Add pre-save hook to generate slug
PlaylistSchema.pre('save', function(next) {
  // Only update slug if name is modified or it's a new document
  if ((this.isModified('name') || this.isNew) && this.owner) {
    try {
      // Create a slug from name and owner ID
      const nameSlug = this.name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-');     // Replace multiple hyphens with single hyphen
      
      const ownerId = this.owner.toString().slice(-6); // Get last 6 chars of owner ID
      this.slug = `${nameSlug}-${ownerId}`;
      
      logger.info(`Generated slug: ${this.slug} for playlist ${this.name}`);
    } catch (error) {
      logger.error(`Error generating slug: ${error.message}`);
      // Fallback in case of error (create a timestamp-based slug)
      this.slug = `playlist-${Date.now()}`;
    }
  }
  next();
});

// Indexes for faster lookups
PlaylistSchema.index({ owner: 1 });
PlaylistSchema.index({ isPublic: 1 });
PlaylistSchema.index({ tags: 1 });
PlaylistSchema.index({ createdAt: -1 });

// Methods
PlaylistSchema.methods.toJSON = function() {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    description: this.description,
    owner: this.owner,
    animeIds: this.animeIds,
    animeCount: this.animeCount,
    coverImage: this.coverImage,
    isPublic: this.isPublic,
    likesCount: this.likes.length,
    commentsCount: this.comments.length,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

PlaylistSchema.methods.like = function(userId) {
  if (this.likes.indexOf(userId) === -1) {
    this.likes.push(userId);
  }
  return this.save();
};

PlaylistSchema.methods.unlike = function(userId) {
  if (this.likes.indexOf(userId) !== -1) {
    this.likes.remove(userId);
  }
  return this.save();
};

PlaylistSchema.methods.addComment = function(userId, text) {
  this.comments.push({ user: userId, text });
  return this.save();
};

PlaylistSchema.methods.removeComment = function(commentId) {
  this.comments.id(commentId).remove();
  return this.save();
};

// Static methods
PlaylistSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug }).populate('owner', 'username username_slug avatarUrl');
};

PlaylistSchema.statics.findPublic = function(limit = 10, skip = 0) {
  return this.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('owner', 'username username_slug avatarUrl');
};

PlaylistSchema.statics.findByUser = function(userId, includePrivate = false) {
  const query = includePrivate ? 
    { owner: userId } : 
    { owner: userId, isPublic: true };
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('owner', 'username username_slug avatarUrl');
};

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = Playlist;