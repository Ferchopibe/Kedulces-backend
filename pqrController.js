
const db = require('../config/db'); // Importa la conexión a la base de datos MySQL

// 1. OBTENER TODAS LAS PQRS (Consulta GET corregida para leer desde MySQL)
exports.obtenerPqrs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pqrs ORDER BY id_pqr DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener las PQRs desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor al consultar la base de datos' });
  }
};

// 2. CREAR UNA NUEVA PQR (Consulta POST para insertar en MySQL)
exports.crearPqr = async (req, res) => {
  try {
    const { id_pedido, pedidoId, nombre, correo, tipo_solicitud, motivo, descripcion } = req.body;
    
    // Asigna el ID del pedido aceptando ambas nomenclaturas
    const pedidoFinal = id_pedido || pedidoId || 1;

    // Validación básica de campos requeridos
    if (!nombre || !correo || !motivo || !descripcion) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados' });
    }

    // Inserción en la base de datos MySQL (Aiven)
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

    // Respuesta exitosa
    res.status(201).json({
      mensaje: 'PQR registrada exitosamente',
      radicado: `#PQR-${idPqrGenerado}`,
      idPqr: idPqrGenerado
    });

  } catch (error) {
    console.error('Error al guardar la PQR en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar la PQR' });
  }
};