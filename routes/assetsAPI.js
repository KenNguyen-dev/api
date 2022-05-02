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

let upload = multer({ storage: memoryStorage() });

//with IPFS
router.post("/mint", async (req, res, next) => {
  const { uriID, name, description, currentOwnerID, currentCollectionID } =
    req.body;

  try {
    const user = await User.findById(currentOwnerID).exec();
    const collection = await Collection.findById(currentCollectionID).exec();
    const event = new Event({
      type: "mint",
      from: null,
      to: user._id,
      date: Date.now(),
    });

    await event.save();

    const asset = new Asset({
      uriID: uriID,
      name: name,
      currentOwner: user._id,
      currentCollection: collection._id,
      description: description,
      history: event._id,
    });

    user.ownedAssets = [...user.ownedAssets, asset._id];
    await user.save();

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
  console.log(id);
  try {
    // const asset = await Asset.findById(id)
    //   .populate('history')
    //   .populate('currentCollection', 'name')
    //   .populate('currentOwner', ['name', 'bio'])
    //   .exec();
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
          select: ["name", "bio"],
        },
      ])
      .exec();
    res.status(200).send(asset);
  } catch {
    res.status(400).send("Asset not found");
  }
});

router.put("update-status", async (req, res, next) => {
  const { id } = req.query;
  const { status } = req.body;

  if (status == "Sale" || status == "Auction" || status == "Not Listing") {
    const asset = await Asset.findById(id).exec();
    asset.status = status;
    await asset.save();
    res.status(200).send("Asset status updated");
  } else {
    res.status(400).send("Invalid status");
  }
});

router.put("/listing", async (req, res, next) => {
  const { id } = req.query;
  const { status, price } = req.body;
  try {
    const asset = await Asset.findById(id).exec();
    asset.status = status;
    asset.currentPrice = price;
    asset.prevPrice = [
      ...asset.prevPrice,
      { price: price, updatedAt: Date.now() },
    ];
    await asset.save();
    res.status(200).send("List asset on sale successfully");
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
router.post("/sold", async (req, res, next) => {
  const { id, currentOwnerID, newOwnerID, price } = req.body;

  try {
    const currentOwner = await User.findById(currentOwnerID).exec();
    const newOwner = await User.findById(newOwnerID).exec();
    const asset = await Asset.findById(id).exec();

    if (asset.currentOwner.toString() !== currentOwner._id.toString()) {
      throw "Asset does not belong to current owner";
    }

    const event = new Event({
      type: "transfer",
      from: currentOwner._id,
      to: newOwner._id,
      price: price,
      date: Date.now(),
    });
    currentOwner.ownedAssets = currentOwner.ownedAssets.filter(
      (assetID) => assetID != id
    );

    newOwner.ownedAssets = [...newOwner.ownedAssets, id];
    asset.currentOwner = newOwner._id;
    asset.history = [...asset.history, event._id];
    asset.status = "Not Listing";
    await event.save();
    await currentOwner.save();
    await newOwner.save();
    await asset.save();
    res.status(200).send("Asset sold successfully");
  } catch {
    res.status(400).send("Error sold");
  }
});

//update price
router.put("/update-price", (req, res, next) => {
  const { id, price } = req.body;
  let promise = new Promise((resolve, reject) => {
    const assets = Asset.findById(id).exec();
    assets.then((asset) => {
      asset.currentPrice = price;
      asset.prevPrice = [
        ...asset.prevPrice,
        { price: price, updatedAt: Date.now() },
      ];
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

router.put("change-collection", async (req, res, next) => {
  const { id, collectionID } = req.body;
  try {
    const asset = await Asset.findById(id).exec();
    const collection = await Collection.findById(collectionID).exec();
    asset.currentCollection = collection._id;
    asset.save();
    res.status(200).send("Asset collection updated");
  } catch {
    res.status(400).send("Error updating asset collection");
  }
});

module.exports = router;
