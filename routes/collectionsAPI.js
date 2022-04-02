var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");
const { ObjectId } = require("mongodb");

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
router.post("/create", (req, res, next) => {
  const { name, description, owner, category } = req.body;
  const newCollection = {
    name,
    description,
    owner,
    category,
  };
  let promise = new Promise((resolve, reject) => {
    db.collection("collections").insertOne(
      { ...newCollection, nftList: [] },
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

// get all collections by owner
router.get("/getallcollections", (req, res, next) => {
  const { owner } = req.query;
  let promise = new Promise((resolve, reject) => {
    db.collection("collections")
      .find({ owner: owner })
      .toArray((err, result) => {
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
    db.collection("collections").deleteOne({ _id: id }, (err, result) => {
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
    db.collection("collections")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "nfts",
            localField: "nftList",
            foreignField: "_id",
            as: "nftList",
          },
        },
      ])
      .toArray((err, result) => {
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
router.post("/addnft", (req, res, next) => {
  const { id, nftId } = req.body;
  console.log(`id: ${id}`);
  console.log(`nftId: ${nftId}`);
  let promise = new Promise((resolve, reject) => {
    db.collection("collections").updateOne(
      { _id: ObjectId(id) },
      { $push: { nftList: nftId } },
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.modifiedCount === 0) {
          return reject("Collection not found");
        }

        resolve(result);
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

//remove NFT from collection
router.delete("/removenft", (req, res, next) => {
  const { id } = req.query;
  const { nftId } = req.body;
  let promise = new Promise((resolve, reject) => {
    db.collection("collections").updateOne(
      { _id: ObjectId(id) },
      { $pull: { nftList: nftId } },
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
