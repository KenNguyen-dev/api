var express = require("express");
var router = express.Router();
var db = require("../config/dbconfig");

getParameter = (req) => {
  return (parameters = [
    { name: "id", sqltype: "sql.NVarChar", value: req.body.id },
    { name: "ten", sqltype: "sql.NVarChar", value: req.body.ten },
    {
      name: "diem_tich_luy",
      sqltype: "sql.Int",
      value: req.body.diem_tich_luy,
    },
  ]);
};

const executeQuery = function (res, query, parameters) {
  db.connect().then(() => {
    parameters.forEach((p) => {
      db.request().input(p.name, p.sqltype, p.value);
    });
    db.request().query(query, function (err, result) {
      if (err) {
        console.log(err);
        res.send("Failed");
      } else {
        console.log(result.rowsAffected);
        if (result.rowsAffected != 0) {
          console.log("Row that are affected: " + result.rowsAffected);
          res.send("Success");
        } else {
          console.log("Row that are affected: " + result.rowsAffected);
          res.send("Failed");
        }
      }
    });
  });
};

router.post("/add", (req, res, next) => {
  var parameters = getParameter(req);
  var queryString = `INSERT INTO [khach_hang] VALUES ('${req.body.id}','${req.body.ten}','${req.body.diem_tich_luy}')`;
  executeQuery(res, queryString, parameters);
});

router.put("/update", (req, res, next) => {
  var parameters = getParameter(req);
  var queryString = `UPDATE [khach_hang] SET ten='${req.body.ten}',diem_tich_luy='${req.body.diem_tich_luy}' where id='${req.body.id}'`;
  executeQuery(res, queryString, parameters);
});

router.get("/voucher", (req, res, next) => {
  db.connect().then(() => {
    var queryString = `SELECT voucher_id FROM [khach_hang_voucher] WHERE khach_hang_id='${req.body.khach_hang_id}'`;
    db.request().query(queryString, (err, result) => {
      if (err) console.log(err);
      console.table(result.recordset);
      res.send(result.recordset);
    });
  });
});

module.exports = router;
