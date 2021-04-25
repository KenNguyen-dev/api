const sql = require('mssql/msnodesqlv8')
//msnodesqlv8 module is requiered for Windows Authentication without using Username and Password

var config = {
    database: 'voucherDB',
    server: 'localhost',
    driver: 'msnodesqlv8',
    options: {
      trustedConnection: true
    }
}

const db = new sql.ConnectionPool(config)

module.exports = db;