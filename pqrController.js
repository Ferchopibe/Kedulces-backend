
import nodemailer from 'nodemailer';
import db from '../db.js'; // Conexión a db.js ubicado en src/db.js

// Configuración del transporte Nodemailer usando las variables de Render
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. OBTENER TODAS LAS PQRS (GET)
export const obtenerPqrs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pqrs ORDER BY id_pqr DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener las PQRS:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
};

// 2. CREAR PQR Y ENVIAR NOTIFICACIÓN POR CORREO (POST)
export const crearPqr = async (req, res) => {
  try {
    const { id_pedido, pedidoId, nombre, correo, tipo_solicitud, motivo, descripcion } = req.body;
    const pedidoFinal = id_pedido || pedidoId || 1;

    if (!nombre || !correo || !motivo || !descripcion) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados' });
    }

    // Inserción en la base de datos MySQL en Aiven
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

    // Envío de correo electrónico de notificación vía Gmail/Nodemailer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: `Confirmación de Solicitud PQR ${radicado} - Ke'Dulces`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #d946ef;">¡Hola, ${nombre}!</h2>
          <p>Hemos recibido tu solicitud de PQR con éxito.</p>
          <p><strong>Número de Radicado:</strong> ${radicado}</p>
          <p><strong>Motivo:</strong> ${motivo}</p>
          <p><strong>Detalle de la solicitud:</strong> ${descripcion}</p>
          <br>
          <p>Nos pondremos en contacto contigo a la brevedad posible.</p>
          <p>Atentamente,<br><strong>Equipo de Postres y Dulces Ke'Dulces</strong></p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('Error al enviar el correo con Nodemailer:', mailErr);
      } else {
        console.log('Correo enviado exitosamente:', info.response);
      }
    });

    res.status(201).json({
      mensaje: 'PQR registrada exitosamente',
      radicado: radicado,
      idPqr: idPqrGenerado
    });

  } catch (error) {
    console.error('Error al guardar la PQR:', error);
    res.status(500).json({ error: 'Error interno al procesar la PQR' });
  }
};

export default {
  obtenerPqrs,
  crearPqr
};