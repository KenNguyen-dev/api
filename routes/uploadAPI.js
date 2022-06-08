const route = require("express").Router();
const upload = require("../config/multer");
const firebase = require("../config/firebase");
var db = require("../config/dbconfig");
const { ObjectId } = require("mongodb");

const imageTypes = ["image/jpeg", "image/png", "image/gif"];

const image = upload.single("image");

route.post("/", image, (req, res) => {
    const file = req?.file;
    if (imageTypes.includes(file?.mimetype)) {
        const blob = firebase.bucket.file(file.originalname);
        const blobWriter = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });
        blobWriter.on("error", (err) => {
            console.log("Error uploading file to bucket:", err);
        });
        blobWriter.end(file.buffer);
        res.json({
            imageURL: `https://firebasestorage.googleapis.com/v0/b/nftmarketdb.appspot.com/o/${file.originalname}?alt=media`
        })
    }
});

route.post("/save/:id", image, async (req, res) => {
    const file = req?.file;
    const data = req?.body;
    if (imageTypes.includes(file?.mimetype)) {
        const blob = firebase.bucket.file(file.originalname);
        const blobWriter = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });
        blobWriter.on("error", (err) => {
            console.log("Error uploading file to bucket:", err);
        });
        blobWriter.end(file.buffer);
        await db.collection(data?.collection_name).findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    [data?.field_name]: `https://firebasestorage.googleapis.com/v0/b/nftmarketdb.appspot.com/o/${file.originalname}?alt=media`,
                },
            },
            async (err, result) => {
                if(err) res.json("error")
                console.log(await db.collection(data?.collection_name).findOne({_id: req.params.id}))
                res.json({
                    imageURL: `https://firebasestorage.googleapis.com/v0/b/nftmarketdb.appspot.com/o/${file.originalname}?alt=media`,
                    result
                })
            }
        );
    }
})

module.exports = route;