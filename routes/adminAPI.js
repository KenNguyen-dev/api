var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");

router.get("/top5customer", (req, res, next) => {
  var queryString =
    "SELECT id,diem_tich_luy from khach_hang order by diem_tich_luy DESC LIMIT 5 ;";
  db.query(queryString, (err, result) => {
    if (err) console.log(err);
    res.status(200).send(result);
  });
});
