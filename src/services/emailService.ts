import sgMail from '@sendgrid/mail';
import logger from '../utils/logger';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailData {
  userName: string;
  email: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  planName?: string;
  courseName?: string;
  date: string;
}

export async function sendConfirmationEmail(to: string, data: EmailData): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('SendGrid API key not configured');
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    await sgMail.send({
      to,
      from: 'noreply@tradeportal.com',
      subject: 'Confirmación de pago - TradeShare',
      html: templatePagoConfirmado(data),
    });

    return { success: true };
  } catch (error: any) {
    logger.error('SendGrid error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendSubscriptionEmail(to: string, data: EmailData): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('SendGrid API key not configured');
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    await sgMail.send({
      to,
      from: 'noreply@tradeportal.com',
      subject: 'Bienvenido a TradeShare PRO - Confirmación de suscripción',
      html: templateSuscripcionConfirmada(data),
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendPaymentFailedEmail(to: string, data: { userName: string; email: string; planName: string; error: string }): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    await sgMail.send({
      to,
      from: 'noreply@tradeportal.com',
      subject: 'Pago fallido - TradeShare',
      html: templatePagoFallido(data),
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function templatePagoConfirmado(data: EmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(90deg, #00d4ff, #7b2ff7); padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; color: #fff; }
        .content { padding: 40px 30px; }
        .success-icon { font-size: 60px; text-align: center; margin-bottom: 20px; }
        .title { font-size: 24px; text-align: center; color: #00d4ff; margin-bottom: 30px; }
        .detail-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .label { color: #888; }
        .value { color: #fff; font-weight: 600; }
        .amount { font-size: 32px; color: #00ff88; text-align: center; margin: 30px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TRADESHARE</h1>
        </div>
        <div class="content">
          <div class="success-icon">✅</div>
          <h2 class="title">¡Pago Confirmado!</h2>
          <p style="text-align: center; color: #888;">Hola ${data.userName}, tu pago ha sido procesado exitosamente.</p>
          
          <div class="amount">${data.currency} ${data.amount.toFixed(2)}</div>
          
          <div class="detail-row">
            <span class="label">ID de Transacción</span>
            <span class="value">${data.transactionId}</span>
          </div>
          <div class="detail-row">
            <span class="label">Método de Pago</span>
            <span class="value">${data.paymentMethod}</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha</span>
            <span class="value">${data.date}</span>
          </div>
          ${data.planName ? `
          <div class="detail-row">
            <span class="label">Plan</span>
            <span class="value">${data.planName}</span>
          </div>
          ` : ''}
          ${data.courseName ? `
          <div class="detail-row">
            <span class="label">Curso</span>
            <span class="value">${data.courseName}</span>
          </div>
          ` : ''}
          
          <p style="text-align: center; margin-top: 30px; color: #888;">
            Recibirás acceso inmediato a tu ${data.planName ? 'plan' : 'curso'} en TradeShare.
          </p>
        </div>
        <div class="footer">
          TradeShare © 2025 | Este es un email automático, no respondas a este mensaje.
        </div>
      </div>
    </body>
    </html>
  `;
}

function templateSuscripcionConfirmada(data: EmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(90deg, #00ff88, #00d4ff); padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; color: #0a0a0a; }
        .content { padding: 40px 30px; }
        .crown { font-size: 60px; text-align: center; margin-bottom: 20px; }
        .title { font-size: 24px; text-align: center; color: #00ff88; margin-bottom: 30px; }
        .plan-badge { display: inline-block; background: linear-gradient(90deg, #7b2ff7, #f72); padding: 10px 30px; border-radius: 30px; font-size: 20px; font-weight: bold; margin: 20px 0; }
        .benefits { background: rgba(0,212,255,0.1); border-radius: 12px; padding: 20px; margin: 20px 0; }
        .benefit { padding: 8px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TRADESHARE PRO</h1>
        </div>
        <div class="content">
          <div class="crown">👑</div>
          <h2 class="title">¡Bienvenido/a, ${data.userName}!</h2>
          
          <div style="text-align: center;">
            <span class="plan-badge">${data.planName?.toUpperCase()}</span>
          </div>
          
          <p style="text-align: center; color: #888;">Tu suscripción ha sido activada exitosamente.</p>
          
          <div class="benefits">
            <div class="benefit">✓ Acceso a herramientas premium de trading</div>
            <div class="benefit">✓ Análisis en tiempo real</div>
            <div class="benefit">✓ Comunidad VIP</div>
            <div class="benefit">✓ Contenido exclusivo</div>
          </div>
          
          <p style="text-align: center; color: #888; margin-top: 20px;">
            Transaction ID: <strong>${data.transactionId}</strong><br>
            Fecha: ${data.date}
          </p>
        </div>
        <div class="footer">
          TradeShare © 2025 | Este es un email automático, no respondas a este mensaje.
        </div>
      </div>
    </body>
    </html>
  `;
}

function templatePagoFallido(data: { userName: string; email: string; planName: string; error: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(90deg, #ff4444, #ff6b6b); padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; color: #fff; }
        .content { padding: 40px 30px; }
        .error-icon { font-size: 60px; text-align: center; margin-bottom: 20px; }
        .title { font-size: 24px; text-align: center; color: #ff4444; margin-bottom: 30px; }
        .error-box { background: rgba(255,68,68,0.1); border: 1px solid #ff4444; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; background: linear-gradient(90deg, #00d4ff, #7b2ff7); color: #fff; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TRADESHARE</h1>
        </div>
        <div class="content">
          <div class="error-icon">⚠️</div>
          <h2 class="title">Pago No Procesado</h2>
          
          <p style="text-align: center; color: #888;">Hola ${data.userName}, tu pago no pudo ser procesado.</p>
          
          <div class="error-box">
            <p><strong>Razón:</strong> ${data.error}</p>
            <p><strong>Plan:</strong> ${data.planName}</p>
          </div>
          
          <p style="text-align: center; color: #888;">
            Por favor intenta nuevamente o contacta a soporte si el problema persiste.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.VITE_APP_URL}/billing" class="btn">Reintentar Pago</a>
          </div>
        </div>
        <div class="footer">
          TradeShare © 2025 | Este es un email automático, no respondas a este mensaje.
        </div>
      </div>
    </body>
    </html>
  `;
}
