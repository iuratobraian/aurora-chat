#!/usr/bin/env node
/**
 * Script para establecer contraseña del usuario Admin
 * Usa: node scripts/set-admin-password.js "TuContraseña123!"
 */

import { ConvexAdminClient } from "convex/server";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const scryptAsync = promisify(scrypt);

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
};

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;

if (!CONVEX_URL || !CONVEX_DEPLOY_KEY) {
  console.error('❌ Faltan variables de entorno:');
  console.error('  CONVEX_URL=', CONVEX_URL ? '✓' : '✗');
  console.error('  CONVEX_DEPLOY_KEY=', CONVEX_DEPLOY_KEY ? '✓' : '✗');
  process.exit(1);
}

const ADMIN_EMAIL = "admin@tradeportal.com";
const ADMIN_PASSWORD = process.argv[2] || "Admin123!";

async function setAdminPassword() {
  console.log('🔧 Estableciendo contraseña de Admin...');
  console.log('   Email:', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   URL:', CONVEX_URL);
  
  const client = new ConvexAdminClient({
    url: CONVEX_URL,
    deployKey: CONVEX_DEPLOY_KEY,
  });

  try {
    // 1. Buscar el perfil del admin
    const profiles = await client.query("profiles")
      .filter((q) => q.eq(q.field("email"), ADMIN_EMAIL))
      .collect();

    if (profiles.length === 0) {
      console.log('⚠️  Admin no encontrado. Creando primero...');
      
      // Crear el admin si no existe
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      const adminId = await client.mutation("profiles:createProfile", {
        userId: "admin_initial_seed",
        email: ADMIN_EMAIL,
        nombre: "Admin",
        usuario: "brai",
        password: hashedPassword,
        rol: "admin",
        role: 6,
        xp: 10000,
        level: 50,
        esPro: true,
        esVerificado: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=brai",
        biografia: "Cuenta oficial de administración.",
        saldo: 1000,
      });
      
      console.log('✅ Admin creado con ID:', adminId);
    } else {
      const profile = profiles[0];
      console.log('✓ Admin encontrado:', profile._id);

      // 2. Actualizar contraseña
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      await client.mutation("profiles:updateProfile", {
        userId: profile.userId,
        updates: {
          password: hashedPassword,
          role: 6,
          rol: "admin",
        },
      });

      console.log('✅ ¡Contraseña actualizada!');
    }
    
    console.log('\n📋 Credenciales de Admin:');
    console.log('   Email: admin@tradeportal.com');
    console.log('   Usuario: brai');
    console.log('   Contraseña:', ADMIN_PASSWORD);
    console.log('   Role: 6 (SUPERADMIN)');
    console.log('\n⚠️  Cambia la contraseña después del primer login!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

setAdminPassword();
