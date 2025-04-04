require('dotenv').config();

const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || 'p6bachelor.mysql.database.azure.com';
// const jwtSecret = process.env.JWT_SECRET;

app.get('/', (req, res) => {
  res.send('Hello World! from backend');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Database URL: ${dbUrl}`);
});
