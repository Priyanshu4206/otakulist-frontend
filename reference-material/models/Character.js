const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  imageUrl: { type: String },
  smallImageUrl: { type: String },
  largeImageUrl: { type: String }
}, { _id: false });

const VoiceActorSchema = new mongoose.Schema({
  malId: { type: Number },
  name: { type: String },
  language: { type: String },
  images: {
    jpg: ImageSchema,
    webp: ImageSchema
  }
}, { _id: false });

const AnimeReferenceSchema = new mongoose.Schema({
  malId: { type: Number },
  title: { type: String },
  image: { type: String },
  role: { type: String } // Main, Supporting
}, { _id: false });

const CharacterSchema = new mongoose.Schema({
  malId: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  nameKanji: { type: String },
  nicknames: [{ type: String }],
  about: { type: String },
  favorites: { type: Number, default: 0 },
  images: {
    jpg: ImageSchema,
    webp: ImageSchema
  },
  animeRefs: [AnimeReferenceSchema],
  voiceActors: [VoiceActorSchema],
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create compound index for popularity ranking
CharacterSchema.index({ favorites: -1 });

// Create index for anime character lookups
CharacterSchema.index({ 'animeRefs.malId': 1 });

// Create compound index for filtering main characters by anime
CharacterSchema.index({ 'animeRefs.malId': 1, 'animeRefs.role': 1 });

// Methods
CharacterSchema.statics.findByMalId = function(malId) {
  return this.findOne({ malId });
};

CharacterSchema.statics.findMostPopular = function(limit = 20) {
  return this.find()
    .sort({ favorites: -1 })
    .limit(limit);
};

CharacterSchema.statics.findByNameFuzzy = function(name, limit = 20) {
  return this.find({ name: { $regex: name, $options: 'i' } })
    .sort({ favorites: -1 })
    .limit(limit);
};

CharacterSchema.statics.findByAnime = function(animeId) {
  return this.find({ 'animeRefs.malId': animeId });
};

const Character = mongoose.model('Character', CharacterSchema);

module.exports = Character; 