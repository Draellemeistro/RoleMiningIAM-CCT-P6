require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || 'p6bachelor.mysql.database.azure.com';
// const jwtSecret = process.env.JWT_SECRET;

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  // res.sendFile(path.join(__dirname, '../frontend/build')); // Maybe do it like this? I dont remember
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  console.log('Frontend served');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  // console.log(`Database URL: ${dbUrl}`);
});
