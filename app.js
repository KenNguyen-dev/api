var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const bodyParser = require("body-parser");

var indexRouter = require("./routes/index");
var voucherTypeAPI = require("./routes/voucherTypeAPI");
var serviceAPI = require("./routes/serviceAPI");
var partnerTypeAPI = require("./routes/partnerTypeAPI");
var partnerAPI = require("./routes/partnerAPI");
var voucherAPI = require("./routes/voucherAPI");
var customerAPI = require("./routes/customerAPI");
var adminAPI = require("./routes/adminAPI");

var app = express();
require("dotenv").config();

//#region View Engine

const corsOpts = {
  origin: "*",

  methods: ["GET", "POST", "PUT"],
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
app.use("/service", serviceAPI);
app.use("/vouchertype", voucherTypeAPI);
app.use("/partnertype", partnerTypeAPI);
app.use("/partner", partnerAPI);
app.use("/voucher", voucherAPI);
app.use("/customer", customerAPI);
app.use("/admin", adminAPI);

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
