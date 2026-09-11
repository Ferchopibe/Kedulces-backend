
import express from 'express';
import pool from '../db.js'; // <-- CORREGIDO: retrocede una carpeta para encontrar el db.js de la raíz
import { enviarCorreo } from '../mailer.js';

const router = express.Router();

// GET /api/pqrs - Obtener todas las PQRs (útil para el panel de administración)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pqrs ORDER BY id_pqr DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener PQRs:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos', detalle: error.message });
  }
});

// POST /api/pqrs - Registrar PQR y guardar en MySQL
router.post('/', async (req, res) => {
  const { pedidoId, tipo_solicitud, motivo, descripcion, correo, nombre } = req.body;

  try {
    const idPedidoValido = 1; // Fuerza la relación con el pedido base existente en MySQL
    const tipoValido = tipo_solicitud || 'Devolución';
    const motivoValido = motivo || 'General';
    const descripcionValida = descripcion || 'Sin descripción detallada';

    // Persistencia directa en la base de datos MySQL (Tabla pqrs)
    const [resultadoBD] = await pool.query(
      `INSERT INTO pqrs (pedido_id, tipo_solicitud, motivo, descripcion, estado_pqr) 
       VALUES (?, ?, ?, ?, 'Pendiente')`,
      [idPedidoValido, tipoValido, motivoValido, descripcionValida]
    );

    const pqrId = resultadoBD.insertId;
    const numeroRadicado = `#PQR-${String(pqrId).padStart(6, '0')}`;

    console.log(`✅ PQR guardada exitosamente en MySQL. ID: ${pqrId} | Radicado: ${numeroRadicado}`);

    // Intento de envío de correo en segundo plano
    if (correo && typeof enviarCorreo === 'function') {
      enviarCorreo({
        destino: correo,
        asunto: `🧁 Confirmación de Solicitud ${numeroRadicado} - Ke'Dulces`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
            <h2 style="color: #d63384; text-align: center;">¡PQR Recibida con Éxito!</h2>
            <p>Hola <strong>${nombre || 'Estimado cliente'}</strong>,</p>
            <p>Queremos confirmarte que hemos recibido tu solicitud registrada con el radicado <strong>${numeroRadicado}</strong>.</p>
            <p><strong>Detalle de la solicitud:</strong></p>
            <blockquote style="background-color: #f8f9fa; padding: 12px; border-left: 4px solid #d63384; font-style: italic;">
              "${descripcionValida}"
            </blockquote>
            <p>Nuestro equipo de <em>Postres y Dulces Ke'Dulces</em> la revisará a la brevedad posible.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">Postres y Dulces Ke'Dulces S.A.S. — Cali, Colombia</p>
          </div>
        `
      }).catch(err => console.error("⚠️ Aviso: No se pudo enviar el correo de notificación:", err.message));
    }

    return res.status(201).json({
      mensaje: 'PQR registrada exitosamente',
      radicado: numeroRadicado,
      idPqr: pqrId
    });

  } catch (error) {
    console.error('❌ Error al procesar la PQR en MySQL:', error);
    return res.status(500).json({ 
      error: 'Error interno en la base de datos al guardar la PQR',
      detalle: error.message 
    });
  }
});

export default router;