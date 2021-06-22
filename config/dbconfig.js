const sql = require("mysql");

var config = {
  connectionLimit: 20,
  host: "us-cdbr-east-03.cleardb.com",
  user: "bfaa9fc6657f84",
  password: "931583b3",
  database: "heroku_72fcec997c0e882",
  insecureAuth: true,
  typeCast: function castField(field, useDefaultTypeCasting) {
    if (field.type === "BIT" && field.length === 1) {
      var bytes = field.buffer();
      return bytes[0] === 1;
    }
    return useDefaultTypeCasting();
  },
};

// var config = {
//   host: "localhost",
//   user: "root",
//   password: "123bebong",
//   database: "voucherdb",
//   insecureAuth: true,
// };

const db = new sql.createPool(config);

db.getConnection((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = db;
