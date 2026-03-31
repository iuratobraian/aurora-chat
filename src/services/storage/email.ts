import { Usuario } from '../../types';
import logger from '../../utils/logger';

export const sendBrandEmail = async ({ to, nombre, subject, body }: { to: string; nombre: string; subject: string; body: string }): Promise<boolean> => {
    const serviceId = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID;
    const templateId = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !publicKey) {
        logger.warn('[EMAIL] EmailJS not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in .env');
        return false;
    }

    try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                template_params: {
                    to_email: to,
                    to_name: nombre,
                    subject,
                    message: body,
                    from_name: 'TradeShare',
                    reply_to: 'noreply@tradeshare.io'
                }
            })
        });
        return res.ok;
    } catch (err) {
        logger.error('[EMAIL] Error sending email:', err);
        return false;
    }
};

export const sendWelcomeEmail = async (user: Usuario): Promise<boolean> => {
    if (!user.email) return false;
    return sendBrandEmail({
        to: user.email,
        nombre: user.nombre,
        subject: '¡Bienvenido a TradeShare Ecosystem! 🚀',
        body: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f18;color:#fff;border-radius:16px;overflow:hidden">
                <div style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:40px 32px;text-align:center">
                    <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:-1px">TradeShare<br><span style="color:#93c5fd">Ecosystem</span></h1>
                    <p style="margin:8px 0 0;opacity:.8;font-size:12px;letter-spacing:3px;text-transform:uppercase">Trading Institucional</p>
                </div>
                <div style="padding:40px 32px">
                    <h2 style="font-size:22px;font-weight:900;margin:0 0 16px">¡Hola ${user.nombre}! 👋</h2>
                    <p style="color:#94a3b8;line-height:1.6">Tu cuenta en TradeShare ha sido creada exitosamente. Ya puedes acceder a análisis institucionales, el feed en vivo, cursos exclusivos y mucho más.</p>
                    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:24px 0">
                        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:700">Tu usuario</p>
                        <p style="margin:0;font-size:18px;font-weight:900;color:#3b82f6">@${user.usuario}</p>
                    </div>
                    <a href="https://tradeshare.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:1px;text-transform:uppercase">Ingresar a la Plataforma →</a>
                </div>
                <div style="padding:20px 32px;border-top:1px solid #1e293b;text-align:center">
                    <p style="margin:0;font-size:11px;color:#475569">TradeShare Ecosystem · Plataforma de Trading Institucional<br>Si no te registraste, ignora este mensaje.</p>
                </div>
            </div>
        `
    });
};
