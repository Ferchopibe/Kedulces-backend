
import express from 'express';
// Importamos ambas funciones desde el controlador
import { registrarUsuario, loginUsuario } from '../controllers/authController.js'; 

const router = express.Router();

// Ruta para registrarse (Actividad A)
router.post('/register', registrarUsuario);

// Ruta para iniciar sesión (Actividad B) - ¡NUEVA!
router.post('/login', loginUsuario);

export default router;