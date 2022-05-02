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
  console.log(walletAddress);

  if (!walletAddress) {
    return res.status(400).json({
      message: "Please provide wallet address",
    });
  }

  try {
    const user = await User.findOne({ walletAddress: walletAddress })
      .populate("ownedAssets")
      .populate("ownedCollections")
      .populate("favoriteAssets")
      .exec();
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
      return res.status(201).send(newUser);
    }
    return res.status(200).send(user);
  } catch {
    res.status(400).json({
      message: "Error logging in",
    });
  }
});

router.get("/get-user", async (req, res, next) => {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({
      message: "Please provide wallet address",
    });
  }

  try {
    const user = await User.findOne({ walletAddress: walletAddress })
      .populate("ownedAssets")
      .populate("ownedCollections")
      .populate("favoriteAssets")
      .exec();
    if (!user) {
      throw new Error("User not found");
    }
    return res.status(200).send(user);
  } catch {
    res.status(400).json({
      message: "Error getting user",
    });
  }
});

router.get("/owned-assets", async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      message: "Please provide id",
    });
  }

  try {
    const assets = await User.findOne({ _id: id }, "ownedAssets")
      .populate([
        {
          path: "ownedAssets",
          populate: {
            path: "currentCollection",
            model: "Collection",
            select: "name",
          },
        },
        {
          path: "ownedAssets",
          populate: {
            path: "currentOwner",
            model: "User",
            select: ["name", "bio"],
          },
        },
        {
          path: "ownedAssets",
          populate: {
            path: "history",
            model: "Event",
            populate: [
              {
                path: "from",
                model: "User",
                select: "walletAddress",
              },
              {
                path: "to",
                model: "User",
                select: "walletAddress",
              },
            ],
          },
        },
      ])
      .exec();
    return res.status(200).send(assets);
  } catch {
    res.status(400).json({
      message: "Error retrieving owned assets",
    });
  }
});

router.get("/favorite-assets", async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      message: "Please provide id",
    });
  }

  try {
    const assets = await User.findOne({ _id: id }, "favoriteAssets")
      .populate("favoriteAssets")
      .exec();
    return res.status(200).send(assets);
  } catch {
    res.status(400).json({
      message: "Error retrieving favorite assets",
    });
  }
});

router.get("/owned-collections", async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      message: "Please provide id",
    });
  }

  try {
    const collections = await User.findOne({ _id: id }, "ownedCollections")
      .populate([
        {
          path: "ownedCollections",
          populate: {
            path: "owner",
            model: "User",
            select: "name",
          },
        },
        {
          path: "ownedCollections",
          populate: {
            path: "assets",
            model: "Asset",
          },
        },
      ])
      .exec();
    return res.status(200).send(collections);
  } catch {
    res.status(400).json({
      message: "Error retrieving owned collections",
    });
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
      res.sendStatus(200);
    })
    .catch((err) => {
      res.status(400).json({
        message: "Error updating user",
      });
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
