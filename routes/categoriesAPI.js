var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");
const { ObjectId } = require("mongodb");

let upload = multer({ storage: memoryStorage() });

//create new category
router.post("/add", (req, res, next) => {
  const { name } = req.body;
  let promise = new Promise((resolve, reject) => {
    db.collection("categories").insertOne({ name: name }, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
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

// get all collections by owner
router.get("/list", (req, res, next) => {
  let promise = new Promise((resolve, reject) => {
    db.collection("categories")
      .find({})
      .toArray((err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
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
    db.collection("collections").deleteOne(
      { _id: ObjectId(id) },
      (err, result) => {
        if (err) {
          return reject(err);
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

//edit name of category
router.put("/edit", (req, res, next) => {
  const { id } = req.query;
  let promise = new Promise((resolve, reject) => {
    db.collection("categories").updateOne(
      { _id: ObjectId(id) },
      { $set: { name: req.body.name } },
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.modifiedCount === 0) {
          return reject("No document found");
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

module.exports = router;
