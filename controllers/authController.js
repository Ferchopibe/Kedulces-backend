
import db from '../db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = 'clave_secreta_ultra_confidencial_kedulces';

// ==========================================
// ACTIVIDAD A: Registro de Usuarios con Hash
// ==========================================
export const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // 1. Verificar si el email ya existe
        const [usuariosExistentes] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // 2. Aplicar el Hash a la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insertar en la base de datos
        const queryInsert = 'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)';
        await db.query(queryInsert, [nombre, email, passwordHash]);

        return res.status(201).json({ 
            mensaje: '¡Usuario registrado exitosamente con Hash de seguridad!' 
        });

    } catch (error) {
        console.error('Error en el registro de usuarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
    }
};

// ==========================================
// ACTIVIDAD B: Inicio de Sesión y Token JWT
// ==========================================
export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    try {
        // 1. Buscar al usuario en MySQL por su correo
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas (usuario no encontrado).' });
        }

        const usuario = usuarios[0];

        // 2. Comparar la contraseña ingresada con el Hash de la base de datos
        const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordCorrecto) {
            return res.status(401).json({ error: 'Credenciales inválidas (contraseña incorrecta).' });
        }

        // 3. Generar el Token JWT
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '2h' } 
        );

        // 4. Responder al cliente con el token
        return res.json({
            mensaje: '¡Autenticación exitosa!',
            token,
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en el login de usuarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
};