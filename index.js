
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pqrController from './pqrController.js'; // 👈 Importación directa desde la raíz de src/

const app = express();
const PORT = process.env.PORT || 4000;

// ==========================================
// CONFIGURACIÓN DE CORS Y MIDDLEWARES
// ==========================================
const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ==========================================
// CATÁLOGO DE PRODUCTOS (KE'DULCES)
// ==========================================
const productos = [
  { id: 1, nombre: 'Postre Tres Leches', precio: 12000, categoria: 'Postres' },
  { id: 2, nombre: 'Cheesecake de Maracuyá', precio: 14000, categoria: 'Postres' },
  { id: 3, nombre: 'Torta de Chocolate', precio: 15000, categoria: 'Tortas' },
  { id: 4, nombre: 'Postre de Limón', precio: 11000, categoria: 'Postres' }
];

const obtenerProductos = (req, res) => {
  console.log('📦 [PRODUCTOS] Enviando catálogo de postres...');
  res.status(200).json(productos);
};

app.get('/api/productos', obtenerProductos);
app.get('/productos', obtenerProductos);

// ==========================================
// RUTAS CONECTADAS A MYSQL (PQR)
// ==========================================
const router = express.Router();
router.get('/', pqrController.obtenerPqrs);
router.post('/', pqrController.crearPqr);

app.use('/api/pqrs', router);
app.use('/pqrs', router);

// ==========================================
// ARRANQUE DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Backend Ke'Dulces corriendo en puerto ${PORT}`);
});
