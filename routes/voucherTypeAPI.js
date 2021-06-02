var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");

router.get("/list", (req, res, next) => {
  var queryString = "select * from loai_voucher";
  db.query(queryString, (err, result) => {
    if (err) res.status(400).send(err);
    console.table(result);
    res.status(200).send(result);
  });
});

router.post("/add", (req, res, next) => {
  var queryString = `INSERT INTO loai_voucher (id,ten) VALUES ('${req.body.id}','${req.body.ten}')`;
  db.query(queryString, (err) => {
    if (err) {
      console.log(err);
      res.status(400).send("Add failed. Please check your ID again");
    } else {
      res.status(200).send("Add Successfully");
    }
  });
});

router.delete("/delete", (req, res, next) => {
  var queryString = `DELETE FROM loai_voucher where id='${req.body.id}'`;
  db.query(queryString, (err) => {
    if (err) res.status(400).send(err);
    res.status(200).send("Delete success");
  });
});

router.put("/update", (req, res, next) => {
  var queryString = `UPDATE loai_voucher SET ten='${req.body.ten}' where id='${req.body.id}'`;
  db.query(queryString, (err) => {
    if (err) res.status(400).send(err);
    res.status(200).send("Update success");
  });
});

module.exports = router;
