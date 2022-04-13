const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const assetSchema = new Schema({
  uriID: {
    type: String,
    required: true,
  },
  name: String,
  favoriteCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: String,
  currentOwner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  currentCollection: {
    type: Schema.Types.ObjectId,
    ref: "Collection",
  },
  currentPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  prevPrice: [{ type: Number, default: 0, min: 0 }, { updatedAt: Date }],
  history: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
});

module.exports = mongoose.model("Asset", assetSchema);
