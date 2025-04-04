require('dotenv').config();

const path = require('path');
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/analysis', analysisRoutes);

const port = process.env.PORT || 3000;
// const jwtSecret = process.env.JWT_SECRET;

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/', (req, res) => {
  console.log('API is running');
});

module.exports = app;
