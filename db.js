
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Limpiamos agresivamente cualquier variable que Render envíe
const cleanHost = (process.env.DB_HOST || '').replace(/[\r\n\s]/g, '');
const cleanUser = (process.env.DB_USER || '').replace(/[\r\n\s]/g, '');
const cleanPassword = (process.env.DB_PASSWORD || '').replace(/[\r\n\s]/g, '');
const cleanDatabase = (process.env.DB_NAME || '').replace(/[\r\n\s]/g, '');

const pool = mysql.createPool({
  host: cleanHost || 'mysql-kedulces-proyecto-kedulces.f.aivencloud.com',
  user: cleanUser,
  password: cleanPassword,
  database: cleanDatabase,
  port: Number(process.env.DB_PORT) || 11816,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;