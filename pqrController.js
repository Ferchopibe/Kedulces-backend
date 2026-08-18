
import db from './db.js';
import express from 'express';
import { enviarCorreo } from './mailer.js';

const router = express.Router();

// -------------------------------------------------------------
// 1. OBTENER TODAS LAS PQRS (RUTA GET - Usada por el Panel Admin)
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const [filas] = await db.query('SELECT * FROM pqrs ORDER BY id DESC');
    return res.json(filas);
  } catch (error) {
    console.error('⚠️ Error en GET /api/pqrs (Consultando BD):', error.message);
    return res.json([]);
  }
});

// -------------------------------------------------------------
// 2. CREAR UNA NUEVA PQR (RUTA POST - Usada por el Formulario)
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  const { pedidoId, clienteId, tipo, motivo, descripcion, correo, nombre } = req.body;

  try {
    let radicadoId = Math.floor(1000 + Math.random() * 9000);

    const motivoFinal = motivo || 'Sin especificar';
    const descripcionFinal = descripcion || 'Sin descripción proporcionada';

    // 1. Guardar en la Base de Datos
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

    // 2. Enviar correo de confirmación al cliente y copia a la administración
    const adminEmail = process.env.EMAIL_USER || 'kedulces.postres@gmail.com';
    const emailDestino = correo || adminEmail;

    // Lista de correos para notificar (Cliente + Administrador)
    const destinatarios = [emailDestino];
    if (correo && correo !== adminEmail) {
      destinatarios.push(adminEmail);
    }

    try {
      await enviarCorreo({
        destino: destinatarios.join(', '),
        asunto: `🧁 Nueva PQR Radicado #${radicadoId} - Ke'Dulces`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
            <h2 style="color: #d63384; text-align: center;">¡PQR Registrada con Éxito!</h2>
            <p>Hola <strong>${nombre || 'Estimado cliente'}</strong>,</p>
            <p>Hemos recibido la solicitud en nuestro sistema. Detalles del radicado:</p>
            <ul>
              <li><strong>Radicado (#):</strong> ${radicadoId}</li>
              <li><strong>Pedido Referencia:</strong> #${pedidoId || 'N/A'}</li>
              <li><strong>Tipo de Trámite:</strong> ${tipo || 'Petición'}</li>
              <li><strong>Motivo:</strong> ${motivoFinal}</li>
              <li><strong>Correo de Contacto:</strong> ${correo || 'No proporcionado'}</li>
            </ul>
            <blockquote style="background-color: #f8f9fa; padding: 12px; border-left: 4px solid #d63384; font-style: italic;">
              "${descripcionFinal}"
            </blockquote>
            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
              Postres y Dulces Ke'Dulces - Gestión Automatizada de PQRs
            </p>
          </div>
        `
      });
      console.log(`📧 Correo de PQR #${radicadoId} enviado a: ${destinatarios.join(', ')}`);
    } catch (mailError) {
      console.error("❌ Falló el envío de correo Nodemailer:", mailError.message);
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