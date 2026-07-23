
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'clave_secreta_ultra_confidencial_kedulces';

// ACTIVIDAD C: Middleware de Protección y Aislamiento de Datos
const verificarToken = (req, res, next) => {
    // 1. Obtener el token que viaja en la cabecera de la petición (Authorization)
    const authHeader = req.headers['authorization'];
    
    // El token suele venir en formato: "Bearer TEXTO_DEL_TOKEN"
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Si no hay token, bloqueamos el acceso inmediatamente
    if (!token) {
        return res.status(401).json({ 
            error: 'Acceso denegado. No se proporcionó un token de seguridad.' 
        });
    }

    try {
        // 3. Verificar y desencriptar el token usando nuestra clave secreta
        const verificado = jwt.verify(token, JWT_SECRET);
        
        // 4. Inyectamos los datos del usuario verificado directamente en la petición (req)
        // Esto permite que cualquier ruta posterior sepa el ID y Rol del usuario logueado
        req.usuario = verificado;

        // 5. ¡Llave libre! Dejamos que la petición continúe a la ruta o controlador correspondiente
        next();
        
    } catch (error) {
        // Si el token expiró (pasaron las 2 horas) o fue alterado, se rebota
        return res.status(403).json({ 
            error: 'Token de seguridad inválido o expirado.' 
        });
    }
};

export default verificarToken;