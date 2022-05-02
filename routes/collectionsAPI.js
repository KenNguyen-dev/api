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
  const { name, description, userID, categoryID } = req.body;

  const user = await User.findById(userID).exec();
  const category = await Category.findById(categoryID).exec();

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  let promise = new Promise((resolve, reject) => {
    const collection = new Collection({
      name: name,
      description: description,
      owner: user._id,
      category: category._id,
    });
    collection.save((err, result) => {
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
      .populate("assets")
      .populate("owner", "name")
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

router.put("/change-category", async (req, res, next) => {
  const { id } = req.query;
  const { categoryID } = req.body;

  const category = await Category.findById(categoryID).exec();

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

router.put("/update", async (req, res, next) => {
  const { id } = req.query;
  const { categoryID, name, description } = req.body;

  const category = await Category.findById(categoryID).exec();

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  let promise = new Promise((resolve, reject) => {
    Collection.findByIdAndUpdate(
      id,
      { category: category._id, name: name, description: description },
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
