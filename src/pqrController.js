
import nodemailer from 'nodemailer';
import db from '../db.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const obtenerPqrs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pqrs ORDER BY id_pqr DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener las PQRS:', error);
    res.status(500).json({ error: 'Error interno al consultar la base de datos' });
  }
};

export const crearPqr = async (req, res) => {
  try {
    const { id_pedido, pedidoId, nombre, correo, tipo_solicitud, motivo, descripcion } = req.body;
    const pedidoFinal = id_pedido || pedidoId || 1;

    if (!nombre || !correo || !motivo) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados' });
    }

    const detalleMotivo = descripcion ? `${motivo} - Detalle: ${descripcion}` : motivo;

    const query = `
      INSERT INTO pqrs (id_pedido, nombre, correo, tipo_solicitud, motivo, fecha_creacion)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const [resultado] = await db.query(query, [
      pedidoFinal,
      nombre,
      correo,
      tipo_solicitud || 'Devolución',
      detalleMotivo
    ]);

    const idPqrGenerado = resultado.insertId;
    const radicado = `#PQR-${idPqrGenerado}`;

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
              <p><strong>Detalle:</strong> ${detalleMotivo}</p>
              <br>
              <p>Atentamente,<br><strong>Equipo de Postres y Dulces Ke'Dulces</strong></p>
            </div>
          `
        });
        console.log('Correo enviado con éxito');
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