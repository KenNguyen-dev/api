var db = require("./config/dbconfig");

function autoPublish() {
  var queryString = `UPDATE voucher SET trang_thai='P' where voucher.ngay_bat_dau<=current_date() AND voucher.ngay_ket_thuc>=current_date()`;
  db.query(queryString, (err) => {
    if (err) console.log(err);
    console.log("Success update");
  });
}

autoPublish();
