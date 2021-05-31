var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
const firebase = require("../config/firebase");
// var jwt = require("jsonwebtoken");
var multer = require("multer");
const { memoryStorage } = require("multer");
path = require("path");
const DIR = "./public/images";

// let storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, DIR);
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + file.originalname + path.extname(file.originalname)
//     );
//   },
// });

let upload = multer({ storage: memoryStorage() });

// var authenticateJWT = (req) => {
//     var checkAuth = false;
//     const authHeader = req.headers.authorization;
//     console.log(authHeader)
//     if (authHeader) {
//         const token = authHeader.split(' ')[1];
//         jwt.verify(token, process.env.SECRET.toString(), (err, user) => {
//             if (err!=null) {
//                 console.log(err)
//                 // return res.sendStatus(403);
//                 //return false;
//             }else{
//                checkAuth=true;
//             }
//         });
//     }
//     return checkAuth
// };

router.post("/list", (req, res, next) => {
  var queryString = `select * from voucher where doi_tac_id = '${req.body.id}'`;
  db.query(queryString, (err, result) => {
    if (err) console.log(err);
    console.table(result);
    res.send(result);
  });
});

router.get("/cardlist", (req, res, next) => {
  var queryString = `select chu_thich_don_gian,ngay_ket_thuc,hinh_anh,id from voucher where voucher.trang_thai="P" AND voucher.ngay_ket_thuc > current_date()`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.table(result);
    res.send(result);
  });
});

router.get("/voucherdetail", (req, res, next) => {
  console.log(req.query.id);
  var queryString = `select hinh_anh,chu_thich_day_du,code_voucher,ten,gia_tri,diem_toi_thieu from voucher where id='${req.query.id}'`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    res.send(result[0]);
  });
});

router.put("/applied", (req, res, next) => {
  var queryString = `UPDATE khach_hang_voucher SET da_dung='1' WHERE voucher_id='${req.body.voucher_id}' AND khach_hang_id='${req.body.khach_hang_id}' AND (SELECT trang_thai FROM voucher WHERE id='${req.body.voucher_id}')='P'`;
  db.query(queryString, (err, result) => {
    if (err) res.status(404).send(err);
    res.status(200).send("Success");
  });
});

router.post("/publish", (req, res, next) => {
  var queryString = `UPDATE voucher SET trang_thai='P' where doi_tac_id='${req.body.doi_tac_id}' and id='${req.body.id}'`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.log(result.affectedRows);
    if (result.affectedRows != 0) {
      res.status(200).send("Success");
    }
  });
});

router.post("/unpublish", (req, res, next) => {
  var queryString = `UPDATE voucher SET trang_thai='UP' where doi_tac_id='${req.body.doi_tac_id}' and id='${req.body.id}'`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.log(result.affectedRows);
    if (result.affectedRows != 0) {
      res.status(200).send("Success");
    }
  });
});

router.post("/getvoucher", (req, res, next) => {
  console.log(req.body.khach_hang_id);
  console.log(req.body.voucher_id);
  var queryString = `CALL nhanVoucher('${req.body.khach_hang_id}','${req.body.voucher_id}')`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.log(result);
    if (result.affectedRows != 0) {
      res.status(200).send("Success");
    } else {
      res.status(401).send("Not Enough");
    }
  });
});

router.get("/customer", (req, res, next) => {
  var queryString = `select khach_hang_id,da_dung from khach_hang_voucher where voucher_id='${req.query.voucher_id}'`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.table(result);
    res.status(200).send(result);
  });
});

router.post("/add", upload.single("hinh_anh"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No image file");
  }

  var file = req.file;
  console.log("This is image file ");
  console.log(file);
  var data = JSON.parse(req.body.data);

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
      console.log(err);
    });

    blobWriter.end(req.file.buffer);
    var queryString = `CALL themVoucher('${data.doi_tac_id}-${data.code_voucher}',
                                '${data.ten}',
                                '${data.chu_thich_don_gian}',
                                '${data.chu_thich_day_du}',
                                '${data.ngay_bat_dau}',
                                '${data.ngay_ket_thuc}',
                                '${data.code_voucher}',
                                '${data.gia_tri}',
                                '${data.loai_voucher_id}',
                                '${data.so_luong}',
                                '${data.trang_thai}',
                                'https://firebasestorage.googleapis.com/v0/b/vouchermanager-9cf2e.appspot.com/o/${file.originalname}?alt=media',
                                '${data.doi_tac_id}',
                                '${data.diem_toi_thieu}',
                                '${data.dich_vu_id}')`;
    db.query(queryString, (err) => {
      if (err) {
        console.log(err);
        res.send("Add failed. Please check your ID again");
      } else {
        res.send("Success");
      }
    });
  } else {
    res.send("Failed");
  }
});

router.get("/details", (req, res, next) => {
  var queryString = `select * from voucher where id='${req.query.id}'`;
  db.query(queryString, (err, result) => {
    if (err) console.log(err);
    console.table(result);
    res.send(result);
  });
});

router.delete("/delete", (req, res, next) => {
  console.log(req.body.id);
  console.log(req.body.doi_tac_id);
  var queryString = `CALL xoaVoucher('${req.body.id}','${req.body.doi_tac_id}')`;
  db.query(queryString, (err, result) => {
    if (err) res.send(err);
    console.log(result.affectedRows);
    if (result.affectedRows <= 0) {
      res.status(401).send("Delete Fail");
    } else res.send("Delete success");
  });
});

router.put("/update", (req, res, next) => {
  var queryString = `UPDATE voucher SET
                      id='${req.body.doi_tac_id}-${req.body.code_voucher}',
                      ten='${req.body.ten}',
                      chu_thich_don_gian='${req.body.chu_thich_don_gian}',
                      chu_thich_day_du=${req.body.chu_thich_day_du},
                      ngay_bat_dau=${req.body.ngay_bat_dau},
                      ngay_ket_thuc=${req.body.ngay_ket_thuc},
                      code_voucher=${req.body.code_voucher},
                      gia_tri=${req.body.gia_tri},
                      loai_voucher_id=${req.body.loai_voucher_id},
                      so_luong=${req.body.so_luong},
                      trang_thai=${req.body.trang_thai},
                      hinh_anh=${req.body.hinh_anh},
                      diem_toi_thieu=${req.body.diem_toi_thieu},
                      dich_vu_id=${req.body.dich_vu_id}                                         
                  WHERE id='${req.body.id}'`;
  db.query(queryString, (err) => {
    if (err) res.send(err);
    res.send("Update success");
  });
});

module.exports = router;
