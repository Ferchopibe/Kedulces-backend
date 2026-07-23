
import autocannon from 'autocannon';

// Configuración de la prueba de carga
const urlTarget = 'http://localhost:4000/api/productos';

console.log('🚀 Iniciando Prueba de Carga en el Servidor de Ke\'Dulces...');
console.log(`🎯 Objetivo: ${urlTarget}`);
console.log('⏳ Simulando 10 conexiones concurrentes durante 10 segundos...\n');

const instance = autocannon({
  url: urlTarget,
  connections: 10, // 10 usuarios simultáneos
  duration: 10     // Durante 10 segundos
}, (err, result) => {
  if (err) {
    console.error('❌ Error durante la prueba de carga:', err);
  } else {
    console.log('✅ ¡Prueba de carga completada con éxito!');
    console.log('----------------------------------------------------');
    console.log(`📊 Peticiones Totales Procesadas: ${result.requests.total}`);
    console.log(`⚡ Promedio de Peticiones/segundo: ${result.requests.average}`);
    console.log(`⏱️ Tiempo Promedio de Respuesta (Latencia): ${result.latency.average} ms`);
    console.log(`❌ Errores detectados (5xx/4xx): ${result.non2xx || 0}`);
    console.log('----------------------------------------------------');
  }
});

// Muestra el progreso en tiempo real en la consola
autocannon.track(instance, { renderProgressBar: true });