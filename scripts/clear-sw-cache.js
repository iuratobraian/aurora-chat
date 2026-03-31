/**
 * Script para limpiar caché del Service Worker y forzar recarga
 * 
 * Ejecutar en la consola del navegador:
 * 1. Abrir DevTools (F12)
 * 2. Ir a Console
 * 3. Pegar este script y presionar Enter
 */

(async function clearAllCaches() {
  console.log('🧹 Limpiando todas las cachés...');
  
  // 1. Limpiar Cache Storage
  const cacheNames = await caches.keys();
  console.log('📦 Cachés encontradas:', cacheNames);
  
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('✅ Cachés eliminadas');
  
  // 2. Unregister todos los Service Workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('🔧 Service Workers encontrados:', registrations.length);
    
    for (const registration of registrations) {
      await registration.unregister();
      console.log('✅ Service Worker unregistered:', registration.scope);
    }
  }
  
  // 3. Limpiar Local Storage
  localStorage.clear();
  console.log('✅ Local Storage limpiado');
  
  // 4. Limpiar Session Storage
  sessionStorage.clear();
  console.log('✅ Session Storage limpiado');
  
  // 5. Forzar recarga completa
  console.log('🔄 Recargando página en 2 segundos...');
  setTimeout(() => {
    window.location.reload(true);
  }, 2000);
  
  console.log('✨ ¡Limpieza completada! La página se recargará automáticamente.');
})();
