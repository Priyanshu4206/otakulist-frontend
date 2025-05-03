const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeId: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'],
    default: 'plan_to_watch'
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  episodesWatched: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  favorite: {
    type: Boolean,
    default: false
  },
  private: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound unique index to ensure a user can only have one entry per anime
WatchlistSchema.index({ userId: 1, animeId: 1 }, { unique: true });

// Index for status queries
WatchlistSchema.index({ userId: 1, status: 1 });

// Index for recently updated
WatchlistSchema.index({ userId: 1, updatedAt: -1 });

// Methods
WatchlistSchema.methods.toJSON = function() {
  return {
    id: this._id,
    animeId: this.animeId,
    status: this.status,
    rating: this.rating,
    episodesWatched: this.episodesWatched,
    notes: this.notes,
    favorite: this.favorite,
    private: this.private,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static methods
WatchlistSchema.statics.findByUserAndStatus = function(userId, status, limit = 20, skip = 0) {
  return this.find({ userId, status })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip);
};

WatchlistSchema.statics.findByUserAndAnimeId = function(userId, animeId) {
  return this.findOne({ userId, animeId });
};

WatchlistSchema.statics.getStatusCounts = async function(userId) {
  const statusCounts = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Convert to object with status as keys
  const result = {
    watching: 0,
    completed: 0,
    plan_to_watch: 0,
    on_hold: 0,
    dropped: 0,
    total: 0
  };

  statusCounts.forEach(item => {
    result[item._id] = item.count;
    result.total += item.count;
  });

  return result;
};

const Watchlist = mongoose.model('Watchlist', WatchlistSchema);

module.exports = Watchlist; 