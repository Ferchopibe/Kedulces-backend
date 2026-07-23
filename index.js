
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js'; 
import pqrRouter from './pqrController.js'; 
import authRoutes from './routes/authRoutes.js'; 
import verificarToken from './middlewares/authMiddleware.js'; 
import './chatbot.js'; 
import { enviarCorreo } from './mailer.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// 1. Configurar CORS explícito para Vercel y desarrollo local
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://kedulces-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permite conexiones si cambia el dominio de despliegue
    }
  },
  credentials: true
}));

app.use(express.json());

// 2. Rutas de Autenticación
app.use('/api/auth', authRoutes);

// 3. Rutas de PQRs (PÚBLICAS para que el formulario funcione desde Vercel)
app.use('/api/pqrs', pqrRouter); 

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: "¡Bienvenido al servidor de Postres y Dulces Ke'Dulces!",
    estado: "Servidor en línea",
    zona_horaria: process.env.TZ 
  });
});

// Ruta Pública: Catálogo de productos
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE disponible = 1');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener los productos:', error.message);
    res.status(500).json({ 
      error: 'Error interno del servidor', 
      detalle: 'No se pudo cargar el catálogo de postres en este momento.' 
    });
  }
});

// Verificación de Base de Datos
async function verificarConexionBD() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    console.log('✅ Conexión exitosa a la base de datos de Ke\'Dulces.');
  } catch (error) {
    console.error('❌ Error crítico al conectar a la base de datos:', error.message);
    process.exit(1); 
  }
}

// Endpoint de prueba de Correo
app.post('/api/test-email', async (req, res) => {
  const { email } = req.body;
  try {
    const resultado = await enviarCorreo({
      destino: email || 'cliente@ejemplo.com',
      asunto: '🧁 ¡Bienvenido a Ke\'Dulces! Confirmación de prueba',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d63384;">¡Gracias por contactar a Ke'Dulces!</h2>
          <p>Este es un correo de confirmación generado automáticamente por nuestro servidor Node.js.</p>
        </div>
      `
    });
    res.json({ mensaje: 'Prueba de correo procesada correctamente', resultado });
  } catch (error) {
    res.status(500).json({ error: 'Fallo al procesar el envío de correo' });
  }
});

// Encender Servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor de Ke'Dulces corriendo en el puerto http://localhost:${PORT}`);
  await verificarConexionBD();
});