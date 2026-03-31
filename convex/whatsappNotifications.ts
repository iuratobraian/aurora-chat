import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://api.whatsapp.com/v1";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
  text?: { body: string };
}

async function sendWhatsAppMessage(to: string, message: WhatsAppMessage): Promise<boolean> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("WhatsApp credentials not configured");
    return false;
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("WhatsApp API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return false;
  }
}

export const sendMembershipReminder = internalAction({
  args: {
    phoneNumber: v.string(),
    userName: v.string(),
    daysUntilExpiry: v.number(),
    planName: v.string(),
  },
  handler: async (_, args) => {
    const { phoneNumber, userName, daysUntilExpiry, planName } = args;
    
    const templateBody = daysUntilExpiry <= 1
      ? `Hola {{1}}, tu membresía *{{2}}* vence *mañana*. 🎯 ¡Renueva ahora para no perder el acceso!`
      : `Hola {{1}}, tu membresía *{{2}}* vence en *{{3}} días*. 🔄 ¡Renueva antes de que expire!`;

    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "membership_reminder",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: userName },
              { type: "text", text: planName },
              { type: "text", text: daysUntilExpiry.toString() },
            ],
          },
        ],
      },
    };

    const success = await sendWhatsAppMessage(phoneNumber, message);
    console.log(`Membership reminder sent to ${phoneNumber}: ${success}`);
    return success;
  },
});

export const sendCourseCompletion = internalAction({
  args: {
    phoneNumber: v.string(),
    userName: v.string(),
    courseName: v.string(),
  },
  handler: async (_, args) => {
    const { phoneNumber, userName, courseName } = args;

    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "course_completion",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: userName },
              { type: "text", text: courseName },
            ],
          },
        ],
      },
    };

    const success = await sendWhatsAppMessage(phoneNumber, message);
    console.log(`Course completion message sent to ${phoneNumber}: ${success}`);
    return success;
  },
});

export const sendDiploma = internalAction({
  args: {
    phoneNumber: v.string(),
    userName: v.string(),
    courseName: v.string(),
    diplomaUrl: v.string(),
  },
  handler: async (_, args) => {
    const { phoneNumber, userName, courseName, diplomaUrl } = args;

    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "diploma_notification",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: userName },
              { type: "text", text: courseName },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              { type: "text", text: diplomaUrl },
            ],
          },
        ],
      },
    };

    const success = await sendWhatsAppMessage(phoneNumber, message);
    console.log(`Diploma notification sent to ${phoneNumber}: ${success}`);
    return success;
  },
});

export const sendWelcomeMessage = internalAction({
  args: {
    phoneNumber: v.string(),
    userName: v.string(),
  },
  handler: async (_, args) => {
    const { phoneNumber, userName } = args;

    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: {
        body: `¡Bienvenido a TradeHub, ${userName}! 🚀\n\n` +
          `Estás a punto de descubrir el mundo del trading profesional.\n\n` +
          `📊 *Herramientas de análisis*\n` +
          `🎯 *Señales en vivo*\n` +
          `👥 *Comunidad activa*\n\n` +
          `¡Empieza a operar con inteligencia!`,
      },
    };

    const success = await sendWhatsAppMessage(phoneNumber, message);
    console.log(`Welcome message sent to ${phoneNumber}: ${success}`);
    return success;
  },
});

export const sendCustomMessage = internalAction({
  args: {
    phoneNumber: v.string(),
    message: v.string(),
  },
  handler: async (_, args) => {
    const { phoneNumber, message } = args;

    const whatsAppMessage: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: message },
    };

    const success = await sendWhatsAppMessage(phoneNumber, whatsAppMessage);
    console.log(`Custom message sent to ${phoneNumber}: ${success}`);
    return success;
  },
});
