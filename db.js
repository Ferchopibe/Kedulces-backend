
import mysql from 'mysql2/promise';

// Se asigna directamente la URL limpia para evitar la lectura de variables con \r de Render
const pool = mysql.createPool({
  host: 'mysql-kedulces-proyecto-kedulces.f.aivencloud.com',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 11816,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;