
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import connection from './db.js'; // 👈 1. IMPORTAMOS TU CONEXIÓN A MYSQL (Ajusta el nombre si se llama diferente)

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea este código QR con tu celular:');
});

client.on('ready', () => {
    console.log('¡El chatbot de Kedulces está operativo, blindado y conectado a MySQL!');
});

// ==========================================
// LÓGICA DEL ÁRBOL DE DECISIÓN CORREGIDA
// ==========================================
client.on('message', async (msg) => {
    if (msg.from === 'status@broadcast' || msg.from.endsWith('@g.us')) return;

    const mensajeUsuario = msg.body.toLowerCase().trim();
    if (!mensajeUsuario) return;

    console.log(`\n🧁 CLIENTE ACTIVO (${msg.from}): "${msg.body}"`);

    // 1. Saludo inicial y Menú Principal
    if (mensajeUsuario.includes('hola') || mensajeUsuario.includes('buen') || mensajeUsuario.includes('menu')) {
        const saludo = `🧁 *¡Hola! Bienvenido a Postres y Dulces Ke'Dulces!* 🧁\n\n` +
                       `Por favor, selecciona una opción ingresando el *número* correspondiente:\n\n` +
                       `1️⃣ 📅 Horarios de atención\n` +
                       `2️⃣ 🍰 Ver Catálogo de postres en tiempo real\n` +
                       `3️⃣ 🛵 Costos de envío (Domicilios en Cali)\n` +
                       `4️⃣ 🎨 Cómo personalizar un postre\n` +
                       `5️⃣ 👩‍💻 Hablar con un asesor`;
        
        await client.sendMessage(msg.from, saludo);
    }
    
    // 2. Opción 1: Horarios
    else if (mensajeUsuario === '1') {
        const horarios = `📅 *Nuestros Horarios de Atención:*\n\n• Lunes a Sábado: 9:00 AM - 7:00 PM\n• Domingos y Festivos: 10:00 AM - 4:00 PM\n\nEscribe *menu* para volver.`;
        await client.sendMessage(msg.from, horarios);
    }

    // 3. Opción 2: Catálogo DINÁMICO DESDE MYSQL 🚀
    else if (mensajeUsuario === '2') {
        try {
            // Hacemos la consulta directa a tu tabla de productos
            // Nota: Cambia 'productos' o las columnas si en tu base de datos se llaman distinto
            const [rows] = await connection.query('SELECT nombre, descripcion, precio FROM productos');

            if (rows.length === 0) {
                await client.sendMessage(msg.from, "🍰 Actualmente nuestra vitrina está vacía preparando nuevas delicias. ¡Vuelve a intentar más tarde!");
                return;
            }

            let respuestaCatalogo = `🍰 *Nuestra Vitrina Dulce Hoy:* 🍰\n\n`;
            
            // Recorremos los productos traídos vivos de MySQL
            rows.forEach((postre, index) => {
                respuestaCatalogo += `*${index + 1}. ${postre.nombre}* 🧁\n`;
                respuestaCatalogo += `📝 ${postre.descripcion}\n`;
                respuestaCatalogo += `💰 Price: $${Number(postre.precio).toLocaleString('es-CO')} COP\n\n`;
            });

            respuestaCatalogo += `🌐 También puedes ver fotos en nuestra web: http://localhost:5173\n\nEscribe *menu* para regresar.`;
            
            await client.sendMessage(msg.from, respuestaCatalogo);

        } catch (error) {
            console.error("Error al consultar MySQL desde el chatbot:", error);
            await client.sendMessage(msg.from, "⚠️ Hubo un problema al consultar el catálogo. Por favor, intenta de nuevo o solicita un asesor con el número *5*.");
        }
    }

    // 4. Opción 3: Domicilios en Cali
    else if (mensajeUsuario === '3') {
        const domicilios = `🛵 *Precios de Envío (Zonas en Cali):*\n\n• *Zona Sur*: $5.000\n• *Zona Norte*: $8.000\n• *Zona Oeste*: $7.000\n\nEscribe *menu* para volver.`;
        await client.sendMessage(msg.from, domicilios);
    }

    // 5. Opción 4: Personalización
    else if (mensajeUsuario === '4') {
        const personalizacion = `🎨 *Postres Personalizados:*\n\nPresiona *5* para que un asesor tome los detalles de tu diseño de inmediato.`;
        await client.sendMessage(msg.from, personalizacion);
    }

    // 6. Opción 5: Asesor Humano
    else if (mensajeUsuario === '5') {
        const asesor = `👩‍💻 *Conectando con un Asesor...*\n\nHemos notificado a nuestro equipo. ¡Gracias por tu paciencia!`;
        await client.sendMessage(msg.from, asesor);
    }
});

client.initialize();