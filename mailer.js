
import nodemailer from 'nodemailer';

// 1. Configuración del transporte SMTP de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS / STARTTLS
  auth: {
    user: process.env.EMAIL_USER || 'luisfernandopibe51@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Evita bloqueos de certificados en Railway/Cloud
  },
  connectionTimeout: 10000 // 10 segundos de espera máxima
});

// 2. Función helper reutilizable para enviar cualquier correo HTML
export const enviarCorreo = async ({ destino, asunto, htmlContent }) => {
  try {
    const remitente = process.env.EMAIL_USER || 'luisfernandopibe51@gmail.com';

    const mailOptions = {
      from: `"Postres y Dulces Ke'Dulces 🧁" <${remitente}>`,
      to: destino,
      subject: asunto,
      html: htmlContent
    };

    // Modo prueba si no hay clave SMTP real configurada en .env
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'tu_contraseña_de_aplicacion') {
      console.log('----------------------------------------------------');
      console.log('📧 [MODO PRUEBA NODEMAILER] Correo no enviado (Falta EMAIL_PASS en .env):');
      console.log(`Para: ${destino}`);
      console.log(`Asunto: ${asunto}`);
      console.log('----------------------------------------------------');
      return { success: true, modo: 'simulado' };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Correo enviado con éxito. MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar el correo con Nodemailer:', error);
    throw error;
  }
};

// 3. Función específica para enviar confirmación de PQR
export const enviarCorreoPQR = async (datosPQR) => {
  const { radicado, nombre, correo, tipo, motivo, descripcion, pedidoId } = datosPQR;

  const plantillaHTML = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
      <h2 style="color: #d81b60; text-align: center;">¡Hola, ${nombre || 'Cliente'}!</h2>
      <p style="font-size: 16px;">Hemos recibido tu solicitud de <strong>${tipo || 'PQR'}</strong> en nuestro sistema de <strong>Postres y Dulces Ke'Dulces</strong>.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d81b60; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Número de Radicado:</strong> #${radicado}</p>
        ${pedidoId ? `<p style="margin: 5px 0;"><strong>Pedido de referencia:</strong> #${pedidoId}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Tipo de Trámite:</strong> ${tipo || 'Devolución de Producto'}</p>
        <p style="margin: 5px 0;"><strong>Motivo:</strong> ${motivo || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Detalles registrados:</strong> ${descripcion || 'Sin detalles'}</p>
      </div>

      <p>Nuestro equipo revisará los detalles y te responderá en este mismo correo a la brevedad posible.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 13px; color: #777; text-align: center;">Atentamente,<br><strong>Equipo de Postres y Dulces Ke'Dulces SAS</strong></p>
    </div>
  `;

  return await enviarCorreo({
    destino: correo,
    asunto: `Confirmación de Solicitud #${radicado} - Ke'Dulces`,
    htmlContent: plantillaHTML
  });
};

export default transporter;