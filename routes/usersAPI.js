var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const firebase = require("../config/firebase");

let upload = multer({ storage: memoryStorage() });

router.post("/register", (req, res, next) => {
  var user = {_id:req.body.id,"userName":"Default","email":"","profilePicUrl":"","bio":"","nftCollections":{},"nftCreated":{},"favorites":{}};
  let promise = new Promise((resolve, reject) => {
    db.collection("users").insertOne(user, (err) => {
      if (err) {
        console.log("Reject promise");
        return reject(err);   
      }
      resolve();
    });
  });

  promise.then(()=>{
    console.log("Resolve")
    res.sendStatus(200)
  })
  .catch((err)=>{
    console.log("Catch Reject")
    res.status(400).send("Error: " + err);
  })
});

router.post("/login", (req, res, next) => {
  let promise = new Promise((resolve, reject) => {
    db.collection("users").findOne({_id:req.body.id}, (err,result) => {
      if (err) {
        return reject(err);   
      }
      resolve(result);
    });
  });

  promise.then((result)=>{
    res.status(200).send(result);
  })
  .catch((err)=>{
    res.status(400).send("Error: " + err);
  })
});

router.put("/updateusername", (req, res, next) => {
  let promise = new Promise((resolve, reject) => {
    db.collection("users").updateOne({"_id":req.body.id}, {$set:{"userName":req.body.userName}}, (err,result) => {
      if (err) {
        return reject(err);   
      }
      resolve(result);
    });
  });

  promise.then((result)=>{
    res.status(200).send(result);
  })
  .catch((err)=>{
    res.status(400).send("Error: " + err);
  })
});

router.put("/updatebio", (req, res, next) => {
  let promise = new Promise((resolve, reject) => {
    db.collection("users").updateOne({"_id":req.body.id}, {$set:{"bio":req.body.bio}}, (err,result) => {
      if (err) {
        return reject(err);   
      }
      resolve(result);
    });
  });

  promise.then((result)=>{
    res.status(200).send(result);
  })
  .catch((err)=>{
    res.status(400).send("Error: " + err);
  })
})

router.put("/updatemail", (req, res, next) => {
  let promise = new Promise((resolve, reject) => {
    db.collection("users").updateOne({"_id":req.body.id}, {$set:{"email":req.body.email}}, (err,result) => {
      if (err) {
        return reject(err);   
      }
      resolve(result);
    });
  });

  promise.then((result)=>{
    res.status(200).send(result);
  })
  .catch((err)=>{
    res.status(400).send("Error: " + err);
  })
})

router.put("/updateprofileimg", upload.single("profileImg"), (req, res, next) => {
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
      db.collection('users').updateOne({"_id":req.body.id}, {$set:{"profilePicUrl":`https://firebasestorage.googleapis.com/v0/b/nftmarketdb.appspot.com/o/${file.originalname}?alt=media`}}, (err,result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    promise.then((result)=>{
      res.status(200).send(result);
    })
    .catch((err)=>{
      res.status(400).send("Error: " + err);
    })
  } else {
    res.status(400).send("Invalid image file");
  }
});



module.exports = router;
