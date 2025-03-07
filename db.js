const mysql = require('mysql2');
const dotenv = require('dotenv')
dotenv.config();

// Create a connection pool
const db = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT,
  connectionLimit: 50,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the clver cloud database');
  connection.release(); // Release the connection after checking
});
// Export the db pool to be used elsewhere
module.exports = db.promise();
