
import db from '../config/db.js';

// 1. OBTENER TODAS LAS PQRS
export const obtenerPqrs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pqrs ORDER BY id_pqr DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener las PQRS desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno al consultar la base de datos' });
  }
};

// 2. CREAR UNA NUEVA PQR
export const crearPqr = async (req, res) => {
  try {
    const { id_pedido, pedidoId, nombre, correo, tipo_solicitud, motivo, descripcion } = req.body;
    const pedidoFinal = id_pedido || pedidoId || 1;

    if (!nombre || !correo || !motivo || !descripcion) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados' });
    }

    const query = `
      INSERT INTO pqrs (id_pedido, nombre, correo, tipo_solicitud, motivo, descripcion, fecha_creacion)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const [resultado] = await db.query(query, [
      pedidoFinal,
      nombre,
      correo,
      tipo_solicitud || 'Devolución',
      motivo,
      descripcion
    ]);

    const idPqrGenerado = resultado.insertId;

    res.status(201).json({
      mensaje: 'PQR registrada exitosamente',
      radicado: `#PQR-${idPqrGenerado}`,
      idPqr: idPqrGenerado
    });

  } catch (error) {
    console.error('Error al guardar la PQR en la base de datos:', error);
    res.status(500).json({ error: 'Error interno al procesar la PQR' });
  }
};

// Exportación por defecto para resolver la incompatibilidad en index.js
export default {
  obtenerPqrs,
  crearPqr
};