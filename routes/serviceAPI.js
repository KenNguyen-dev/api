var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");

router.get("/list", (req, res, next) => {
  var queryString = "select * from dich_vu";
  db.query(queryString, (err, result) => {
    if (err) console.log(err);
    console.table(result);
    res.send(result);
  });
});

router.post("/add", (req, res, next) => {
  var queryString = `INSERT INTO dich_vu (id,ten) VALUES ('${req.body.id}','${req.body.ten}')`;
  db.query(queryString, (err) => {
    if (err) {
      console.log(err);
      res.send("Add failed. Please check your ID again");
    } else {
      res.send("Add Successfully");
    }
  });
});

router.delete("/delete", (req, res, next) => {
  var queryString = `DELETE FROM dich_vu where id='${req.body.id}'`;
  db.query(queryString, (err) => {
    if (err) console.log(err);
    res.send("Delete success");
  });
});

router.put("/update", (req, res, next) => {
  var queryString = `UPDATE dich_vu SET ten='${req.body.ten}' where id='${req.body.id}'`;
  db.query(queryString, (err) => {
    if (err) console.log(err);
    res.send("Update success");
  });
});

module.exports = router;
