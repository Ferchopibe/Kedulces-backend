
import nodemailer from 'nodemailer';

// 1. Configuración del transporte SMTP de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS / STARTTLS
  auth: {
    user: process.env.EMAIL_USER || 'kedulces.postres@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Evita bloqueos de certificados en Railway
  },
  connectionTimeout: 10000 // 10 segundos de espera máxima
});

// 2. Función helper reutilizable para enviar correos
export const enviarCorreo = async ({ destino, asunto, htmlContent }) => {
  try {
    const mailOptions = {
      from: `"Postres y Dulces Ke'Dulces 🧁" <${process.env.EMAIL_USER || 'kedulces.postres@gmail.com'}>`,
      to: destino,
      subject: asunto,
      html: htmlContent
    };

    // Modo prueba si no hay clave SMTP real configurada
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'tu_contraseña_de_aplicacion') {
      console.log('----------------------------------------------------');
      console.log('📧 [MODO PRUEBA NODEMAILER] Correo generado con éxito (Sin enviar):');
      console.log(`Para: ${destino}`);
      console.log(`Asunto: ${asunto}`);
      console.log('----------------------------------------------------');
      return { success: true, modo: 'simulado' };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Correo enviado con éxito. MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    throw error;
  }
};

export default transporter;