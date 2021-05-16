//const sql = require('mssql/msnodesqlv8')
const sql = require("mssql");
//msnodesqlv8 module is requiered for Windows Authentication without using Username and Password

var config = {
  user: "sa",
  password: "123",
  database: "voucherDB",
  server: "localhost",
  //driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    enableArithAort: true,
  },
};

const db = new sql.ConnectionPool(config);

module.exports = db;
