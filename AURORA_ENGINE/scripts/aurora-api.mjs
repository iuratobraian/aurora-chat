#!/usr/bin/env node
/**
 * aurora-api.mjs — Aurora API Entry Point
 *
 * Levanta el servidor Aurora API autónomo en el puerto 4310.
 * Provee health check, métricas del enjambre y WebSocket real-time.
 */

// Delegamos directamente al servidor autónomo
import './aurora-api-server.mjs';
