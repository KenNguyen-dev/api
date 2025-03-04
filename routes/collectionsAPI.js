var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");
const { ObjectId } = require("mongodb");
const Collection = require("../schema/CollectionSchema");
const Category = require("../schema/CategorySchema");
const User = require("../schema/UserSchema");
const Asset = require("../schema/AssetSchema");

let upload = multer({ storage: memoryStorage() });

//create new collection
router.post("/create", async (req, res, next) => {
  const { name, description, userId, categoryId } = req.body;

  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  try {
    if (categoryId != null) {
      const category = await Category.findById(categoryId).exec();

      const collection = new Collection({
        name: name,
        description: description,
        owner: user._id,
        category: category,
      });

      user.ownedCollections.push(collection);

      await collection.save();
      await user.save();
      res.sendStatus(200);
    } else {
      const collection = new Collection({
        name: name,
        description: description,
        owner: user._id,
      });

      await collection.save();
      user.ownedCollections.push(collection);

      res.sendStatus(200);
      await user.save();
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

//delete collection by id
router.delete("/delete", (req, res, next) => {
  const { id } = req.query;
  let promise = new Promise((resolve, reject) => {
    Collection.findByIdAndDelete(id, (err, result) => {
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

//get collection by id
router.get("/get-collection", (req, res, next) => {
  const { id } = req.query;
  let promise = new Promise((resolve, reject) => {
    Collection.findById(id)
      .populate({
        path: "assets",
        model: "Asset",
        populate: {
          path: "history",
          populate: {
            path: "from",
            model: "User",
            select: "walletAddress",
          },
          path: "history",
          populate: {
            path: "to",
            model: "User",
            select: "walletAddress",
          },
        },
      })
      .populate("owner", ["name", "bio"])
      .exec((err, result) => {
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

// add NFT to collection
router.post("/add-asset", async (req, res, next) => {
  const { collectionId } = req.query;
  const { assetID } = req.body;
  console.log(`id: ${collectionId}`);
  console.log(`assetID: ${assetID}`);

  const asset = await Asset.findById(assetID).exec();

  if (!asset) {
    return res.status(404).json({
      message: "Asset not found",
    });
  }

  let promise = new Promise((resolve, reject) => {
    Collection.findById(collectionId, (err, result) => {
      if (err) {
        reject(err);
      } else {
        result.assets.push(assetID);
        result.save((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
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

//remove NFT from collection
router.delete("/remove-asset", async (req, res, next) => {
  const { id } = req.query;
  const { assetID } = req.body;

  const asset = await Asset.findById(assetID).exec();

  if (!asset) {
    return res.status(404).json({
      message: "Asset not found",
    });
  }

  let promise = new Promise((resolve, reject) => {
    Collection.findById(id, (err, result) => {
      if (err) {
        reject(err);
      } else {
        result.assets.pull(assetID);
        result.save((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
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

router.patch("/change-category", async (req, res, next) => {
  const { id, categoryId } = req.body;

  const category = await Category.findById(categoryId).exec();

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  let promise = new Promise((resolve, reject) => {
    Collection.findByIdAndUpdate(
      id,
      { category: category._id },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });

  promise
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.patch("/update", async (req, res, next) => {
  const { id, categoryId, name, description } = req.body;

  if (categoryId != null) {
    const category = await Category.findById(categoryId).exec();

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
  }

  let promise = new Promise((resolve, reject) => {
    Collection.findByIdAndUpdate(
      id,
      { category: categoryId, name: name, description: description },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });

  promise
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
