var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");
const { ObjectId } = require("mongodb");

let upload = multer({ storage: memoryStorage() });

router.post("/login", async (req, res, next) => {
  const address = req.body.id;
  const newUser = {
    id: ObjectId(),
    address: address,
    userName: "Default",
    email: "",
    profilePicUrl: "",
    profileBannerUrl: "",
    bio: "",
    nftCollections: [],
    nftCreated: [],
    favoriteNfts: [],
  };
  console.log(newUser)
  let promise = new Promise((resolve, reject) => {
    db.collection("users").findOne({ address }, (err, result) => {
      if (err || result === null) {
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
      if (err) {
        res.status(400).send("Error: " + err);
      }

      const promise = new Promise((resolve, reject) => {
        db.collection("users").insertOne(newUser, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      promise.then(() => {
        res.status(201).send('New user created');
      }).catch((err) => {
        res.status(400).send("Error: " + err);
      });
    });
});

router.put("/update", (req, res, next) => {
  const id = req.body.id;
  const userName = req.body.username;
  const email = req.body.email;
  const bio = req.body.bio;

  let promise = new Promise((resolve, reject) => {
    db.collection("users").updateOne(
      { _id: id },
      { $set: { userName: userName,email: email ,bio: bio}},
      (err, result) => {
        if (err || result.modifiedCount === 0) {
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

router.put(
  "/updatebannerimg",
  upload.single("bannerImg"),
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
  }
);

router.get("/detail/:id", async (req, res) => {
  try {
    console.log(req.params.id)
    const user = await db.collection("users").findOne({ _id: ObjectId(req.params.id) })
    res.json(user)
  } catch (e) {
    console.log(e)
    res.status(400).json(e)
  }
})

router.put("/update/:id", (req, res) => {
  let promise = new Promise((resolve, reject) => {
    db.collection("users").updateOne(
      { _id: req.body.id },
      { $set: req.body },
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
});

module.exports = router;
