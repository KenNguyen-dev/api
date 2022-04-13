const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  name: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  //   owner: {
  //     type: Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  //   assets: [
  //     {
  //       type: Schema.Types.ObjectId,
  //       ref: "Asset",
  //     },
  //   ],
  profileImage: String,
  bannerImage: String,
  description: String,
});

module.exports = mongoose.model("Collection", collectionSchema);
