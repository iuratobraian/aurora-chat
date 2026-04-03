---
name: aurora-mastery
description: Sistema de Maestría y Aprendizaje de la Mente Maestra Aurora. Documentación obligatoria de errores resueltos e inteligencia potenciada.
---

# AURORA MASTERY - SISTEMA DE APRENDIZAJE INFINITO

Este archivo es el **CEREBRO** del equipo TradeShare. Aquí se guardan de forma simple y concisa los errores que hemos superado para no volver a cometerlos jamás.

> [!IMPORTANT]
> **LECTURA OBLIGATORIA**: Todo agente DEBE leer este archivo al iniciar su sesión, después de consultar `pasado.md`.
> **AUTORIDAD**: El Jefe de Equipo es el único que puede validar una solución como definitiva.

---

## 🗂️ ÍNDICE DE ERRORES RESUELTOS

1. [Conexión con Base de Datos (Convex)](#1-conexión-con-base-de-datos-convex)
2. [Sincronización de Contexto (pasado.md)](#2-sincronización-de-contexto-pasadomd)

---

## 1. Conexión con Base de Datos (Convex)

**SÍNTOMA**:
Error `✖ Please set CONVEX_DEPLOY_KEY` o fallos en `npx convex dev`. El sistema no guarda ni lee datos de la nube.

**CAUSA RAÍZ**:
Falta de autenticación o expiración de la `CONVEX_DEPLOY_KEY` en el entorno de desarrollo local. Sin esta clave, el CLI de Convex no puede vincular el proyecto con la instancia del servidor.

**SOLUCIÓN DEFINITIVA**:
1. Verificar que la clave esté en `.env.local` bajo el nombre `CONVEX_DEPLOY_KEY`.
2. Si falta, ejecutar `npx convex dev` y seguir el link de autenticación o solicitar la clave al Jefe.
3. Asegurar que la URL de despliegue sea la correcta (`diligent-wildcat-523`).
4. **Validación**: Ejecutar `npx convex status`. Debe responder "Connected to...".

---

## 2. Sincronización de Contexto (pasado.md)

**SÍNTOMA**:
Agentes trabajando en tareas ya realizadas, pérdida de órdenes directas del Jefe o cambio de rutas de archivos que confunden al equipo.

**CAUSA RAÍZ**:
Falta de persistencia en la memoria de corto plazo entre sesiones de IA. Los agentes "olvidan" las órdenes del chat anterior.

**SOLUCIÓN DEFINITIVA**:
1. Creación del archivo `.agent/workspace/coordination/pasado.md`.
2. Registro **OBLIGATORIO** del chat del Jefe en este archivo por el Sub-jefe (Antigravity).
3. **Validación**: Todo agente debe citar la última directiva de `pasado.md` al iniciar para demostrar sincronización total.

---

*Última actualización: 2026-04-03 - Antigravity (Sub-jefe)*
