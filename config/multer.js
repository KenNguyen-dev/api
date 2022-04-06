const { existsSync, rm } = require("fs");
const multer = require("multer");
const path = require('path');
const { fileURLToPath } = require('url');
const { dirname } = require('path');
const { memoryStorage } = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "Upload"))
  },
  filename: function (req, file, cb) {
    let uniqueSuffix = "";
    uniqueSuffix = (file.originalname.includes("jfif") ? file.originalname.replace("jfif", "png") : file.originalname);
    cb(null, uniqueSuffix)
  }
});

const upload = multer({ storage: memoryStorage() });
module.exports = upload;
