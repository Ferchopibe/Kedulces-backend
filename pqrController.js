
import nodemailer from 'nodemailer';

// Configuración de Nodemailer usando variables de entorno de Render
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. OBTENER PQRS (GET)
export const obtenerPqrs = async (req, res) => {
  try {
    const { default: db } = await import('../db.js');
    const [rows] = await db.query('SELECT * FROM pqrs ORDER BY id_pqr DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener las PQRS:', error);
    res.status(500).json({ error: 'Error interno al consultar la base de datos' });
  }
};

// 2. CREAR PQR (POST)
export const crearPqr = async (req, res) => {
  try {
    const { default: db } = await import('../db.js');
    const { id_pedido, pedidoId, nombre, correo, tipo_solicitud, motivo, descripcion } = req.body;
    const pedidoFinal = id_pedido || pedidoId || 1;

    if (!nombre || !correo || !motivo || !descripcion) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados' });
    }

    const query = `
      INSERT INTO pqrs (id_pedido, nombre, correo, tipo_solicitud, motivo, fecha_creacion)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const [resultado] = await db.query(query, [
      pedidoFinal,
      nombre,
      correo,
      tipo_solicitud || 'Devolución',
      motivo
    ]);

    const idPqrGenerado = resultado.insertId;
    const radicado = `#PQR-${idPqrGenerado}`;

    // Envío del correo electrónico de notificación
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: correo,
          subject: `Confirmación de Solicitud PQR ${radicado} - Ke'Dulces`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #d946ef;">¡Hola, ${nombre}!</h2>
              <p>Hemos recibido tu solicitud de PQR con éxito.</p>
              <p><strong>Número de Radicado:</strong> ${radicado}</p>
              <p><strong>Motivo:</strong> ${motivo}</p>
              <p><strong>Detalle:</strong> ${descripcion}</p>
              <br>
              <p>Atentamente,<br><strong>Equipo de Postres y Dulces Ke'Dulces</strong></p>
            </div>
          `
        });
        console.log('Correo enviado exitosamente');
      }
    } catch (mailError) {
      console.error('Error enviando e-mail Nodemailer:', mailError);
    }

    res.status(201).json({
      mensaje: 'PQR registrada exitosamente',
      radicado: radicado,
      idPqr: idPqrGenerado
    });

  } catch (error) {
    console.error('Error al procesar PQR en MySQL:', error);
    res.status(500).json({ error: 'Error interno al procesar la PQR' });
  }
};

export default {
  obtenerPqrs,
  crearPqr
};