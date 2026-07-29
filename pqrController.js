
import express from 'express';
import db from './db.js';
import { enviarCorreo } from './mailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { pedidoId, clienteId, tipo, motivo, descripcion, correo, nombre } = req.body;

  try {
    let radicadoId = Math.floor(1000 + Math.random() * 9000);

    const motivoFinal = motivo || 'Sin especificar';
    const descripcionFinal = descripcion || 'Sin descripción proporcionada';

    // 1. Intentar guardar en Base de Datos (tratando IDs vacíos como NULL)
    try {
      const [result] = await db.query(
        'INSERT INTO pqrs (pedido_id, cliente_id, tipo, motivo, descripcion) VALUES (?, ?, ?, ?, ?)',
        [pedidoId || null, clienteId || null, tipo || 'Petición', motivoFinal, descripcionFinal]
      );

      if (result && result.insertId) {
        radicadoId = result.insertId;
      }

      // Si hay un pedido asociado, actualizar su estado
      if (pedidoId) {
        await db.query(
          "UPDATE pedidos SET estado = 'En proceso de devolución' WHERE id_pedido = ?",
          [pedidoId]
        );
      }
    } catch (dbError) {
      console.warn("⚠️ Aviso BD (Error al insertar PQR):", dbError.message);
    }

    // 2. Enviar correo de confirmación
    const emailDestino = correo;
    if (emailDestino) {
      try {
        await enviarCorreo({
          destino: emailDestino,
          asunto: `🧁 Confirmación de PQR Radicado #${radicadoId} - Ke'Dulces`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
              <h2 style="color: #d63384; text-align: center;">¡PQR Recibida con Éxito!</h2>
              <p>Hola <strong>${nombre || 'Estimado cliente'}</strong>,</p>
              <p>Hemos recibido tu solicitud y se le asignó el siguiente número de seguimiento:</p>
              <ul>
                <li><strong>Radicado (#):</strong> ${radicadoId}</li>
                <li><strong>Pedido:</strong> #${pedidoId || 'N/A'}</li>
                <li><strong>Motivo:</strong> ${motivoFinal}</li>
              </ul>
              <blockquote style="background-color: #f8f9fa; padding: 10px; border-left: 4px solid #d63384; font-style: italic;">
                "${descripcionFinal}"
              </blockquote>
              <p>Nuestro equipo lo revisará a la brevedad posible.</p>
            </div>
          `
        });
        console.log(`📧 Correo enviado exitosamente a: ${emailDestino}`);
      } catch (mailError) {
        console.error("❌ Falló el envío de correo Nodemailer:", mailError.message);
      }
    }

    // 3. Responder al Frontend
    return res.status(201).json({
      mensaje: 'PQR registrada correctamente',
      radicado: radicadoId
    });

  } catch (error) {
    console.error("Error general en PQR:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;