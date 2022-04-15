var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");
const { ObjectId } = require("mongodb");
const User = require("../schema/UserSchema");
const Collection = require("../schema/CollectionSchema");

let upload = multer({ storage: memoryStorage() });

router.post("/login", async (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).send("No wallet address provided");
  }

  try {
    const user = await User.findOne({ walletAddress: walletAddress }).exec();
    if (!user) {
      const newUser = new User({
        walletAddress: walletAddress,
      });
      const collection = new Collection({
        name: "My Collection",
        description: "My first collection",
        owner: newUser._id,
        category: null,
      });
      await collection.save();
      newUser.ownedCollections = [collection._id];
      await newUser.save();
      return res.status(201).json({
        message: "New user created",
        user: newUser,
      });
    }
    return res.status(200).send(user);
  } catch {
    res.status(400).send("Error logging in");
  }
});

router.put("/update", (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const email = req.body.email;
  const bio = req.body.bio;

  let promise = new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      id,
      {
        name: name,
        email: email,
        bio: bio,
      },
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
      res.status(400).send("Error: " + err);
    });
});

router.put(
  "/updateprofileimg",
  upload.single("profileImg"),
  (req, res, next) => {
    if (!req.file) {
      res.status(400).send("No image file found");
    }

    var file = req.file;
    console.log("This is image file ");
    console.log(file);

    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/gif"
    ) {
      const blob = firebase.bucket.file(req.file.originalname);
      const blobWriter = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobWriter.on("error", (err) => {
        console.log("Error uploading file to bucket:", err);
      });

      blobWriter.end(req.file.buffer);

      let promise = new Promise((resolve, reject) => {
        db.collection("users").updateOne(
          { _id: req.body.id },
          {
            $set: {
              profilePicUrl: `https://firebasestorage.googleapis.com/v0/b/nftmarketdb.appspot.com/o/${file.originalname}?alt=media`,
            },
          },
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
          res.status(400).send("Error: " + err);
        });
    } else {
      res.status(400).send("Invalid image file");
    }
  }
);

router.put("/updatebannerimg", upload.single("bannerImg"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No image file found");
  }

  var file = req.file;
  console.log("This is image file ");
  console.log(file);

  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/gif"
  ) {
    const blob = firebase.bucket.file(req.file.originalname);
    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobWriter.on("error", (err) => {
      console.log("Error uploading file to bucket:", err);
    });

    blobWriter.end(req.file.buffer);

    let promise = new Promise((resolve, reject) => {
      db.collection("users").updateOne(
        { _id: req.body.id },
        {
          $set: {
            profileBannerUrl: `https://firebasestorage.googleapis.com/v0/b/nftmarketdb.appspot.com/o/${file.originalname}?alt=media`,
          },
        },
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
        res.status(400).send("Error: " + err);
      });
  } else {
    res.status(400).send("Invalid image file");
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const user = await User.findById(req.params.id)
      .populate("favoriteAssets")
      .populate("ownedAssets")
      .populate("ownedCollections")
      .exec();
    res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.put("/update/:id", (req, res) => {
  let promise = new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        bio: req.body.bio,
      },
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
      res.status(400).send("Error: " + err);
    });
});

module.exports = router;
