
import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrarBD() {
  console.log('🚀 Conectando a Railway para migrar la base de datos...');
  
  const connectionUrl = process.env.DATABASE_URL || 'mysql://root:npdbYRXfJTaVtezYECgtAGJDTscFpsLk@reseau.proxy.rlwy.net:17643/railway';

  try {
    const connection = await mysql.createConnection({
      uri: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });
    console.log('✅ Conexión establecida con MySQL Cloud en Railway!');

    let sqlScript = fs.readFileSync('./catalogo_postres.sql', 'utf8');

    // Remover comandos 'CREATE DATABASE' o 'USE' que fuerzan el nombre local 'Kedulces'
    sqlScript = sqlScript.replace(/CREATE DATABASE.*?;/gi, '');
    sqlScript = sqlScript.replace(/USE `?Kedulces`?;/gi, '');

    const queries = sqlScript
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    for (const query of queries) {
      await connection.query(query);
    }

    console.log('🎉 ¡Tablas y datos de Ke\'Dulces migrados exitosamente a la Nube!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
  }
}

migrarBD();