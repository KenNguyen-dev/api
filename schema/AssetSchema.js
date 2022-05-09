const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const assetSchema = new Schema({
  tokenId: {
    type: String,
    required: true,
    immutable: true,
  },
  uriID: {
    type: String,
    required: true,
    immutable: true,
  },
  name: {
    type: String,
    required: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    default: "",
  },
  currentOwner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  currentCollection: {
    type: Schema.Types.ObjectId || null,
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
  status: {
    type: String,
    default: "Not Listing",
  },
});

module.exports = mongoose.model("Asset", assetSchema);
