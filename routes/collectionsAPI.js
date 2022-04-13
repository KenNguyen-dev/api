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

let upload = multer({ storage: memoryStorage() });

const collection = {
  _id: "",
  name: "",
  description: "",
  nfts: [],
  owner: "",
  category: "",
};

//create new collection
router.post("/create", async (req, res, next) => {
  const { name, description, owner, categoryName } = req.body;
  const category = await Category.findOne({ name: categoryName });

  console.log(category._id);

  let promise = new Promise((resolve, reject) => {
    const collection = new Collection({
      name: name,
      description: description,
      owner: owner,
    });
    collection.category = category._id;
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
router.get("/getcollection", (req, res, next) => {
  const { id } = req.query;
  let promise = new Promise((resolve, reject) => {
    // db.collection("collections")
    //   .aggregate([
    //     {
    //       $match: {
    //         _id: new ObjectId(id),
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "nfts",
    //         localField: "nftList",
    //         foreignField: "_id",
    //         as: "nftList",
    //       },
    //     },
    //   ])
    //   .toArray((err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result);
    //     }
    //   });
    Collection.findById(id)
      .populate("assets")
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
router.post("/addasset", (req, res, next) => {
  const { collectionId } = req.query;
  const { uriID } = req.body;
  console.log(`id: ${collectionId}`);
  console.log(`uriID: ${uriID}`);
  let promise = new Promise((resolve, reject) => {
    Collection.findById(collectionId, (err, result) => {
      if (err) {
        reject(err);
      } else {
        result.assets.push(uriID);
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
router.delete("/removeasset", (req, res, next) => {
  const { id } = req.query;
  const { uriID } = req.body;
  let promise = new Promise((resolve, reject) => {
    Collection.findById(id, (err, result) => {
      if (err) {
        reject(err);
      } else {
        result.assets.pull(uriID);
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

module.exports = router;
