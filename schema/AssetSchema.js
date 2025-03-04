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
  prevPrice: { type : Array , "default" : [] },
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
  thumb_type: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Asset", assetSchema);
