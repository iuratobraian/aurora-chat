#!/usr/bin/env node
/**
 * Script para crear/actualizar el usuario Admin
 * Ejecuta la función createAdminSeed de Convex
 */

import { ConvexAdminClient } from "convex/server";
import { api } from "../convex/_generated/api.js";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;

if (!CONVEX_URL || !CONVEX_DEPLOY_KEY) {
  console.error('❌ Faltan variables de entorno:');
  console.error('  CONVEX_URL=', CONVEX_URL ? '✓' : '✗');
  console.error('  CONVEX_DEPLOY_KEY=', CONVEX_DEPLOY_KEY ? '✓' : '✗');
  console.error('\nAsegúrate de tener .env.local configurado correctamente.');
  process.exit(1);
}

async function createAdminUser() {
  console.log('🔧 Creando usuario Admin en Convex...');
  console.log('   URL:', CONVEX_URL);
  
  const client = new ConvexAdminClient({
    url: CONVEX_URL,
    deployKey: CONVEX_DEPLOY_KEY,
  });

  try {
    // Ejecutar la función createAdminSeed
    const result = await client.mutation(api.profiles.createAdminSeed, {});
    
    console.log('✅ ¡Éxito!');
    console.log('   Resultado:', result);
    console.log('\n📋 Credenciales de Admin:');
    console.log('   Email: admin@tradeportal.com');
    console.log('   Usuario: brai');
    console.log('   Role: 6 (SUPERADMIN)');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPosibles causas:');
    console.error('  1. CONVEX_DEPLOY_KEY incorrecta');
    console.error('  2. La función createAdminSeed no existe');
    console.error('  3. Problemas de conexión con Convex');
    process.exit(1);
  }
}

createAdminUser();
