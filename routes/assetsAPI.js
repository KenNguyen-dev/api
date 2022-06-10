var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");
const Event = require("../schema/EventSchema");
const User = require("../schema/UserSchema");
const Collection = require("../schema/CollectionSchema");
const Asset = require("../schema/AssetSchema");
const { parse } = require("path");
const AssetSchema = require("../schema/AssetSchema");

let upload = multer({ storage: memoryStorage() });

//with IPFS
router.post("/mint", async (req, res, next) => {
  const {
    uriID,
    name,
    description,
    currentOwnerID,
    currentCollectionID,
    tokenId,
    thumb_type,
  } = req.body;

  try {
    const user = await User.findById(currentOwnerID).exec();
    const collection = await Collection.findById(currentCollectionID).exec();
    const event = new Event({
      type: "Mint",
      from: null,
      to: user._id,
      date: Date.now(),
    });

    await event.save();

    const asset = new Asset({
      tokenId: tokenId,
      uriID: uriID,
      name: name,
      currentOwner: user._id,
      currentCollection: collection._id,
      description: description,
      history: event._id,
      thumb_type,
    });

    user.ownedAssets = [...user.ownedAssets, asset._id];
    collection.assets = [...collection.assets, asset._id];
    await user.save();
    await collection.save();

    asset.save((err, result) => {
      if (err) {
        throw err;
      }
      res.status(200).send(result);
    });
  } catch (err) {
    res.status(400).send("Error creating asset " + err);
  }
});

router.get("/assets-nft", async (req, res) => {
  let filterParams = req.query || {},
    startIndex =
      (filterParams?.page_index || 1 - 1) * (filterParams?.page_size || 10),
    endIndex =
      (filterParams?.page_index || 1) * (filterParams?.page_size || 10);
  const result = await AssetSchema.find(filterParams);
  const listAll = await AssetSchema.find();
  res.json({
    totalAll: listAll.length,
    total: result.length,
    page_index: filterParams?.page_index || 1,
    page_size: filterParams?.page_size || 10,
    result: result.slice(startIndex, endIndex),
  });
});

//#region without IPFS

// router.post("/add", upload.single("image"), (req, res, next) => {
//   if (!req.file) {
//     res.status(400).send("No image file found");
//   }

//   var file = req.file;
//   console.log("This is image file ");
//   console.log(file);

//   const {
//     name,
//     description,
//     currentOwner,
//     originalOwner,
//     collection,
//     status,
//     mintedAt,
//   } = req.body;
//   const newNFT = {
//     name,
//     description,
//     currentOwner,
//     originalOwner,
//     collection,
//     status,
//     mintedAt,
//   };

//   if (
//     file.mimetype == "image/jpeg" ||
//     file.mimetype == "image/png" ||
//     file.mimetype == "image/gif"
//   ) {
//      const blob = firebase.bucket.file(req.file.originalname);
//     const blobWriter = blob.createWriteStream({
//       metadata: {
//         contentType: req.file.mimetype,
//       },
//     });

//     blobWriter.on("error", (err) => {
//       console.log("Error uploading file to bucket:", err);
//     });

//     blobWriter.end(req.file.buffer);

//     let promise = new Promise((resolve, reject) => {
//     db.collection("nfts").insertOne({...newNFT,"imageURL":`https://firebasestorage.googleapis.com/v0/b/nftmarketdb.appspot.com/o/${file.originalname}?alt=media`},(err, result) => {
//       if (err) {
//         return reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

//     promise.then((result)=>{
//       res.status(200).send(result);
//     })
//     .catch((err)=>{
//       res.status(400).send("Error: " + err);
//     })
//   }

// });
//#endregion

router.get("/get-asset", async (req, res, next) => {
  const { id } = req.query;
  try {
    const asset = await Asset.findById(id)
      .populate([
        {
          path: "history",
          populate: {
            path: "from",
            model: "User",
            select: "walletAddress",
          },
        },
        {
          path: "history",
          populate: {
            path: "to",
            model: "User",
            select: "walletAddress",
          },
        },
        {
          path: "currentCollection",
          select: "name",
        },
        {
          path: "currentOwner",
          select: ["name", "bio", "walletAddress"],
        },
      ])
      .exec();
    res.status(200).send(asset);
  } catch {
    res.status(400).send("Asset not found");
  }
});

router.patch("/update-status", async (req, res, next) => {
  const { id, status } = req.body;
  console.log(id);
  console.log(status);

  if (status == "Sale" || status == "On Auction" || status == "Not Listing") {
    const asset = await Asset.findById(id).exec();
    asset.status = status;
    await asset.save();
    res.status(200).send("Asset status updated");
  } else {
    res.status(400).send("Invalid status");
  }
});

router.patch("/listing", async (req, res, next) => {
  const { id, status, price } = req.body;
  const newPrice = {
    price: price,
    updatedAt: Date.now(),
  };
  try {
    const asset = await Asset.findById(id).exec();
    asset.status = status;
    asset.currentPrice = price;
    asset.prevPrice.push(newPrice);
    await asset.save();
    res.status(200).send("List on marketplace successfully");
  } catch {
    res.status(400).send("Error updating asset status");
  }
});

//delete NFT by id
router.delete("/delete", (req, res, next) => {
  const { id } = req.query;
  let promise = new Promise((resolve, reject) => {
    db.collection("nfts").deleteOne({ _id: id }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  promise
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

//update current owner
router.post("/transaction", async (req, res, next) => {
  const { id, currentOwnerId, newOwnerId, price, status } = req.body;

  try {
    const currentOwner = await User.findById(currentOwnerId).exec();
    const newOwner = await User.findById(newOwnerId).exec();
    const asset = await Asset.findById(id).exec();

    if (asset.currentOwner.toString() !== currentOwner._id.toString()) {
      throw "Asset does not belong to current owner";
    }

    const event = new Event({
      type: status,
      from: currentOwner._id,
      to: newOwner._id,
      price: price,
      date: Date.now(),
    });
    const assetIndex = currentOwner.ownedAssets.indexOf(asset._id);
    if (assetIndex > -1) {
      currentOwner.ownedAssets.splice(assetIndex, 1);
    }
    newOwner.ownedAssets.push(asset._id);
    asset.currentOwner = newOwner._id;
    asset.history.push(event);
    asset.status = "Not Listing";
    await event.save();
    await currentOwner.save();
    await newOwner.save();
    await asset.save();
    res.status(200).send("Asset sold successfully");
  } catch (err) {
    console.log(err);
    res.status(400).send("Error sold");
  }
});

//update price
router.patch("/update-price", (req, res, next) => {
  const { id, price } = req.body;
  let promise = new Promise((resolve, reject) => {
    const assets = Asset.findById(id).exec();
    const newPrice = {
      price: price,
      updatedAt: Date.now(),
    };

    assets.then((asset) => {
      asset.currentPrice = price;
      asset.prevPrice.push(newPrice);
      asset.status = "Sale";
      asset.save();
      resolve(asset);
    });
  });

  promise
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.patch("/update", (req, res, next) => {
  const { id, name, description } = req.body;
  let promise = new Promise((resolve, reject) => {
    const asset = Asset.findById(id).exec();

    if (!asset) {
      reject();
    }

    asset.then((asset) => {
      asset.name = name;
      asset.description = description;
      asset.save();
      resolve(asset);
    });
  });

  promise
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.patch("/change-collection", async (req, res, next) => {
  const { id, collectionId } = req.body;
  try {
    const asset = await Asset.findById(id).exec();
    const collection = await Collection.findById(collectionId).exec();
    asset.currentCollection = collection._id;
    asset.save();
    res.status(200).send("Asset collection updated");
  } catch {
    res.status(400).send("Error updating asset collection");
  }
});

module.exports = router;
