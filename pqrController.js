
import express from 'express';
// CORRECCIÓN: Usamos import y agregamos la extensión .js explícitamente
import db from './db.js'; 
import { enviarCorreo } from './mailer.js';
const router = express.Router();

// Endpoint: POST /api/pqrs
router.post('/api/pqrs', async (req, res) => {
  const { pedidoId, tipo, motivo, descripcion } = req.body;

  if (!pedidoId || !tipo || !motivo || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    await db.query('START TRANSACTION');

// Disparar la alerta/notificación de correo automática (Actividad c)
    enviarCorreo({
      destino: correo || 'cliente@ejemplo.com',
      asunto: '🧁 Hemos recibido tu PQR - Ke\'Dulces',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #d63384; text-align: center;">¡PQR Recibida con Éxito!</h2>
          <p>Hola <strong>${nombre || 'Estimado cliente'}</strong>,</p>
          <p>Queremos confirmarte que hemos recibido tu solicitud registrada con la siguiente descripción:</p>
          <blockquote style="background-color: #f8f9fa; padding: 10px; border-left: 4px solid #d63384; italic;">
            "${descripcion}"
          </blockquote>
          <p>Nuestro equipo de Ke'Dulces la revisará a la brevedad posible.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Postres y Dulces Ke'Dulces - SAS</p>
        </div>
      `
    }).catch(err => console.error("Error al enviar alerta de correo PQR:", err));


    // Insertar en la tabla de PQRs
    const sqlInsertPQR = `
      INSERT INTO pqrs (pedido_id, tipo_solicitud, motivo, descripcion) 
      VALUES (?, ?, ?, ?)
    `;
    await db.query(sqlInsertPQR, [pedidoId, tipo, motivo, descripcion]);

    // Actualizar el estado del pedido a 'En proceso de devolución'
    const sqlUpdatePedido = `
      UPDATE pedidos 
      SET estado = 'En proceso de devolución' 
      WHERE id = ?
    `;
    await db.query(sqlUpdatePedido, [pedidoId]);

    await db.query('COMMIT');

    res.status(201).json({ 
      mensaje: 'PQR registrada con éxito y estado de pedido actualizado.',
      pedidoId: pedidoId
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error al procesar la PQR:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;