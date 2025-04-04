const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

const connection = mysql.createConnection({
  host: process.env.DB_URL || 'p6bachelor.mysql.database.azure.com',
  user: 'p6bachelor' || 'user', //TODO: Change to correct user
  password: process.env.DB_PASSWORD || 'password', //TODO: Change to correct password
  database: 'p6bachelor' || 'database', //TODO: Change to correct database
  port: process.env.DB_PORT || 3306,
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

module.exports = {
  connection,
};
