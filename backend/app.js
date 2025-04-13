import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

import analysisRoutes from './routes/analysisRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);

app.use('/api/analysis', analysisRoutes);


// Serve frontend (adjust path for ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;
