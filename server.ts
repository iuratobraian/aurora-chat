import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import express from "express";
import type { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import {
    MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT,
    mercadopagoProvider,
    resolveMercadoPagoSubscriptionAmount,
} from "./convex/lib/mercadopago";
import { zenobankProvider } from "./convex/lib/zenobank";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import { getAvailableExternalAIProviders, getExternalAIProviderById, getExternalAIProviders } from "./lib/ai/externalProviders";
import logger from "./serverLogger";
import { initAllSkills, nvidiaAgents } from "./src/skills";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('⚠️  JWT_SECRET no configurado. Generando secret temporal SOLO PARA DESARROLLO.');
    console.error('   ⚠️  NUNCA usar esto en producción. Configurar JWT_SECRET en .env.local');
}
const JWT_SECRET_EFFECTIVE = JWT_SECRET || `dev_secret_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const JWT_EXPIRES_IN = '1h';

const MAX_CLICKS = 5000;

const CLICK_TTL_MS = 30 * 60 * 1000;
const MAX_WEBHOOKS = 10000;
const WEBHOOK_TTL_MS = 60 * 60 * 1000;
const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "https://notable-sandpiper-279.convex.cloud";
const convexClient = new ConvexHttpClient(CONVEX_URL);

const notificationClicks: Map<string, { action: string; timestamp: number }[]> = new Map();

function addNotificationClick(id: string, action: string, timestamp: number) {
    if (!notificationClicks.has(id)) {
        notificationClicks.set(id, []);
    }
    notificationClicks.get(id)!.push({ action, timestamp });

    const now = Date.now();
    for (const [key, clicks] of notificationClicks) {
        const filtered = clicks.filter(c => now - c.timestamp < CLICK_TTL_MS);
        if (filtered.length === 0) {
            notificationClicks.delete(key);
        } else if (filtered.length < clicks.length) {
            notificationClicks.set(key, filtered);
        }
    }

    if (notificationClicks.size > MAX_CLICKS) {
        const oldestKey = notificationClicks.keys().next().value;
        if (oldestKey) notificationClicks.delete(oldestKey);
    }
}

const processedWebhooks = new Map<string, number>();
function isDuplicateWebhook(webhookId: string): boolean {
    if (processedWebhooks.has(webhookId)) return true;

    const now = Date.now();
    for (const [key, ts] of processedWebhooks) {
        if (now - ts > WEBHOOK_TTL_MS) {
            processedWebhooks.delete(key);
        }
    }

    if (processedWebhooks.size >= MAX_WEBHOOKS) {
        const oldestKey = processedWebhooks.keys().next().value;
        if (oldestKey) processedWebhooks.delete(oldestKey);
    }

    processedWebhooks.set(webhookId, now);
    return false;
}

function parseWebhookBody(body: unknown) {
    let rawBody: string;
    if (Buffer.isBuffer(body)) {
        rawBody = body.toString('utf-8');
    } else if (typeof body === 'string') {
        rawBody = body;
    } else {
        rawBody = JSON.stringify(body ?? '');
    }

    try {
        return {
            rawBody,
            payload: JSON.parse(rawBody),
        };
    } catch (error) {
        logger.warn('[Webhook] JSON parse failed:', { error: error instanceof Error ? error.message : String(error) });
        return {
            rawBody,
            payload: null,
            parseError: error,
        };
    }
}

// IP Blocking & Rate Limiting Guard
const blockedIPs = new Set((process.env.BLOCKED_IPS || '').split(',').filter(Boolean));
const ipRequestCounts = new Map<string, { count: number, lastRequest: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 300; // 5 req/sec avg

function ipGuard(req: Request, res: Response, next: NextFunction) {
    const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    
    if (blockedIPs.has(ip)) {
        logger.warn(`[Security] Blocked request from banned IP: ${ip}`, { path: req.path });
        return res.status(403).json({ error: 'Acceso denegado', code: 'IP_BANNED' });
    }

    const now = Date.now();
    const stats = ipRequestCounts.get(ip) || { count: 0, lastRequest: now };

    if (now - stats.lastRequest > RATE_LIMIT_WINDOW) {
        stats.count = 1;
        stats.lastRequest = now;
    } else {
        stats.count++;
    }

    ipRequestCounts.set(ip, stats);

    if (stats.count > MAX_REQUESTS_PER_WINDOW) {
        logger.warn(`[Security] Rate limit exceeded for IP: ${ip}`, { count: stats.count });
        return res.status(429).json({ error: 'Demasiadas solicitudes', code: 'RATE_LIMIT_EXCEEDED' });
    }

    next();
}

// Payment webhook handlers
async function handleMercadoPagoWebhook(req: express.Request, res: express.Response) {
    try {
        const { rawBody, payload, parseError } = parseWebhookBody(req.body);
        const xSignature = req.headers['x-signature'] as string | undefined;
        const xRequestId = (req.headers['x-request-id'] as string) || randomUUID();
        const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

        if (!payload) {
            const msg = 'MercadoPago webhook payload inválido';
            logger.warn('[Webhook] MercadoPago parse fail', { requestId: xRequestId, error: parseError });
            return res.status(400).json({ error: msg });
        }

        if (webhookSecret) {
            if (!xSignature) {
                logger.warn('[Webhook] MercadoPago falta X-Signature', { requestId: xRequestId });
                return res.status(401).json({ error: 'Firma faltante' });
            }

            const dataId = payload?.data?.id || payload?.id;
            const ts = xSignature.split(',').find((s) => s.startsWith('ts='))?.split('=')[1];
            const hash = xSignature.split(',').find((s) => s.startsWith('v1='))?.split('=')[1];

            if (!dataId || !ts || !hash) {
                logger.warn('[Webhook] MercadoPago firma incompleta', { requestId: xRequestId });
                return res.status(401).json({ error: 'Firma inválida' });
            }

            const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
            const expected = createHmac('sha256', webhookSecret).update(manifest).digest();
            let actual: Buffer;
            try {
                actual = Buffer.from(hash, 'hex');
            } catch {
                logger.warn('[Webhook] MercadoPago firma hex inválida', { requestId: xRequestId });
                return res.status(401).json({ error: 'Firma inválida' });
            }

            if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
                logger.warn('[Webhook] MercadoPago firma inválida', { requestId: xRequestId });
                return res.status(401).json({ error: 'Firma inválida' });
            }
        }

        const eventId = payload?.data?.id || payload?.id || payload?.external_reference || xRequestId;
        if (eventId && isDuplicateWebhook(`mp_${eventId}`)) {
            logger.info('[Webhook] MercadoPago duplicado', { eventId, requestId: xRequestId });
            return res.status(200).json({ received: true, duplicate: true });
        }

        const eventType = payload?.type || payload?.topic || 'unknown';
        logger.info('[Webhook] MercadoPago recibido', {
            eventId,
            eventType,
            requestId: xRequestId,
            rawBodyLength: rawBody.length,
        });

        // Manejar notificaciones de PREAPPROVAL (Suscripciones recurrentes)
        if (eventType === 'preapproval' || payload?.topic === 'preapproval') {
            const preapprovalId = (payload?.data?.id || payload?.id || payload?.resource)?.toString();
            logger.info('[Webhook] MercadoPago preapproval notification', { preapprovalId });
            
            if (preapprovalId) {
                try {
                    const mpData = await mercadopagoProvider.getPreapproval(preapprovalId);
                    if (mpData && (mpData.status === 'authorized' || mpData.status === 'active')) {
                        const externalRef = mpData.external_reference;
                        if (externalRef) {
                            logger.info('[Webhook] Activating subscription from preapproval', { userId: externalRef, preapprovalId });
                            // Aquí se podría llamar a la mutación de activación
                            await convexClient.mutation(api.subscriptions.createSubscription as any, {
                                userId: externalRef,
                                plan: mpData.reason || 'pro',
                                provider: 'mercadopago',
                                externalReference: preapprovalId,
                                status: 'active',
                                currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
                            });
                        }
                    }
                } catch (err) {
                    logger.error('[Webhook] Error processing preapproval', err);
                }
            }
            
            return res.status(200).json({ received: true, type: 'preapproval' });
        }

        // Actualizar estado del pago y balance del usuario
        if (eventType === 'payment' && payload?.data?.id) {
            try {
                const payment = payload;
                const paymentStatus = payment?.status;
                const paymentAmount = payment?.transaction_amount || payment?.amount || 0;
                const externalRef = payment?.external_reference || '';
                
                // Extraer userId y tipo del external_reference (formato: userId_type_timestamp o userId_timestamp)
                const parts = externalRef.split('_');
                const userId = parts[0];
                const paymentType = parts[1] || 'credits'; // credits, subscription, community
                
                if (userId && paymentStatus === 'approved') {
                    logger.info('[Webhook] MercadoPago pago aprobado', { userId, paymentAmount, paymentId: eventId, paymentType });
                    
                    // Procesar según el tipo de pago
                    if (paymentType === 'credits') {
                        // Agregar créditos al usuario
                        await convexClient.mutation(api.communities.addCredits as any, {
                            userId,
                            amount: Math.floor(paymentAmount),
                            description: `Depósito via MercadoPago - ID: ${eventId}`,
                            referenceId: String(eventId),
                        }) as any;
                        await convexClient.mutation(api.profiles.addBalance as any, {
                            userId,
                            amount: Math.floor(paymentAmount),
                        }) as any;

                        logger.info('[Webhook] Créditos y Saldo agregados', { userId, amount: Math.floor(paymentAmount) });
                    } else if (paymentType === 'subscription') {
                        const planId = parts[2] || 'basic';
                        const billingCycle = parts[3] || 'monthly';
                        const periodDays = billingCycle === 'yearly' ? 365 : 30;
                        await convexClient.mutation(api.subscriptions.createSubscription as any, {
                            userId,
                            plan: planId,
                            provider: 'mercadopago',
                            externalReference: String(eventId),
                            status: 'active',
                            currentPeriodEnd: Date.now() + periodDays * 24 * 60 * 60 * 1000,
                        }) as any;
                        logger.info('[Webhook] Suscripción creada', { userId, planId, billingCycle });
                    } else if (paymentType === 'community') {
                        const communityId = parts[2];
                        if (communityId) {
                            await convexClient.mutation(api.communities.grantCommunityAccess as any, {
                                userId,
                                communityId,
                                paymentReference: String(eventId),
                            }) as any;
                            logger.info('[Webhook] Acceso a comunidad concedido', { userId, communityId });
                        }
                    }
                }
            } catch (updateError: any) {
                logger.error('[Webhook] Error actualizando pago:', { error: updateError?.message });
            }
        }

        res.status(200).json({ received: true });
    } catch (error: any) {
        logger.error('[Webhook] MercadoPago error', { error: error?.message || error, trace: error });
        res.status(500).json({ error: error.message || 'Error interno' });
    }
}

async function handleZenobankWebhook(req: express.Request, res: express.Response) {
    try {
        const { rawBody, payload, parseError } = parseWebhookBody(req.body);
        const webhookSecret = process.env.ZENOBANK_WEBHOOK_SECRET;

        if (!payload) {
            logger.warn('[Webhook] Zenobank parse fail', { error: parseError });
            return res.status(400).json({ error: 'Payload inválido' });
        }

        if (webhookSecret) {
            const signature = req.headers['x-webhook-signature'] as string | undefined;
            if (!signature) {
                logger.warn('[Webhook] Zenobank falta signature');
                return res.status(401).json({ error: 'Firma faltante' });
            }

            const expected = createHmac('sha256', webhookSecret).update(rawBody).digest();
            let actual: Buffer;
            try {
                actual = Buffer.from(signature, 'hex');
            } catch {
                logger.warn('[Webhook] Zenobank firma hex inválida');
                return res.status(401).json({ error: 'Firma inválida' });
            }
            if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
                logger.warn('[Webhook] Zenobank firma inválida');
                return res.status(401).json({ error: 'Firma inválida' });
            }
        }

        const eventId = payload?.id || payload?.transaction_id;
        if (eventId && isDuplicateWebhook(`zb_${eventId}`)) {
            logger.info('[Webhook] Zenobank duplicado', { eventId });
            return res.status(200).json({ received: true, duplicate: true });
        }

        const eventType = payload?.type || payload?.event || 'zenobank';
        logger.info('[Webhook] Zenobank recibido', { eventId, eventType, rawBodyLength: rawBody.length });
        res.status(200).json({ received: true });
    } catch (error: any) {
        logger.error('[Webhook] Zenobank error', { error: error?.message || error });
        res.status(500).json({ error: error.message || 'Error interno' });
    }
}

async function handleNotificationClick(req: express.Request, res: express.Response) {
    try {
        const { notificationId, action, timestamp } = req.body;
        
        if (notificationId) {
            addNotificationClick(notificationId, action, timestamp ?? Date.now());
            logger.debug(`[Notification Click] ${notificationId}: ${action}`);
        }
        
        res.status(200).json({ success: true });
    } catch (error: any) {
        logger.error("[Notification Click] Error:", error);
        res.status(500).json({ error: error.message });
    }
}

// MercadoPago API Routes
async function createMercadoPagoPreference(req: express.Request, res: express.Response) {
    try {
        const { userId, amount, description, plan, courseId, paymentType, communityId, billingCycle, email } = req.body;
        
        // Formato external_reference: userId_type_[data]_timestamp
        // Tipos: credits, subscription, community, course
        const type = paymentType || 'credits';
        let externalRef = `${userId}_${type}_${Date.now()}`;
        let checkoutAmount = Number(amount) || 0;
        
        // Si es una suscripción, intentamos usar PREAPPROVAL (pagos recurrentes automáticos)
        if (type === 'subscription') {
            const subscriptionPlan = plan || 'pro';
            const resolvedAmount = resolveMercadoPagoSubscriptionAmount(plan, checkoutAmount);
            if (!resolvedAmount) {
                return res.status(400).json({
                    error: `La suscripción requiere un monto mínimo de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT} o un plan válido.`,
                });
            }

            checkoutAmount = resolvedAmount;
            const subscription = await mercadopagoProvider.createSubscription({
                plan: subscriptionPlan,
                payer_email: email || '',
                userId,
                amount: checkoutAmount,
                description,
                billingCycle: (billingCycle || 'monthly') as any
            });

            if (subscription.success) {
                return res.json({ 
                    init_point: subscription.init_point, 
                    subscriptionId: subscription.subscriptionId,
                    type: 'subscription'
                });
            } else {
                logger.warn("[API] subscription API failed, falling back to preference:", subscription.error);
                // Si falla preapproval, continuamos con preferencia (pago único)
            }
        }

        if (type === 'subscription' && plan) {
            externalRef = `${userId}_subscription_${plan}_${billingCycle || 'monthly'}_${Date.now()}`;
        } else if (type === 'community' && communityId) {
            externalRef = `${userId}_community_${communityId}_${Date.now()}`;
        } else if (type === 'course' && courseId) {
            externalRef = `${userId}_course_${courseId}_${Date.now()}`;
        }

        if (checkoutAmount < MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT) {
            return res.status(400).json({
                error: `El pago mínimo con MercadoPago es de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}.`,
            });
        }
        
        const preference = await mercadopagoProvider.createPreference({
            amount: checkoutAmount,
            description,
            externalReference: externalRef,
            userId,
            plan,
            courseId,
        });

        res.json({ init_point: preference.init_point, preferenceId: preference.id });
    } catch (error: any) {
        logger.error("[API] MercadoPago preference error:", error);
        res.status(500).json({ error: error.message });
    }
}

// MercadoPago Subscription API
async function createMercadoPagoSubscription(req: express.Request, res: express.Response) {
    try {
        const { userId, email, planId, planName, price, interval, billingCycle } = req.body;
        
        // Usar preferencia con external_reference codificado
        const externalRef = `${userId}_subscription_${planId}_${billingCycle || interval || 'monthly'}_${Date.now()}`;
        const checkoutAmount = resolveMercadoPagoSubscriptionAmount(planId || planName || interval, Number(price) || 0);

        if (!checkoutAmount) {
            return res.status(400).json({
                error: `No se pudo determinar un importe válido para la suscripción. El mínimo es $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}.`,
            });
        }
        const subscriptionPlan = planId || planName || billingCycle || interval || 'pro';
        
        const subscription = await mercadopagoProvider.createSubscription({
            plan: subscriptionPlan,
            payer_email: email,
            userId,
            amount: checkoutAmount,
        });

        if (subscription.success && subscription.init_point) {
            res.json({ 
                subscriptionId: subscription.subscriptionId, 
                init_point: subscription.init_point 
            });
        } else {
            // Fallback: crear preferencia normal
            const description = `Suscripción TradePortal - ${planName}`;
            const preference = await mercadopagoProvider.createPreference({
                amount: checkoutAmount,
                description,
                externalReference: externalRef,
                userId,
                plan: planName,
            });
            res.json({ 
                subscriptionId: preference.id, 
                init_point: preference.init_point,
                isPreference: true
            });
        }
    } catch (error: any) {
        logger.error("[API] MercadoPago subscription error:", error);
        res.status(500).json({ error: error.message });
    }
}

// Community Purchase API
async function createCommunityPurchase(req: express.Request, res: express.Response) {
    try {
        const { userId, communityId, communityName, price, durationDays } = req.body;
        const checkoutAmount = Number(price) || 0;

        if (checkoutAmount < MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT) {
            return res.status(400).json({
                error: `El pago mínimo con MercadoPago es de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}.`,
            });
        }
        
        const description = `Acceso a ${communityName} - ${durationDays} días`;
        
        const preference = await mercadopagoProvider.createPreference({
            amount: checkoutAmount,
            description,
            externalReference: `community_${communityId}_${userId}_${Date.now()}`,
            userId,
            courseId: communityId,
        });

        res.json({ init_point: preference.init_point, preferenceId: preference.id });
    } catch (error: any) {
        logger.error("[API] Community purchase error:", error);
        res.status(500).json({ error: error.message });
    }
}

// Zenobank API Routes
async function createZenobankPayment(req: express.Request, res: express.Response) {
    try {
        const { userId, amount, currency, email, description } = req.body;
        
        const result = await zenobankProvider.processPayment({
            amount,
            currency,
            email,
            userId,
            metadata: { description },
        });

        res.json(result);
    } catch (error: any) {
        logger.error("[API] Zenobank payment error:", error);
        res.status(500).json({ error: error.message });
    }
}

// Types (simplified for server use)
interface Ad {
    id: string;
    titulo: string;
    descripcion: string;
    imagenUrl: string;
    link: string;
    sector: 'sidebar' | 'feed' | 'dashboard' | 'cursos' | 'noticias';
    activo: boolean;
}

interface Publicacion {
    id: string;
    idUsuario: string;
    nombreUsuario: string;
    usuarioManejo: string;
    avatarUsuario: string;
    titulo?: string;
    contenido: string;
    categoria: 'General' | 'Idea' | 'Estrategia' | 'Recurso' | 'Ayuda';
    tiempo: string;
    likes: string[];
    comentarios: any[];
    esAnuncio?: boolean;
    tradingViewUrl?: string;
    tags?: string[];
    par?: string;
    tipo?: 'Compra' | 'Venta' | 'Analisis';
    datosGrafico?: any[];
    encuesta?: any;
    reputationSnapshot?: number;
    badgesSnapshot?: string[];
}

// In-memory database
let posts: Publicacion[] = [];
let ads: Ad[] = [];
let users: any[] = [];
const repoRoot = process.cwd();

type AuroraFindingPayload = {
    findingId: string;
    surfaceId: string;
    surfaceLabel: string;
    route: string;
    priority: "high" | "medium" | "low";
    summary: string;
    content: string;
    files?: string[];
    patchSuggestion?: string;
    improvementPlan?: string;
};

function readFileSafe(relativePath: string): string {
    const full = path.join(repoRoot, relativePath);
    return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function writeFileSafe(relativePath: string, content: string) {
    const full = path.join(repoRoot, relativePath);
    fs.writeFileSync(full, content, "utf8");
}

function mapSurfaceToScope(surfaceId: string): string {
    switch (surfaceId) {
        case "community":
            return "community_feed";
        case "onboarding":
            return "auth_and_onboarding";
        case "creator":
            return "pricing_and_conversion";
        case "admin":
            return "qa_and_release";
        case "profile":
            return "design_system";
        default:
            return "home_and_landing";
    }
}

function suggestOwner(scope: string): string {
    switch (scope) {
        case "community_feed":
            return "AGENT-FEED";
        case "auth_and_onboarding":
            return "AGENT-ONBOARDING";
        case "pricing_and_conversion":
            return "AGENT-REVENUE";
        case "qa_and_release":
            return "AGENT-QA";
        case "design_system":
            return "AGENT-DESIGN";
        default:
            return "unassigned";
    }
}

function normalizeFindingText(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúüñ\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function nextAuroraSupportTaskId(boardMarkdown: string): string {
    const ids = boardMarkdown
        .split(/\r?\n/)
        .filter((line) => line.startsWith("|"))
        .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim())[0])
        .filter((id) => /^AUS-\d+$/.test(id));
    const max = ids.reduce((acc, id) => Math.max(acc, Number(id.replace("AUS-", ""))), 0);
    return `AUS-${String(max + 1).padStart(3, "0")}`;
}

function appendAuroraSupportTask(finding: AuroraFindingPayload) {
    const taskBoardPath = ".agent/workspace/coordination/TASK_BOARD.md";
    const handoffsPath = ".agent/workspace/coordination/HANDOFFS.md";
    const board = readFileSafe(taskBoardPath);
    const handoffs = readFileSafe(handoffsPath);

    const normalizedSummary = normalizeFindingText(finding.summary).slice(0, 140);
    const similarBoardLine = board
        .split(/\r?\n/)
        .find((line) =>
            line.includes(finding.findingId) ||
            (line.includes(finding.surfaceLabel) && normalizeFindingText(line).includes(normalizedSummary.slice(0, 80)))
        );
    const similarHandoff = handoffs
        .split(/\r?\n/)
        .find((line) =>
            line.includes(finding.findingId) ||
            (line.includes(finding.surfaceLabel) && normalizeFindingText(line).includes(normalizedSummary.slice(0, 80)))
        );

    if (similarBoardLine || similarHandoff) {
        const existingTaskId = board
            .split(/\r?\n/)
            .find((line) => line.includes(finding.findingId) || line === similarBoardLine)
            ?.split("|")[1]
            ?.trim();
        return { taskId: existingTaskId || "existing", deduped: true };
    }

    const taskId = nextAuroraSupportTaskId(board);
    const scope = mapSurfaceToScope(finding.surfaceId);
    const owner = suggestOwner(scope);
    const files = (finding.files || []).join(", ") || "por definir";
    const priorityLabel =
        finding.priority === "high" ? "alta" : finding.priority === "medium" ? "media" : "baja";
    const objective = `Revisar hallazgo de Aurora Support en ${finding.surfaceLabel}: ${finding.summary}`;
    const acceptance = `Hallazgo revisado por el equipo, decisión tomada y acción registrada. Finding ${finding.findingId}`;
    const row = `| ${taskId} | todo | ${owner} | ${scope} | ${files} | ${objective} | ${acceptance} |`;
    const updatedBoard = `${board.trimEnd()}\n${row}\n`;
    writeFileSafe(taskBoardPath, updatedBoard);

    const handoffBlock = [
        `## ${taskId} -> HANDOFF`,
        `- De: AURORA-SUPPORT`,
        `- Para: TEAM`,
        `- Fecha: ${new Date().toISOString()}`,
        `- Estado actual: todo`,
        `- Scope: ${scope}`,
        `- Owner sugerido: ${owner}`,
        `- Archivos tocados: ninguno; hallazgo detectado desde panel admin`,
        `- Qué se hizo: Aurora Support auditó la superficie "${finding.surfaceLabel}" (${finding.route}) y generó este hallazgo.`,
        `- Qué falta: revisar, priorizar y ejecutar corrección o mejora.`,
        `- Riesgos: prioridad ${priorityLabel}. ${finding.summary}`,
        `- Cómo validar: reproducir la superficie, revisar el hallazgo y confirmar si requiere fix, mejora o descarte.`,
        `- Mejora sugerida: ${finding.improvementPlan || "sin plan adicional"}`,
        `- Patch sugerido: ${(finding.patchSuggestion || "sin patch sugerido").replace(/\r?\n/g, " ").trim()}`,
        `- Contexto Aurora: ${finding.content.replace(/\r?\n/g, " ").trim()}`,
        `- Finding-ID: ${finding.findingId}`,
        ""
    ].join("\n");
    const updatedHandoffs = `${handoffs.trimEnd()}\n\n${handoffBlock}`;
    writeFileSafe(handoffsPath, updatedHandoffs);

    return { taskId, deduped: false, owner };
}

type ExternalChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

async function callOpenAICompatibleProvider(
    provider: { id: string; label: string; baseUrl?: string; apiKey?: string; defaultModel?: string },
    payload: {
        messages: ExternalChatMessage[];
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
) {
    if (!provider.baseUrl || !provider.apiKey) {
        throw new Error(`Provider ${provider.label} no configurado`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
        const apiResponse = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${provider.apiKey}`,
                ...(provider.id === "openrouter"
                    ? {
                        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
                        "X-Title": "TradePortal AI Room",
                    }
                    : {}),
            },
            body: JSON.stringify({
                model: payload.model || provider.defaultModel,
                messages: payload.messages,
                temperature: payload.temperature ?? 0.3,
                max_tokens: payload.maxTokens ?? 1200,
            }),
        });

        const data = await apiResponse.json().catch(() => ({}));
        if (!apiResponse.ok) {
            throw new Error(data?.error?.message || `${provider.label} respondió ${apiResponse.status}`);
        }

        return {
            provider: provider.label,
            model: data?.model || payload.model || provider.defaultModel || "unknown",
            content: data?.choices?.[0]?.message?.content || "",
            finishReason: data?.choices?.[0]?.finish_reason,
            usage: data?.usage
                ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                }
                : undefined,
        };
    } finally {
        clearTimeout(timeout);
    }
}

async function runExternalAIChat(payload: {
    preferredProvider?: string;
    messages: ExternalChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
}) {
    const preferred = getExternalAIProviderById(payload.preferredProvider);
    const providers = preferred && preferred.available
        ? [preferred]
        : getAvailableExternalAIProviders();

    if (providers.length === 0) {
        throw new Error("No hay proveedores externos de IA configurados.");
    }

    let lastError: unknown = null;

    for (const provider of providers) {
        try {
            return await callOpenAICompatibleProvider(provider, payload);
        } catch (error) {
            lastError = error;
            logger.warn(`[AI Room] Provider ${provider.label} failed, trying next fallback:`, error);
        }
    }

    throw lastError instanceof Error ? lastError : new Error("Fallaron todos los proveedores externos.");
}

async function startServer() {
    const INIT_NVIDIA_AGENTS = process.env.INIT_NVIDIA_AGENTS === 'true';
    
    if (INIT_NVIDIA_AGENTS) {
        logger.info('[Aurora] Inicializando NVIDIA Agents...');
        initAllSkills();
        logger.info('[Aurora] NVIDIA Agents inicializados correctamente');
    } else {
        logger.info('[Aurora] NVIDIA Agents deshabilitados (set INIT_NVIDIA_AGENTS=true para activar)');
    }
    
    const app = express();
    const server = createServer(app);
    const wss = new WebSocketServer({ server });
    const PORT = parseInt(process.env.PORT || '3000', 10);

    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/webhooks/')) {
            return next();
        }
        express.json()(req, res, next);
    });
    app.use(ipGuard);

    // Security headers middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
        // Content Security Policy
        const cspDirectives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://tagging.taxonomics.io https://accounts.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://*.convex.cloud https://*.amazonaws.com https://*.googleusercontent.com https://*.fbusercontent.com https://i.imgur.com https://i.ibb.co https://api.dicebear.com https://*.dicebear.com",
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://api.openweathermap.org https://*.convex.cloud wss://*.convex.cloud ws://localhost:* wss://localhost:*",
            "frame-src 'self' https://www.tradingview.com https://www.youtube.com https://www.instagram.com https://player.vimeo.com",
            "media-src 'self' blob: https://*.convex.cloud",
            "worker-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ];

        res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        next();
    });

    // Security.txt endpoint
    app.get('/.well-known/security.txt', (req: Request, res: Response) => {
        const securityTxt = [
            `Contact: mailto:${process.env.SECURITY_CONTACT_EMAIL || 'security@tradeportal.io'}`,
            `Expires: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}`,
            'Encryption: https://tradeportal.io/.well-known/pgp-key.txt',
            'Preferred-Languages: en, es',
            'Canonical: https://tradeportal.io/.well-known/security.txt',
            'Policy: https://tradeportal.io/security-policy',
            'Acknowledgments: https://tradeportal.io/.well-known/acknowledgments',
        ].join('\r\n');

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.send(securityTxt);
    });

    // Also serve at /security.txt for compatibility
    app.get('/security.txt', (req: Request, res: Response) => {
        res.redirect(301, '/.well-known/security.txt');
    });

    // Simple in-memory metrics and rate limiter for AI relay
    const metrics = {
        aiRequests: 0,
        aiErrors: 0,
        aiPerProvider: {} as Record<string, number>,
    };

    // sliding window per key/ip
    const rateWindows: Map<string, { ts: number[] }> = new Map();
    const RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT_PER_MIN || '60', 10); // default 60 requests per minute

    function checkRateLimit(key: string) {
        const now = Date.now();
        const window = rateWindows.get(key) || { ts: [] };
        // drop older than 60s
        window.ts = window.ts.filter(t => now - t < 60_000);
        if (window.ts.length >= RATE_LIMIT) {
            rateWindows.set(key, window);
            return false;
        }
        window.ts.push(now);
        rateWindows.set(key, window);
        return true;
    }

    // Metrics endpoint for health + basic metrics
    app.get('/health-metrics', (req: Request, res: Response) => {
        res.json({ status: 'ok', metrics, clients: clients.size, requestId: (req as any).requestId });
    });

    // Daily backup endpoints
    const BACKUP_DIR = path.join(process.cwd(), 'backups');
    const BACKUP_RETENTION_DAYS = 3;

    function ensureBackupDir() {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
    }

    function getBackupDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    function cleanupOldBackups() {
        ensureBackupDir();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - BACKUP_RETENTION_DAYS);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup_') && f.endsWith('.json'));

        let deleted = 0;
        for (const file of files) {
            const dateMatch = file.match(/backup_(\d{4}-\d{2}-\d{2})\.json/);
            if (dateMatch && dateMatch[1] < cutoffStr) {
                fs.unlinkSync(path.join(BACKUP_DIR, file));
                deleted++;
                logger.info(`[Backup] Deleted old backup: ${file}`);
            }
        }
        return deleted;
    }

    function listBackups() {
        ensureBackupDir();
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
            .sort()
            .reverse();

        return files.map(f => {
            const stats = fs.statSync(path.join(BACKUP_DIR, f));
            const dateMatch = f.match(/backup_(\d{4}-\d{2}-\d{2})\.json/);
            return {
                filename: f,
                date: dateMatch ? dateMatch[1] : f,
                sizeBytes: stats.size,
                createdAt: stats.mtime.toISOString(),
            };
        });
    }

    // Trigger daily backup — guarda todos los datos de Convex en JSON
    app.post('/api/backup/create', requireInternalAuth, async (req: Request, res: Response) => {
        try {
            ensureBackupDir();
            const convex = convexClient;

            const adminId = (req as any).userId || 'system';

            logger.info('[Backup] Starting daily backup...');

            const profiles = await (convex as any).query(api.backup.getRecentBackups, {});
            const posts = await (convex as any).query(api.backup.getBackupHistory, { itemId: '', itemType: '' });

            const backupData = {
                version: '1.0',
                createdAt: Date.now(),
                createdAtStr: new Date().toISOString(),
                adminId,
                data: {
                    profiles: profiles?.slice?.(0, 500) || [],
                    posts: posts?.slice?.(0, 500) || [],
                }
            };

            const dateStr = getBackupDate();
            const filename = `backup_${dateStr}.json`;
            const filepath = path.join(BACKUP_DIR, filename);

            fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

            const sizeBytes = fs.statSync(filepath).size;
            cleanupOldBackups();

            logger.info(`[Backup] Created: ${filename} (${sizeBytes} bytes)`);

            res.json({
                success: true,
                filename,
                date: dateStr,
                sizeBytes,
                message: `Backup creado: ${filename}`
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error('[Backup] Failed to create backup:', message);
            res.status(500).json({ error: 'Error al crear backup', details: message });
        }
    });

    // List available backups
    app.get('/api/backup/list', requireInternalAuth, (req: Request, res: Response) => {
        try {
            const backups = listBackups();
            res.json({
                backups,
                retentionDays: BACKUP_RETENTION_DAYS,
                backupDir: BACKUP_DIR,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error('[Backup] Failed to list backups:', message);
            res.status(500).json({ error: 'Error al listar backups', details: message });
        }
    });

    // Download a specific backup
    app.get('/api/backup/download/:date', requireInternalAuth, (req: Request, res: Response) => {
        try {
            const { date } = req.params;
            const filename = `backup_${date}.json`;
            const filepath = path.join(BACKUP_DIR, filename);

            if (!fs.existsSync(filepath)) {
                return res.status(404).json({ error: `Backup no encontrado: ${date}` });
            }

            res.download(filepath, filename);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error('[Backup] Failed to download backup:', message);
            res.status(500).json({ error: 'Error al descargar backup', details: message });
        }
    });

    // Get latest backup info
    app.get('/api/backup/latest', requireInternalAuth, (req: Request, res: Response) => {
        try {
            const backups = listBackups();
            const latest = backups[0] || null;

            res.json({
                latest,
                available: backups.length,
                retentionDays: BACKUP_RETENTION_DAYS,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error('[Backup] Failed to get latest backup:', message);
            res.status(500).json({ error: 'Error al obtener backup', details: message });
        }
    });

    // Request ID middleware — trazabilidad de cada request
    app.use((req: Request, res: Response, next: NextFunction) => {
        const requestId = req.headers['x-request-id'] as string || randomUUID();
        (req as any).requestId = requestId;
        res.setHeader('x-request-id', requestId);
        const start = Date.now();
        res.on('finish', () => {
            const ms = Date.now() - start;
            logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`, { requestId });
        });
        next();
    });

    // Auth middleware — protege endpoints que requieren usuario autenticado
    async function requireAuth(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn(`[Auth] Token faltante en ${req.path} desde ${req.ip}`);
            return res.status(401).json({ error: 'Token de autenticación requerido' });
        }
        const token = authHeader.slice(7);
        if (!token || token.length < 10) {
            logger.warn(`[Auth] Token inválido (length: ${token?.length || 0}) en ${req.path}`);
            return res.status(401).json({ error: 'Token inválido' });
        }

        try {
            // JWT verification only — no fallback to userId-as-token
            const decoded = jwt.verify(token, JWT_SECRET_EFFECTIVE) as { userId: string };
            if (!decoded?.userId) {
                logger.warn(`[Auth] JWT sin userId en ${req.path}`);
                return res.status(401).json({ error: 'Token inválido' });
            }

            (req as any).userId = decoded.userId;
            (req as any).authTime = Date.now();
            logger.debug(`[Auth] Acceso autorizado en ${req.path} para usuario ${decoded.userId.slice?.(0, 8) || 'unknown'}`);
            next();
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                logger.warn(`[Auth] Token expirado en ${req.path}`);
                return res.status(401).json({ error: 'Token expirado. Inicia sesión nuevamente.' });
            }
            logger.error('[Auth] Error verificando token', err);
            res.status(401).json({ error: 'Token inválido o expirado' });
        }
    }

    // Internal API auth — protege relay de IA y endpoints internos
    function requireInternalAuth(req: Request, res: Response, next: NextFunction) {
        const sharedKey = process.env.INTERNAL_API_SHARED_KEY;
        if (!sharedKey) {
            return res.status(503).json({ error: 'Servicio no configurado' });
        }
        const requestKey = req.header('x-internal-api-key');
        if (requestKey !== sharedKey) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        next();
    }

    // WebSocket handling with heartbeat
    const clients = new Set<WebSocket>();
    const wsUserMap = new WeakMap<WebSocket, string>(); // Map WS to userId
    const wsHeartbeats = new WeakMap<WebSocket, NodeJS.Timeout>();
    const HEARTBEAT_INTERVAL = 30000;
    const PONG_TIMEOUT = 10000;
    const MAX_PONGS_MISSED = 3;
    const wsPongCount = new WeakMap<WebSocket, number>();
    const wsTimers = new WeakMap<WebSocket, NodeJS.Timeout>();

    function setupClientHeartbeat(ws: WebSocket) {
        const interval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
            } else {
                clearInterval(interval);
            }
        }, HEARTBEAT_INTERVAL);
        wsHeartbeats.set(ws, interval);
    }

    async function verifyWSToken(token: string): Promise<{ valid: boolean; userId?: string }> {
        if (!token) return { valid: false };
        
        // JWT verification only — no fallback to userId-as-token
        try {
            const decoded = jwt.verify(token, JWT_SECRET_EFFECTIVE) as { userId: string };
            if (decoded?.userId) {
                return { valid: true, userId: decoded.userId };
            }
        } catch (err) {
            logger.debug(`[WS Auth] JWT verification failed: ${err instanceof Error ? err.message : String(err)}`);
        }

        return { valid: false };
    }

    wss.on('connection', async (ws, req) => {
        // SEC-010: Validate token from query param or upgrade headers
        const url = new URL(req.url || '', 'ws://localhost');
        const token = url.searchParams.get('token');
        
        if (!token) {
            logger.warn('[WS] Conexión rechazada: token faltante');
            ws.close(4001, 'Authentication required');
            return;
        }

        const { valid, userId } = await verifyWSToken(token);
        if (!valid || !userId) {
            logger.warn('[WS] Conexión rechazada: token inválido');
            ws.close(4002, 'Invalid token');
            return;
        }

        clients.add(ws);
        wsUserMap.set(ws, userId);
        wsPongCount.set(ws, 0);
        logger.info(`[WS] Cliente conectado: ${userId}. Total: ${clients.size}`);

        setupClientHeartbeat(ws);

        // SEC-002: Only send minimal init data, not all posts/ads/users
        ws.send(JSON.stringify({ 
            type: 'init', 
            connected: true,
            userId: userId,
            serverTime: Date.now()
        }));

        ws.on('pong', () => {
            wsPongCount.set(ws, 0); // Reset missed count on pong
            logger.debug(`[WS] Pong recibido de ${userId}`);
        });

        ws.on('message', (message) => {
            try {
                const event = JSON.parse(message.toString());
                if (event.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                    return;
                }
                
                // SEC-010: Associate event with authenticated user
                event.userId = userId;
                handleEvent(event, ws);
            } catch (err) {
                logger.error('[WS] Error parseando mensaje:', err);
            }
        });

        ws.on('error', (error) => {
            logger.error(`[WS] Error en cliente ${userId}:`, error);
        });

        ws.on('close', () => {
            clients.delete(ws);
            const interval = wsHeartbeats.get(ws);
            if (interval) clearInterval(interval);
            const timer = wsTimers.get(ws);
            if (timer) clearTimeout(timer);
            logger.info(`[WS] Cliente desconectado: ${userId}. Total: ${clients.size}`);
        });
    });

    function broadcast(event: any, exclude?: WebSocket) {
        const payload = JSON.stringify(event);
        clients.forEach((client) => {
            if (client !== exclude && client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }

    function handleEvent(event: any, sender: WebSocket) {
        switch (event.type) {
            case 'post:create':
                posts.unshift(event.data);
                broadcast({ type: 'post:created', data: event.data });
                break;
            case 'post:update':
                const pIndex = posts.findIndex(p => p.id === event.data.id);
                if (pIndex !== -1) {
                    posts[pIndex] = event.data;
                    broadcast({ type: 'post:updated', data: event.data });
                }
                break;
            case 'post:delete':
                posts = posts.filter(p => p.id !== event.data.id);
                broadcast({ type: 'post:deleted', data: event.data });
                break;
            case 'ad:save':
                const aIndex = ads.findIndex(a => a.id === event.data.id);
                if (aIndex !== -1) {
                    ads[aIndex] = event.data;
                } else {
                    ads.push(event.data);
                }
                broadcast({ type: 'ad:saved', data: event.data });
                break;
            case 'ad:delete':
                ads = ads.filter(a => a.id !== event.data.id);
                broadcast({ type: 'ad:deleted', data: event.data });
                break;
            case 'user:save':
                const uIndex = users.findIndex(u => u.id === event.data.id);
                if (uIndex !== -1) {
                    users[uIndex] = event.data;
                } else {
                    users.push(event.data);
                }
                broadcast({ type: 'user:saved', data: event.data });
                break;
        }
    }

    // API Routes
    app.get("/api/health", (req: Request, res: Response) => {
        res.json({ status: "ok", clients: clients.size, requestId: (req as any).requestId });
    });

    app.get("/api/ai/providers", (req, res) => {
        const providers = getExternalAIProviders().map(({ apiKey, baseUrl, ...provider }) => provider);
        res.json({ providers });
    });

    // Notification Click Tracking
    app.post("/api/notification-click", express.json(), handleNotificationClick);

    // MercadoPago Routes
    app.post("/api/mercadopago/preference", express.json(), requireAuth, createMercadoPagoPreference);
    app.post("/api/mercadopago/subscription", express.json(), requireAuth, createMercadoPagoSubscription);
    app.post("/api/mercadopago/community", express.json(), requireAuth, createCommunityPurchase);

    // Zenobank Routes
    app.post("/api/zenobank/payment", express.json(), requireAuth, createZenobankPayment);

    // Payment Webhooks
    app.post("/webhooks/mercadopago", express.raw({ type: 'application/json' }), handleMercadoPagoWebhook);
    app.post("/webhooks/zenobank", express.raw({ type: 'application/json' }), handleZenobankWebhook);

    // Instagram API Routes
    const convex = convexClient;

    app.get("/api/instagram/auth-url", async (req, res) => {
        try {
            const userId = req.query.userId as string;
            // @ts-ignore - instagram module endpoints not generated in Convex API
            let authUrl = await convex.query(api.instagram.accounts.getInstagramAuthUrl, {});
            
            if (userId) {
                const urlObj = new URL(authUrl);
                urlObj.searchParams.set('state', userId);
                authUrl = urlObj.toString();
            }
            
            res.json({ url: authUrl });
        } catch (error: any) {
            logger.error("[Instagram API] Auth URL error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/instagram/callback", async (req, res) => {
        const { code, state: userId } = req.query;
        
        if (!code) {
            return res.redirect("/instagram?error=no_code");
        }

        try {
            logger.debug("[Instagram Callback] Exchanging code for token...");
            // @ts-ignore - instagram module endpoints not generated in Convex API
            const { accessToken } = await convex.action(api.instagram.accounts.exchangeCodeForToken, {
                code: code as string 
            });

            logger.debug("[Instagram Callback] Fetching business account details...");
            // @ts-ignore
            const accountInfo = await convex.action(api.instagram.accounts.getInstagramBusinessAccount, { 
                accessToken 
            });

            logger.debug("[Instagram Callback] Connecting account to user:", userId);
            if (!userId) {
                throw new Error("Missing userId in Instagram OAuth callback. Please authenticate first.");
            }
            // @ts-ignore
            await convex.mutation(api.instagram.accounts.connectInstagramAccount, {
                userId: userId as string,
                instagramId: accountInfo.instagramId,
                username: accountInfo.username,
                accessToken,
                pageAccessToken: accountInfo.pageAccessToken,
                profilePicture: accountInfo.profilePicture,
                biography: accountInfo.biography,
                website: accountInfo.website,
                followers: accountInfo.followers,
                isBusiness: true,
            });

            res.redirect("/instagram?connected=true");
        } catch (error: any) {
        logger.error('Instagram callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/instagram/dashboard?error=${encodeURIComponent(error.message)}`);
    }
});

app.post('/api/instagram/publish', requireAuth, async (req, res) => {
    const { userId, postId } = req.body;
    
    if (!userId || !postId) {
        return res.status(400).json({ error: 'Missing userId or postId' });
    }

    try {
        logger.info(`[INSTAGRAM] Publishing post ${postId} for user ${userId}`);
        
        // 1. Get post details from Convex
        // @ts-ignore - instagram module endpoints not generated in Convex API
        const post = await convex.query(api.instagram.posts.getPostById, { postId });
        if (!post) throw new Error('Post not found');

        // 2. Get account details
        // @ts-ignore - instagram module endpoints not generated in Convex API
        const accounts = await convex.query(api.instagram.accounts.getUserInstagramAccounts, { userId });
        const account = accounts.find((a: any) => a._id === (post.accountId || post.instagramAccountId));
        if (!account) throw new Error('Instagram account not found');

        // Decrypt/Get token
        // In this mock/simplified version, we store it base64 encoded
        const accessToken = Buffer.from(account.accessToken, 'base64').toString('utf-8');

        // 3. Call Instagram API via our lib
        const { instagramApi } = await import('./lib/instagram/api');
        
        let publishResult;
        if (post.videoUrl) {
            publishResult = await instagramApi.publishVideo(
                account.instagramId,
                accessToken,
                post.videoUrl,
                post.caption
            );
        } else {
            publishResult = await instagramApi.publishImage(
                account.instagramId,
                accessToken,
                post.imageUrl,
                post.caption
            );
        }

        // 4. Mark as published in Convex
        // @ts-ignore - instagram module endpoints not generated in Convex API
        await convex.mutation(api.instagram.posts.markPostPublished, {
            postId,
            instagramPostId: publishResult.id,
            publishedAt: Date.now()
        });

        res.json({ success: true, result: publishResult });
    } catch (error: any) {
        logger.error('Instagram publish error:', error);
        
        // Mark as failed in Convex
        try {
            // @ts-ignore - instagram module endpoints not generated in Convex API
            await convex.mutation(api.instagram.posts.markPostFailed, {
                postId,
                errorMessage: error.message
            });
        } catch (innerError) {
            logger.error('Failed to mark post as failed:', innerError);
        }

        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai/generate-caption', requireAuth, async (req, res) => {
    const { topic, context, language = 'es' } = req.body;
    
    try {
        const { contentGenerator } = await import('./lib/instagram/contentGenerator');
        const result = await contentGenerator.generateCaption({
            topic,
            ...context
        }, language);
        
        res.json({ caption: result });
    } catch (error: any) {
        logger.error('AI generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// YouTube Psicotrading Extraction — server-side to protect API key
app.post('/api/youtube/extract', requireAuth, async (req, res) => {
    const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
        return res.status(503).json({ error: 'YouTube API key not configured' });
    }

    try {
        const { extractAllPsychotradingContent } = await import('./services/youtube/psychotradingExtractor');
        const videos = await extractAllPsychotradingContent(YOUTUBE_API_KEY);
        res.json({ success: true, videos, count: videos.length });
    } catch (error: any) {
        logger.error('YouTube extraction error:', error);
        res.status(500).json({ error: error.message || 'Extraction failed' });
    }
});

// ===========================================
// AI Relay - Server-side API keys (no client exposure)
// ===========================================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;

app.post('/api/ai/completion', requireAuth, async (req, res) => {
    const { provider, model, messages, temperature, maxTokens } = req.body;
    
    if (!provider || !model || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'provider, model, and messages are required' });
    }
    
    try {
        let apiResponse: globalThis.Response;
        
        switch (provider) {
            case 'openai':
                if (!OPENAI_API_KEY) {
                    return res.status(503).json({ error: 'OpenAI not configured server-side' });
                }
                apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: temperature ?? 0.7,
                        max_tokens: maxTokens ?? 2048,
                    }),
                });
                break;
                
            case 'anthropic':
                if (!ANTHROPIC_API_KEY) {
                    return res.status(503).json({ error: 'Anthropic not configured server-side' });
                }
                const systemMessage = messages.find((m: any) => m.role === 'system');
                const otherMessages = messages.filter((m: any) => m.role !== 'system');
                apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01',
                    },
                    body: JSON.stringify({
                        model,
                        messages: otherMessages,
                        system: systemMessage?.content,
                        max_tokens: maxTokens ?? 1024,
                        temperature: temperature ?? 0.7,
                    }),
                });
                break;
                
            case 'google':
                if (!GOOGLE_API_KEY) {
                    return res.status(503).json({ error: 'Google not configured server-side' });
                }
                apiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: messages.map((m: any) => ({
                                role: m.role === 'assistant' ? 'model' : 'user',
                                parts: [{ text: m.content }],
                            })),
                            generationConfig: {
                                temperature: temperature ?? 0.7,
                                maxOutputTokens: maxTokens ?? 2048,
                            },
                        }),
                    }
                );
                break;
                
            default:
                return res.status(400).json({ error: `Unsupported provider: ${provider}` });
        }
        
        const data = await apiResponse.json();
        res.json(data);
    } catch (error: any) {
        logger.error('[AI Completion] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================
// ElevenLabs Text-to-Speech
// ===========================================
app.post('/api/elevenlabs/text-to-speech', requireAuth, async (req, res) => {
    const { text, voiceId, modelId, voiceSettings } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'text is required' });
    }

    if (!ELEVENLABS_API_KEY) {
        return res.status(503).json({ error: 'ElevenLabs not configured server-side' });
    }

    try {
        const body = {
            text,
            model_id: modelId || 'eleven_multilingual_v2',
            voice_settings: {
                stability: voiceSettings?.stability ?? 0.5,
                similarity_boost: voiceSettings?.similarityBoost ?? 0.75,
                style: voiceSettings?.style ?? 0.5,
                use_speaker_boost: voiceSettings?.useSpeakerBoost ?? true,
            },
        };

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'EXAVITQu4vr4xnSDxMaL'}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `ElevenLabs error: ${response.status}`);
        }

        const data = await response.json();

        logger.info('[ElevenLabs] TTS generated', {
            voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL',
            modelId: modelId || 'eleven_multilingual_v2',
            textLength: text.length,
        });

        res.json({
            audioUrl: data.preview_url,
            duration: data.duration || Math.ceil(text.split(' ').length / 3),
            voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL',
            modelId: modelId || 'eleven_multilingual_v2',
        });
    } catch (error: any) {
        logger.error('[ElevenLabs] TTS failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/elevenlabs/text-to-speech/stream', requireAuth, async (req, res) => {
    const { text, voiceId, modelId, voiceSettings } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'text is required' });
    }

    if (!ELEVENLABS_API_KEY) {
        return res.status(503).json({ error: 'ElevenLabs not configured server-side' });
    }

    try {
        const body = {
            text,
            model_id: modelId || 'eleven_multilingual_v2',
            voice_settings: {
                stability: voiceSettings?.stability ?? 0.5,
                similarity_boost: voiceSettings?.similarityBoost ?? 0.75,
                style: voiceSettings?.style ?? 0.5,
                use_speaker_boost: voiceSettings?.useSpeakerBoost ?? true,
            },
        };

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'EXAVITQu4vr4xnSDxMaL'}/stream`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `ElevenLabs error: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        logger.info('[ElevenLabs] TTS stream generated', {
            voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL',
            size: buffer.byteLength,
        });

        res.json({
            audioBase64: base64,
            audioUrl: `data:audio/mpeg;base64,${base64}`,
            duration: Math.ceil(text.split(' ').length / 3),
            voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL',
        });
    } catch (error: any) {
        logger.error('[ElevenLabs] TTS stream failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/elevenlabs/voices', requireAuth, async (req, res) => {
    if (!ELEVENLABS_API_KEY) {
        return res.status(503).json({ error: 'ElevenLabs not configured server-side' });
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'Accept': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error: any) {
        logger.error('[ElevenLabs] Get voices failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================
// Fish.Audio Text-to-Speech (Alternative to ElevenLabs)
// ===========================================
app.post('/api/fishaudio/tts', requireAuth, async (req, res) => {
    const { text, model, reference_audio, reference_text, language, speed } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'text is required' });
    }

    if (!FISH_AUDIO_API_KEY) {
        return res.status(503).json({ error: 'Fish.Audio not configured server-side' });
    }

    try {
        const body: Record<string, unknown> = {
            text,
            model: model || 'any',
        };

        if (reference_audio) body.reference_audio = reference_audio;
        if (reference_text) body.reference_text = reference_text;
        if (language) body.language = language;
        if (speed !== undefined) body.speed = speed;

        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || error.message || `Fish.Audio error: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        logger.info('[Fish.Audio] TTS generated', {
            model: model || 'any',
            textLength: text.length,
            size: buffer.byteLength,
        });

        res.json({
            audioBase64: base64,
            audioUrl: `data:audio/mpeg;base64,${base64}`,
            duration: Math.ceil(text.split(' ').length / 4),
            model: model || 'any',
        });
    } catch (error: any) {
        logger.error('[Fish.Audio] TTS failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/fishaudio/clone', requireAuth, async (req, res) => {
    const { audio_url, name } = req.body;

    if (!audio_url || !name) {
        return res.status(400).json({ error: 'audio_url and name are required' });
    }

    if (!FISH_AUDIO_API_KEY) {
        return res.status(503).json({ error: 'Fish.Audio not configured server-side' });
    }

    try {
        const response = await fetch('https://api.fish.audio/v1/voice/clone', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audio_url,
                name,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || error.message || `Fish.Audio error: ${response.status}`);
        }

        const data = await response.json();

        logger.info('[Fish.Audio] Voice cloned', {
            voiceId: data.voice_id,
            name,
        });

        res.json(data);
    } catch (error: any) {
        logger.error('[Fish.Audio] Voice clone failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/fishaudio/models', requireAuth, async (req, res) => {
    if (!FISH_AUDIO_API_KEY) {
        return res.status(503).json({ error: 'Fish.Audio not configured server-side' });
    }

    try {
        const response = await fetch('https://api.fish.audio/v1/model', {
            headers: {
                'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Fish.Audio error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error: any) {
        logger.error('[Fish.Audio] Get models failed:', error);
        res.status(500).json({ error: error.message });
    }
});

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

app.post('/api/huggingface/flux', requireAuth, async (req, res) => {
    if (!HUGGINGFACE_API_KEY) {
        return res.status(503).json({ error: 'HuggingFace not configured server-side' });
    }

    const { prompt, width = 1024, height = 1024, num_inference_steps = 4, guidance_scale = 3.5 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    width,
                    height,
                    num_inference_steps,
                    guidance_scale,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        
        res.json({ 
            image: `data:image/png;base64,${base64}`,
            success: true 
        });
    } catch (error: any) {
        logger.error('[HuggingFace FLUX] Generation failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/huggingface/infer', requireAuth, async (req, res) => {
    try {
        const { model, inputs, parameters, options } = req.body;
        const { huggingface } = await import('./lib/ai/huggingface');
        
        const result = await huggingface.infer({
            model,
            inputs,
            parameters,
            options,
        });

        res.json(result);
    } catch (error: any) {
        logger.error('[HuggingFace Inference] failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/upload/image', requireAuth, async (req, res) => {
    const { image, imageUrl } = req.body;
    
    if (!image && !imageUrl) {
        return res.status(400).json({ error: 'image (base64) or imageUrl is required' });
    }
    
    if (!IMGBB_API_KEY) {
        return res.status(503).json({ error: 'ImgBB not configured server-side' });
    }
    
    try {
        let imageData = image;
        
        if (imageUrl && !image) {
            const fetched = await fetch(imageUrl);
            const buffer = await fetched.arrayBuffer();
            imageData = Buffer.from(buffer).toString('base64');
        }
        
        const formData = new FormData();
        formData.append('image', imageData);
        
        const apiResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });
        
        const data = await apiResponse.json();
        
        if (apiResponse.ok && data?.data?.url) {
            res.json({ url: data.data.url });
        } else {
            res.status(500).json({ error: data?.error?.message || 'Upload failed' });
        }
    } catch (error: any) {
        logger.error('[Image Upload] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai/external/chat', express.json(), requireInternalAuth, async (req, res) => {
    try {
        const { preferredProvider, messages, model, temperature, maxTokens } = req.body || {};

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        // Rate limiting: use internal key or IP as bucket
        const bucket = req.header('x-internal-api-key') || (req.ip || req.connection.remoteAddress) || 'anon';
        if (!checkRateLimit(bucket)) {
            logger.warn('[AI Room] Rate limit exceeded for', bucket);
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

        metrics.aiRequests++;

        const result = await runExternalAIChat({
            preferredProvider,
            messages,
            model,
            temperature,
            maxTokens,
        });

        // attribution per provider
        if (result && (result as any).provider) {
            const p = (result as any).provider;
            metrics.aiPerProvider[p] = (metrics.aiPerProvider[p] || 0) + 1;
        }

        res.json(result);
    } catch (error: any) {
        logger.error('[AI Room] External chat failed:', error);
        metrics.aiErrors++;
        res.status(500).json({ error: error?.message || 'External AI chat failed' });
    }
});

app.post('/api/admin/aurora/chat', express.json(), async (req, res) => {
    try {
        const { preferredProvider, messages, model, temperature, maxTokens } = req.body || {};

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        const bucket = `aurora-admin:${(req.ip || req.connection.remoteAddress) || 'anon'}`;
        if (!checkRateLimit(bucket)) {
            logger.warn('[Aurora Support] Rate limit exceeded for', bucket);
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

        metrics.aiRequests++;

        const result = await runExternalAIChat({
            preferredProvider,
            messages,
            model,
            temperature,
            maxTokens,
        });

        if (result && (result as any).provider) {
            const p = (result as any).provider;
            metrics.aiPerProvider[p] = (metrics.aiPerProvider[p] || 0) + 1;
        }

        res.json(result);
    } catch (error: any) {
        logger.error('[Aurora Support] Admin chat failed:', error);
        metrics.aiErrors++;
        res.status(500).json({ error: error?.message || 'Aurora Support no pudo completar la auditoría.' });
    }
});

app.post('/api/admin/aurora/findings/report', express.json(), async (req, res) => {
    try {
        const payload = req.body as AuroraFindingPayload;
        if (!payload?.findingId || !payload?.surfaceId || !payload?.surfaceLabel || !payload?.summary || !payload?.content) {
            return res.status(400).json({ error: 'Payload incompleto para reportar hallazgo de Aurora.' });
        }

        const result = appendAuroraSupportTask(payload);
        res.json({
            ok: true,
            taskId: result.taskId,
            deduped: result.deduped,
            owner: result.owner || null,
        });
    } catch (error: any) {
        logger.error('[Aurora Support] Failed to report finding to coordination:', error);
        res.status(500).json({ error: error?.message || 'No se pudo reportar el hallazgo a la mesa de trabajo.' });
    }
});

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static("dist"));
        app.get("*", (req, res) => {
            res.sendFile("dist/index.html", { root: "." });
        });
    }

    server.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server running on http://0.0.0.0:${PORT}`);
        logger.info(`NVIDIA Agents disponibles: ${Object.keys(nvidiaAgents).join(', ')}`);
    });
}

startServer().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});
