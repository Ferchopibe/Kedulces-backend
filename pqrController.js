
import express from 'express';
import db from './db.js'; 
import { enviarCorreo } from './mailer.js';

const router = express.Router();

// 1. ENDPOINT: GET /api/pqrs (Obtener todas las PQRs para el Panel Admin)
router.get('/', async (req, res) => {
  try {
    const [registros] = await db.query(`
      SELECT 
        id, 
        pedido_id AS pedidoId, 
        tipo_solicitud AS tipo, 
        motivo, 
        descripcion, 
        COALESCE(estado, 'Pendiente') AS estado,
        fecha_creacion AS fecha
      FROM pqrs 
      ORDER BY id DESC
    `);
    return res.json(registros);
  } catch (error) {
    console.error('Error al obtener PQRs:', error);
    return res.status(500).json({ error: 'Error al consultar las PQRs de la base de datos.' });
  }
});

// 2. ENDPOINT: PUT /api/pqrs/:id/estado (Actualizar estado de una PQR)
router.put('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['Pendiente', 'En Revisión', 'Resuelto'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    await db.query('UPDATE pqrs SET estado = ? WHERE id = ?', [estado, id]);
    return res.json({ mensaje: `PQR #${id} actualizada con éxito al estado: ${estado}` });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    return res.status(500).json({ error: 'Error interno al actualizar el estado.' });
  }
});

// 3. ENDPOINT: POST /api/pqrs (Registrar una nueva PQR desde el Frontend)
router.post('/', async (req, res) => {
  const { pedidoId, tipo, motivo, descripcion, correo, nombre } = req.body;

  if (!tipo || !motivo || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar diligenciados.' });
  }

  try {
    const idPedidoValido = pedidoId ? parseInt(pedidoId) : null;
    let radicadoId = 'N/A';

    // Insertar en la base de datos
    const sqlInsertPQR = `
      INSERT INTO pqrs (pedido_id, tipo_solicitud, motivo, descripcion) 
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const [resultado] = await db.query(sqlInsertPQR, [idPedidoValido, tipo, motivo, descripcion]);
      radicadoId = resultado.insertId;
    } catch (dbError) {
      console.warn("⚠️ Aviso BD (PQR guardada condicionalmente):", dbError.message);
    }

    // Actualizar estado del pedido (si existe)
    if (idPedidoValido) {
      const sqlUpdatePedido = `
        UPDATE pedidos 
        SET estado = 'En proceso de devolución' 
        WHERE id = ?
      `;
      await db.query(sqlUpdatePedido, [idPedidoValido]).catch(err => 
        console.warn("⚠️ No se pudo actualizar el pedido:", err.message)
      );
    }

    // Notificación por correo
    enviarCorreo({
      destino: correo || 'cliente@ejemplo.com',
      asunto: `🧁 Confirmación de PQR Radicado #${radicadoId} - Ke'Dulces`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #d63384; text-align: center;">¡PQR Recibida con Éxito!</h2>
          <p>Hola <strong>${nombre || 'Estimado cliente'}</strong>,</p>
          <p>Hemos recibido tu solicitud y se le asignó el siguiente número de seguimiento:</p>
          <ul>
            <li><strong>Radicado (#):</strong> ${radicadoId}</li>
            <li><strong>Pedido:</strong> #${pedidoId || 'N/A'}</li>
            <li><strong>Motivo:</strong> ${motivo}</li>
          </ul>
          <blockquote style="background-color: #f8f9fa; padding: 10px; border-left: 4px solid #d63384; font-style: italic;">
            "${descripcion}"
          </blockquote>
          <p>Nuestro equipo lo revisará a la brevedad posible.</p>
        </div>
      `
    }).catch(err => console.error("Aviso correo PQR:", err.message));

    return res.status(201).json({ 
      mensaje: 'PQR registrada con éxito.',
      radicado: radicadoId,
      pedidoId: pedidoId
    });

  } catch (error) {
    console.error('Error crítico al procesar la PQR:', error);
    return res.status(500).json({ error: 'Error interno en el servidor.' });
  }
});

export default router;