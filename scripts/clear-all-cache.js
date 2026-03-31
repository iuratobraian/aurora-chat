/**
 * LIMPIEZA COMPLETA DE CACHE Y SESIONES
 * Ejecutar en la consola del navegador (F12)
 */

console.log('🧹 Iniciando limpieza completa...');

// 1. Limpiar localStorage
localStorage.clear();
console.log('✅ localStorage limpiado');

// 2. Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// 3. Limpiar Cache Storage
caches.keys().then(names => {
  names.forEach(name => {
    caches.delete(name);
    console.log('✅ Cache eliminado:', name);
  });
});

// 4. Unregister Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => {
      reg.unregister();
      console.log('✅ Service Worker unregistered:', reg.scope);
    });
  });
}

// 5. Limpiar IndexedDB
indexedDB.databases().then(dbs => {
  dbs.forEach(db => {
    indexedDB.deleteDatabase(db.name);
    console.log('✅ IndexedDB eliminado:', db.name);
  });
});

console.log('✨ ¡Limpieza completada!');
console.log('🔄 Recargando página en 2 segundos...');

setTimeout(() => {
  window.location.reload(true);
}, 2000);
