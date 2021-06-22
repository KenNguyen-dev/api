var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");
var jwt = require("jsonwebtoken");

var authenticateJWT = (req) => {
  var checkAuth = false;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET.toString(), (err) => {
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

router.get("/list", (req, res, next) => {
  var queryString = "select * from doi_tac";
  db.query(queryString, (err, result) => {
    if (err) console.log(err);
    console.table(result);
    res.send(result);
  });
});

router.post("/register", (req, res, next) => {
  var query = `INSERT INTO doi_tac (id,ten_doanh_nghiep,ten_viet_tat,sdt,email,nguoi_dai_dien,mat_khau) 
              VALUES ('${req.body.ten_viet_tat}-GIFTVOUCHER',
                      '${req.body.ten_doanh_nghiep}',
                      '${req.body.ten_viet_tat}',
                      '${req.body.sdt}',
                      '${req.body.email}',
                      '${req.body.nguoi_dai_dien}',
                      '${req.body.mat_khau}')`;
  db.query(query, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send("Success");
    }
  });
});

router.post("/login", (req, res, next) => {
  console.log(req.body.email);
  console.log(req.body.mat_khau);
  var query = `Select id from doi_tac where email='${req.body.email}' AND mat_khau='${req.body.mat_khau}'`;
  db.query(query, function (err, result) {
    if (err) {
      console.log(err);
      res.send("Server Failed");
    } else if (result[0] == null) {
      res.send("Failed");
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
        });
      } else {
        res.send("Failed");
      }
      // res.send(result[0]);
    }
  });
});

router.post("/logout", (req, res, next) => {
  var checkAuthenticate = authenticateJWT(req);
  if (checkAuthenticate) {
    res.json({
      Token: "",
      id: "",
    });
  }
});

router.get("/details", (req, res, next) => {
  var queryString = `select * from doi_tac where id='${req.body.id}'`;
  console.log(queryString);
  db.query(queryString, (err, result) => {
    if (err) console.log(err);
    console.table(result.recordset[0]);
    res.send(result.recordset[0]);
  });
});

router.delete("/delete", (req, res, next) => {
  // db.connect().then(() => {
  //     var queryString = `DELETE FROM [loai_voucher] where id='${req.body.id}'`
  //     db.request().query(queryString, (err) => {
  //       if(err) console.log(err)
  //         res.send("Delete success")
  //     })
  // })
  // var parameters = getParameter(req);
  // console.log("This is request body: " + req.body.id);
  // var queryString = `DELETE FROM [doi_tac] where id='${req.body.id}'`;
  // executeQuery(res, queryString, parameters);
});

router.put("/update", (req, res, next) => {
  var checkAuthenticate = authenticateJWT(req);
  if (checkAuthenticate) {
    var query = `UPDATE doi_tac SET 
    ten_doanh_nghiep='${req.body.ten_doanh_nghiep}',
    sdt=${req.body.sdt},
    nguoi_dai_dien=${req.body.nguoi_dai_dien},
    mat_khau=${req.body.mat_khau}                                           
WHERE id='${req.body.id}'`;

    db.query(query, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.status(200).send("Success");
      }
    });
  } else {
    res.status(400).send("Failed");
  }
});

module.exports = router;
