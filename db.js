
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Sanitizamos de forma agresiva cualquier posible salto de línea o espacio
const cleanHost = (process.env.DB_HOST || '').replace(/[\r\n\s]/g, '');
const cleanUrl = (process.env.DATABASE_URL || '').replace(/[\r\n\s]/g, '');

const pool = mysql.createPool(
  cleanUrl
    ? {
        uri: cleanUrl,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: cleanHost || 'mysql-kedulces-proyecto-kedulces.f.aivencloud.com',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 11816,
        ssl: {
          rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      }
);

export default pool;