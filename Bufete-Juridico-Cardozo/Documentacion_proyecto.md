
Documentación Técnica: Boutique Jurídica - Miguel A. Cardozo Cisneros
1. Visión General
Proyecto: Interfaz Web de Consultoría Jurídica.
Propósito: Optimizar la captación de clientes mediante la presentación profesional de servicios y facilitación de contacto directo.
Tecnologías: HTML5, Tailwind CSS, Google Fonts.
2. Estructura de Archivos
index.html: Archivo único que contiene:
Estructura semántica.
Estilos integrados (Tailwind via CDN).
Componentes de navegación, header, secciones y botón flotante.
3. Guía de Elementos y Subsistemas
A. Botón de Conversión (Call to Action - WhatsApp)
Ubicación: position: fixed (Bottom-6, Right-6).
Estilo: "Píldora" redondeada (rounded-full), color verde corporativo (bg-green-500).
Función: Redirección automática a API de WhatsApp (wa.me).
Mantenimiento: Si el número cambia, actualizar la URL en el atributo href del tag <a> dentro del archivo index.html.
B. Navegación (Sticky Header)
Comportamiento: Fijo en la parte superior (sticky top-0).
Logística: Utiliza etiquetas <a> con anclas (#id) para la navegación interna (SPA-like navigation).
C. Secciones de Contenido
Header: Contiene el perfil del profesional y el valor agregado.
Áreas de Práctica: Grid responsive (1 columna móvil, 4 columnas desktop).
Contacto: Formulario integrado con layout de dos columnas para información de contacto y campos de entrada.
4. Registro de Cambios (Historial Cronológico)
19/06/2026:
Cambio: Rediseño del botón de WhatsApp a formato píldora alargada.
Motivo: Mejora en la tasa de conversión y legibilidad para el usuario móvil.
Estado: Producción.
5. Instrucciones para futuros desarrolladores
Para añadir nuevas secciones, seguir el estándar de <section id="...">.
Mantener las fuentes de Google Fonts en el <head>.
Cualquier cambio de estilo global debe reflejarse en los archivos CSS integrados.
