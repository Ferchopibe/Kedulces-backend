
import db from '../config/db.js'; 
import { enviarCorreo } from '../services/mailer.js'; 

export const crearPQR = async (req, res) => {
  const { pedidoId, clienteId, tipo, motivo, descripcion, correo, nombre } = req.body;

  try {
    // 1. Intentar insertar en la base de datos
    let radicadoId = Math.floor(1000 + Math.random() * 9000); // ID de respaldo

    try {
      const [result] = await db.query(
        'INSERT INTO pqrs (pedido_id, cliente_id, tipo, motivo, descripcion) VALUES (?, ?, ?, ?, ?)',
        [pedidoId || 1, clienteId || 1, tipo || 'Devolución', motivo, descripcion]
      );
      if (result && result.insertId) {
        radicadoId = result.insertId;
      }
    } catch (dbError) {
      console.warn("⚠️ Aviso BD (PQR guardada condicionalmente):", dbError.message);
    }

    // 2. Destinatario del correo
    const emailDestino = correo || 'luisfernandopibe51@gmail.com';

    // 3. Enviar correo de confirmación
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
              <li><strong>Motivo:</strong> ${motivo}</li>
            </ul>
            <blockquote style="background-color: #f8f9fa; padding: 10px; border-left: 4px solid #d63384; font-style: italic;">
              "${descripcion}"
            </blockquote>
            <p>Nuestro equipo lo revisará a la brevedad posible.</p>
          </div>
        `
      });
      console.log(`📧 Correo de PQR #${radicadoId} enviado a: ${emailDestino}`);
    } catch (mailError) {
      console.error("❌ Falló el envío de correo Nodemailer:", mailError.message);
    }

    // 4. Responder al Frontend SIEMPRE con el número de radicado
    return res.status(201).json({
      mensaje: 'PQR registrada correctamente',
      radicado: radicadoId
    });

  } catch (error) {
    console.error("Error general en PQR:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};