var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/usersAPI");
var assetsRoute = require("./routes/assetsAPI");
var collectionsRoute = require("./routes/collectionsAPI");
var categoriesRoute = require("./routes/categoriesAPI");
var uploadAPI = require("./routes/uploadAPI");

var app = express();

//#region View Engine

const corsOpts = {
  origin: ['http://localhost:3000', 'https://huft-nft-marketplace-kappa.vercel.app'],

  methods: ["GET", "POST", "PUT", "PATCH"],
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
//#endregion

app.use(cors(corsOpts));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("*/images", express.static("public/images"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/assets", assetsRoute);
app.use("/collections", collectionsRoute);
app.use("/categories", categoriesRoute);
app.use("/upload", uploadAPI);

//#region Catch Error
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
//#endregion

module.exports = app;
