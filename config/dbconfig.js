const sql = require("mysql");

var config = {
  host: "localhost",
  user: "root",
  password: "123bebong",
  database: "voucherdb",
  insecureAuth: true,
};

const db = new sql.createConnection(config);

db.connect((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = db;
