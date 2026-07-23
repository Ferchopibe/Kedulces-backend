USE Kedulces;

-- Borramos la tabla si existía previamente para evitar duplicados
DROP TABLE IF EXISTS productos;

-- Creamos la estructura definitiva del catálogo
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen_url VARCHAR(255),
    disponible TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertamos los postres iniciales del negocio
INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES 
('Milhoja Tradicional', 'Capas de hojaldre crujiente rellenas de arequipe y crema pastelera.', 8500.00, 'milhoja.png'),
('Postre Tres Leches', 'Bizcocho esponjoso bañado en tres tipos de leche con un toque de canela.', 9500.00, 'tres_leches.png'),
('Cheesecake de Maracuyá', 'Base crocante de galleta con crema suave de queso y cobertura ácida de maracuyá.', 11000.00, 'cheesecake_maracuya.png');
