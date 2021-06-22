var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var jwt = require("jsonwebtoken");

function generateid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.get("/list", (req, res, next) => {
  var queryString = "select * from khach_hang";
  db.query(queryString, (err, result) => {
    if (err) res.status(400).send(err);
    console.table(result);
    res.status(200).send(result);
  });
});

var authenticateJWT = (req) => {
  var checkAuth = false;
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET.toString(), (err, user) => {
      if (err != null) {
        console.log(err);
        // return res.sendStatus(403);
        //return false;
      } else {
        checkAuth = true;
      }
    });
  }
  return checkAuth;
};

router.post("/register", (req, res, next) => {
  var query = `INSERT INTO khach_hang VALUES 
                      ('${generateid(10)}','${req.body.ten}','0',
                      '${req.body.sdt}','${req.body.email}',
                      '${req.body.mat_khau}')`;
  db.query(query, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send("Success");
    }
  });
});

router.get("/detail", (req, res, next) => {
  var query = `Select * from khach_hang where id='${req.query.id}'`;
  db.query(query, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(result[0]);
    }
  });
});

router.post("/login", (req, res, next) => {
  console.log(req.body.email);
  console.log(req.body.mat_khau);
  var query = `Select id,ten from khach_hang where email='${req.body.email}' AND mat_khau='${req.body.mat_khau}'`;
  db.query(query, function (err, result) {
    if (err) {
      console.log(err);
      res.send("Server Failed");
    } else if (result[0] == null) {
      res.status(400).send("Failed");
    } else {
      if (result[0].id != null) {
        console.log(process.env.SECRET.toString());
        const accessToken = jwt.sign(
          { email: req.body.email },
          process.env.SECRET.toString(),
          { expiresIn: "20m" }
        );
        res.status(200).json({
          Token: accessToken,
          id: result[0].id,
          ten: result[0].ten,
        });
      } else {
        res.send("Failed");
      }
      // res.send(result[0]);
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

router.put("/updatepoint", (req, res, next) => {
  var queryString = `UPDATE khach_hang SET diem_tich_luy=diem_tich_luy+'${req.body.diem_tich_luy}' where id='${req.body.khach_hang_id}'`;
  db.query(queryString, (err) => {
    if (err) res.send(err);
    res.send("Update success");
  });
});

router.get("/voucher", (req, res, next) => {
  var queryString = `SELECT voucher.ten,voucher.ngay_ket_thuc,voucher.code_voucher,voucher.gia_tri,voucher.dich_vu_id,khach_hang_voucher.da_dung from voucher INNER JOIN khach_hang_voucher ON voucher.id=voucher_id where khach_hang_id='${req.query.id}' AND (SELECT trang_thai FROM voucher WHERE id=voucher_id)='P'`;
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
