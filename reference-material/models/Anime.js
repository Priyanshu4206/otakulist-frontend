const mongoose = require('mongoose');

const GenreRefSchema = new mongoose.Schema({
  malId: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String }
}, { _id: false });

const StudioRefSchema = new mongoose.Schema({
  malId: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String }
}, { _id: false });

const ImageSchema = new mongoose.Schema({
  imageUrl: { type: String },
  smallImageUrl: { type: String },
  largeImageUrl: { type: String }
}, { _id: false });

const AnimeSchema = new mongoose.Schema({
  titles: {
    default: { type: String, required: true, index: true },
    english: { type: String, index: true },
    japanese: { type: String },
    synonyms: [{ type: String }]
  },
  images: {
    jpg: ImageSchema,
    webp: ImageSchema
  },
  trailer: {
    youtubeId: { type: String },
    url: { type: String }
  },
  aired: {
    from: { type: Date },
    to: { type: Date },
    string: { type: String }
  },
  broadcast: {
    day: { type: String, index: true },
    time: { type: String },
    timezone: { type: String },
    string: { type: String }
  },
  malId: { type: Number, required: true, unique: true, index: true },
  dataType: { type: String, default: 'anime' },
  demographics: [GenreRefSchema],
  genres: [GenreRefSchema],
  studios: [StudioRefSchema],
  producers: [StudioRefSchema],
  rating: { type: String, index: true },
  duration: { type: String },
  episodes: { type: Number },
  score: { type: Number, index: true },
  status: { type: String, index: true },
  popularity: { type: Number, index: true },
  rank: { type: Number },
  members: { type: Number },
  synopsis: { type: String, index: true },
  type: { type: String, index: true },
  season: { type: String, index: true },
  year: { type: Number, index: true },
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create text index for full-text search
AnimeSchema.index({ 
  'titles.default': 'text', 
  'titles.english': 'text', 
  'titles.synonyms': 'text',
  'synopsis': 'text' 
}, {
  weights: {
    'titles.default': 10,
    'titles.english': 8,
    'titles.synonyms': 5,
    'synopsis': 3
  },
  name: 'text_search_index'
});

// Create compound indices for common queries
AnimeSchema.index({ season: 1, year: 1 });
AnimeSchema.index({ status: 1, score: -1 });
AnimeSchema.index({ 'broadcast.day': 1, popularity: -1 });
AnimeSchema.index({ type: 1, season: 1, year: 1 });

// Methods
AnimeSchema.statics.findByMalId = function(malId) {
  return this.findOne({ malId });
};

AnimeSchema.statics.findBySeason = function(season, year) {
  return this.find({ season, year });
};

AnimeSchema.statics.findByDay = function(day) {
  return this.find({ 'broadcast.day': day });
};

// Virtuals
AnimeSchema.virtual('isAiring').get(function() {
  return this.status === 'Currently Airing';
});

const Anime = mongoose.model('Anime', AnimeSchema);

module.exports = Anime; 