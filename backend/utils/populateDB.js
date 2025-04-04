const mysql = require('mysql');
const connection = require('db.js');

function genMockData() {
  return 'TBD';
}

async function populateUsersTable() {
  for (let i = 0; i < 100; i++) {
    const UserId = '';
    const FullName = '';
    const Email = '';
    const DepartmentId = '';
    const HireDate = '';

    console.log(UserId, FullName, Email, DepartmentId, HireDate);

    const sql = 'INSERT INTO users (UserId, FullName, Email, DepartmentId, HireDate) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [UserId, FullName, Email, DepartmentId, HireDate], (err, result) => {
      if (err) throw err;
      console.log('Inserted data into the users table.');
    });
  }
}
