const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  type: String,
  from: {
    type: Schema.Types.ObjectId || null,
    ref: "User",
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  date: Date,
});

module.exports = mongoose.model("Event", eventSchema);
