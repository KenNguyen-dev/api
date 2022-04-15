const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    default: "Default",
  },
  email: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  profileImg: {
    type: String,
    default: "",
  },
  bannerImg: {
    type: String,
    default: "",
  },
  walletAddress: {
    type: String,
    required: true,
    immutable: true,
    unique: true,
  },
  favoriteAssets: [
    {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    },
  ],
  ownedAssets: [
    {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    },
  ],
  ownedCollections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
