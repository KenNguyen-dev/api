const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  name: String,
  category: {
    type: Schema.Types.ObjectId || null,
    ref: "Category",
    default: null,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  assets: [
    {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      default: null,
    },
  ],
  collectionImage: {
    type: String,
    default: "",
  },
  collectionBanner: {
    type: String,
    default: "",
  },
  description: String,
});

module.exports = mongoose.model("Collection", collectionSchema);
