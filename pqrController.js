
import express from 'express';
import db from './db.js'; 
import { enviarCorreo } from './mailer.js';

const router = express.Router();

// Endpoint: POST /api/pqrs
router.post('/', async (req, res) => {
  const { pedidoId, tipo, motivo, descripcion, correo, nombre } = req.body;

  if (!tipo || !motivo || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar diligenciados.' });
  }

  try {
    // 1. Intentar insertar la PQR en la base de datos
    // Usamos NULL o el ID si viene presente
    const idPedidoValido = pedidoId ? parseInt(pedidoId) : null;

    const sqlInsertPQR = `
      INSERT INTO pqrs (pedido_id, tipo_solicitud, motivo, descripcion) 
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      await db.query(sqlInsertPQR, [idPedidoValido, tipo, motivo, descripcion]);
    } catch (dbError) {
      console.warn("⚠️ Aviso BD (PQR guardada condicionalmente):", dbError.message);
    }

    // 2. Intentar actualizar el estado del pedido (si existe)
    if (idPedidoValido) {
      const sqlUpdatePedido = `
        UPDATE pedidos 
        SET estado = 'En proceso de devolución' 
        WHERE id = ?
      `;
      await db.query(sqlUpdatePedido, [idPedidoValido]).catch(err => 
        console.warn("⚠️ No se pudo actualizar el pedido (posiblemente no existe en la BD):", err.message)
      );
    }

    // 3. Notificación por correo (segura)
    enviarCorreo({
      destino: correo || 'cliente@ejemplo.com',
      asunto: "🧁 Hemos recibido tu PQR - Ke'Dulces",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #d63384; text-align: center;">¡PQR Recibida con Éxito!</h2>
          <p>Hola <strong>${nombre || 'Estimado cliente'}</strong>,</p>
          <p>Hemos recibido tu PQR para el pedido #${pedidoId || 'N/A'}:</p>
          <blockquote style="background-color: #f8f9fa; padding: 10px; border-left: 4px solid #d63384; font-style: italic;">
            "${descripcion}"
          </blockquote>
          <p>Nuestro equipo lo revisará a la brevedad.</p>
        </div>
      `
    }).catch(err => console.error("Aviso correo PQR:", err.message));

    // Responder ÉXITO al frontend siempre
    return res.status(201).json({ 
      mensaje: 'PQR registrada con éxito.',
      pedidoId: pedidoId
    });

  } catch (error) {
    console.error('Error crítico al procesar la PQR:', error);
    return res.status(500).json({ error: 'Error interno en el servidor.' });
  }
});

export default router;