var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");

router.get("/list", (req, res, next) => {
  var queryString = "select * from khach_hang";
  db.query(queryString, (err, result) => {
    if (err) res.status(400).send(err);
    console.table(result);
    res.status(200).send(result);
  });
});

router.post("/add", (req, res, next) => {
  var queryString = `INSERT INTO khach_hang VALUES ('${req.body.id}','${req.body.ten}','${req.body.diem_tich_luy}')`;
  db.query(queryString, (err) => {
    if (err) {
      console.log(err);
      res.send("Add failed. Please check your ID again");
    } else {
      res.send("Add Successfully");
    }
  });
});

router.put("/update", (req, res, next) => {
  var queryString = `UPDATE khach_hang SET ten='${req.body.ten}',diem_tich_luy='${req.body.diem_tich_luy}' where id='${req.body.id}'`;
  db.query(queryString, (err) => {
    if (err) res.send(err);
    res.send("Update success");
  });
});

router.get("/voucher", (req, res, next) => {
  var queryString = `SELECT voucher_id,da_dung FROM khach_hang_voucher WHERE khach_hang_id='${req.query.khach_hang_id}' AND (SELECT trang_thai FROM voucher WHERE id=voucher_id)='P'`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.table(result);
    res.send(result);
  });
});

router.post("/SPvoucher", (req, res, next) => {
  var queryString = `SELECT * FROM voucher where doi_tac_id='${req.body.doi_tac_id}' AND dich_vu_id ='${req.body.dich_vu_id}' AND (SELECT khach_hang_id from khach_hang_voucher where voucher_id=voucher.id)='${req.body.khach_hang_id}';`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.table(result);
    res.status(200).send(result);
  });
});

module.exports = router;
