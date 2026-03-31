/**
 * Script para limpiar caché del Service Worker
 * VERSIÓN COMPATIBLE - Copiar y pegar en la consola del navegador
 * 
 * Instrucciones:
 * 1. Abrir DevTools (F12)
 * 2. Ir a Console
 * 3. Copiar TODO este script y pegar
 * 4. Presionar Enter
 */

console.log('🧹 Iniciando limpieza de caché...');

// Paso 1: Eliminar todas las cachés
caches.keys().then(function(cacheNames) {
  console.log('📦 Cachés encontradas:', cacheNames.length);
  
  var deletePromises = cacheNames.map(function(cacheName) {
    console.log('  - Eliminando:', cacheName);
    return caches.delete(cacheName);
  });
  
  return Promise.all(deletePromises);
})
.then(function() {
  console.log('✅ Cachés eliminadas');
  
  // Paso 2: Unregister Service Workers
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistrations();
  }
  return [];
})
.then(function(registrations) {
  console.log('🔧 Service Workers encontrados:', registrations.length);
  
  var unregisterPromises = registrations.map(function(reg) {
    console.log('  - Unregistering:', reg.scope);
    return reg.unregister();
  });
  
  return Promise.all(unregisterPromises);
})
.then(function() {
  console.log('✅ Service Workers unregistered');
  
  // Paso 3: Limpiar Local Storage
  localStorage.clear();
  console.log('✅ Local Storage limpiado');
  
  // Paso 4: Limpiar Session Storage
  sessionStorage.clear();
  console.log('✅ Session Storage limpiado');
  
  // Paso 5: Recargar página
  console.log('✨ ¡Limpieza completada!');
  console.log('🔄 Recargando página en 3 segundos...');
  
  setTimeout(function() {
    window.location.reload(true);
  }, 3000);
})
.catch(function(error) {
  console.error('❌ Error:', error);
  console.log('Intenta manualmente:');
  console.log('1. Ir a Application > Storage > Clear site data');
  console.log('2. O presiona Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)');
});

console.log('⏳ Procesando...');
