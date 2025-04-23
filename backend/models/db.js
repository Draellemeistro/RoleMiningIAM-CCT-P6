import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createDB = async () => {
  const sslPath = path.join(__dirname, '..', 'ssl', 'DigiCertGlobalRootCA.crt.pem');
  const connection = await mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
      ca: fs.readFileSync(sslPath),
    }
  });

  console.log('✅ Connected to DB with async/await (promise-based)');

  return {
    query: (...args) => connection.query(...args),
    end: () => connection.end()
  };
};

export default await createDB();
