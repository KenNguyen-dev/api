var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");

let upload = multer({ storage: memoryStorage() });

const nft = {
  _id: "",
  name: "",
  description: "",
  imageURL: "",
  currentOwner: "",
  originalOwner: "",
  status: "",
  mintedAt: "",
  currentPrice: 0,
};

//with IPFS
router.post("/add", (req, res, next) => {
  const {
    name,
    description,
    imageURL,
    currentOwner,
    originalOwner,
    status,
    createdAt,
    currentPrice,
    categoryName,
    _id,
  } = req.body;
  const newNFT = {
    _id,
    name,
    description,
    imageURL,
    currentOwner,
    originalOwner,
    status,
    createdAt,
    currentPrice,
    categoryName,
  };
  let promise = new Promise((resolve, reject) => {
    db.collection("nfts").insertOne(newNFT, (err, result) => {
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

//get NFTs by current owner
router.get("/getbycurrentowner", (req, res, next) => {
  const { currentOwner } = req.query;
  let promise = new Promise((resolve, reject) => {
    db.collection("nfts")
      .find({ currentOwner: currentOwner })
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
router.put("/updatecurrentowner", (req, res, next) => {
  const { _id, currentOwner } = req.body;
  let promise = new Promise((resolve, reject) => {
    db.collection("nfts").updateOne(
      { _id: _id },
      { $set: { currentOwner: currentOwner } },
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

//update price
router.put("/updateprice", (req, res, next) => {
  const { _id, currentPrice } = req.body;
  let promise = new Promise((resolve, reject) => {
    db.collection("nfts").updateOne(
      { _id: _id },
      { $set: { currentPrice: currentPrice } },
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
