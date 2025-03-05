// db.js
const mysql = require('mysql2');

// Create a connection pool
const db = mysql.createPool({
  host: 'localhost',        // Database host
  user: 'root',    // Your MySQL username
  password: 'manoj955',// Your MySQL password
  database: 'dreampath' // The database you want to connect to
});

// Check if the database is connected
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
  connection.release(); // Release the connection after checking
});

// Export the db pool to be used elsewhere
module.exports = db;
