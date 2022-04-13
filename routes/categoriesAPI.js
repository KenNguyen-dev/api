var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");
const { ObjectId } = require("mongodb");
const Category = require("../schema/CategorySchema");

let upload = multer({ storage: memoryStorage() });

//create new category
router.post("/add", (req, res, next) => {
  const { name } = req.body;
  let promise = new Promise((resolve, reject) => {
    const category = new Category({
      name: name,
    });
    category.save((err, result) => {
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

router.get("/list", (req, res, next) => {
  let promise = new Promise((resolve, reject) => {
    Category.find({}, (err, result) => {
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
    Category.findByIdAndDelete(id, (err, result) => {
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

//edit name of category
router.put("/edit", (req, res, next) => {
  const { id } = req.query;
  let promise = new Promise((resolve, reject) => {
    Category.findByIdAndUpdate(id, { name: req.body.name }, (err, result) => {
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

module.exports = router;
