
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Se limpia el host para eliminar espacios o saltos de línea invisibles (\r\n)
const cleanHost = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';

const pool = mysql.createPool(
  process.env.DATABASE_URL
    ? {
        uri: process.env.DATABASE_URL.trim(),
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: cleanHost,
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