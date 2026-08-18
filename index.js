
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 4000;

// ==========================================
// CONFIGURACIÓN DE CORS (UNIFICADA Y COMPLETA)
// ==========================================
const corsOptions = {
  origin: '*', // Permite solicitudes desde cualquier dominio (Netlify, Celular, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware adicional para garantizar la respuesta correcta a peticiones PREFLIGHT (OPTIONS)
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
// CONFIGURACIÓN DE NODEMAILER (CORREO)
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'luisfernandopibe51@gmail.com',
    pass: 'frwjgnufmxmdoryq'
  }
});

// Arreglo temporal de clientes en memoria
let clientes = [
  {
    id: 1,
    nombre: "Cliente de Prueba",
    correo: "prueba@correo.com",
    telefono: "3001234567",
    descripcion_caso: "Consulta inicial de prueba",
    estado: "Nuevo",
    fecha_registro: new Date(),
    honorarios: 500000,
    abonos: 100000,
    saldo: 400000
  }
];

// ==========================================
// RUTAS DE LA API (/api/clientes)
// ==========================================

// 1. Obtener todos los clientes (GET)
app.get('/api/clientes', (req, res) => {
  console.log('📥 Petición GET recibida: Enviando lista de clientes...');
  res.status(200).json(clientes);
});

// 2. Registrar/Crear un cliente (POST)
app.post('/api/clientes', async (req, res) => {
  console.log('📤 Petición POST recibida: Registrando cliente...');
  try {
    const data = req.body || {};
    const h = parseFloat(data.honorarios) || 0;
    const a = parseFloat(data.abonos) || 0;

    const nuevoCliente = {
      id: clientes.length ? clientes[clientes.length - 1].id + 1 : 1,
      nombre: data.nombre || 'Sin Nombre',
      correo: data.correo || '',
      telefono: data.telefono || '',
      descripcion_caso: data.descripcion_caso || '',
      estado: 'Nuevo',
      fecha_registro: new Date(),
      honorarios: h,
      abonos: a,
      saldo: h - a
    };

    clientes.push(nuevoCliente);

    // Envío automático de correo de confirmación
    if (nuevoCliente.correo) {
      try {
        await transporter.sendMail({
          from: '"Bufete Jurídico Cardozo" <luisfernandopibe51@gmail.com>',
          to: nuevoCliente.correo,
          subject: 'Confirmación de Consulta - Bufete Jurídico Cardozo',
          html: `
            <h2>Estimado/a ${nuevoCliente.nombre},</h2>
            <p>Hemos recibido su consulta legal en nuestro sistema exitosamente.</p>
            <p><strong>Detalles recibidos:</strong></p>
            <ul>
              <li><strong>Teléfono:</strong> ${nuevoCliente.telefono}</li>
              <li><strong>Mensaje:</strong> ${nuevoCliente.descripcion_caso}</li>
            </ul>
            <p>Un miembro de nuestro Bufete Jurídico se pondrá en contacto con usted a la brevedad.</p>
            <br>
            <p>Atentamente,<br><strong>Miguel Angel Cardozo Cisneros | Bufete Jurídico</strong></p>
          `
        });
        console.log(`✉️ Correo de confirmación enviado con éxito a: ${nuevoCliente.correo}`);
      } catch (mailError) {
        console.warn('⚠️ No se pudo enviar el correo:', mailError.message);
      }
    }

    res.status(201).json({
      mensaje: 'Cliente registrado con éxito',
      cliente: nuevoCliente
    });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ error: 'Error interno al registrar cliente' });
  }
});

// 3. Actualizar estado del cliente (POST)
app.post('/api/clientes/actualizar-estado', (req, res) => {
  try {
    const { id, nuevoEstado } = req.body || {};
    const cliente = clientes.find(c => c.id === parseInt(id));

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    cliente.estado = nuevoEstado;
    res.status(200).json({ mensaje: 'Estado actualizado con éxito', cliente });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno al actualizar estado' });
  }
});

// 4. Actualizar datos completos del cliente (PUT)
app.put('/api/clientes/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = clientes.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const data = req.body || {};
    const h = parseFloat(data.honorarios) || 0;
    const a = parseFloat(data.abonos) || 0;

    clientes[index] = {
      ...clientes[index],
      nombre: data.nombre ?? clientes[index].nombre,
      correo: data.correo ?? clientes[index].correo,
      telefono: data.telefono ?? clientes[index].telefono,
      descripcion_caso: data.descripcion_caso ?? clientes[index].descripcion_caso,
      honorarios: h,
      abonos: a,
      saldo: h - a
    };

    res.status(200).json({ mensaje: 'Cliente actualizado correctamente', cliente: clientes[index] });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno al actualizar cliente' });
  }
});

// 5. Eliminar un cliente (DELETE)
app.delete('/api/clientes/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const clienteExiste = clientes.some(c => c.id === id);

    if (!clienteExiste) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    clientes = clientes.filter(c => c.id !== id);
    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error interno al eliminar cliente' });
  }
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
});