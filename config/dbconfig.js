const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;
const User = require("../schema/UserSchema");
const Category = require("../schema/CategorySchema");

async function main() {
  try {
    // Connect to the MongoDB cluster
    // await client.connect();
    // console.log("Successfully connected to the databases.");

    mongoose.connect(uri, {
      dbName: "NFTMarketDB",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to the databases.");
  } catch (e) {
    console.error(e);
  }
}

main();

module.exports = mongoose.connection;
