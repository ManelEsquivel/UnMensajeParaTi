// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain'; // Importamos el cerebro

export default async function handler(req, res) {
  // 1. VERIFICACIÓN DEL WEBHOOK (GET)
  // Esto es lo primero que hará WhatsApp para confirmar que tu servidor existe.
  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN; // Define esto en tu .env

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Token incorrecto' });
      }
    }
  }

  // 2. RECEPCIÓN DE MENSAJES (POST)
  if (req.method === 'POST') {
    const body = req.body;

    // Verificamos que sea un evento de WhatsApp
    if (body.object === 'whatsapp_business_account') {
      
      // Iteramos sobre las entradas (normalmente solo una)
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          if (value.messages && value.messages.length > 0) {
            const messageObj = value.messages[0];
            const from = messageObj.from; // Número del usuario (ej: 34600123123)
            const messageType = messageObj.type;

            // Solo procesamos texto por ahora
            if (messageType === 'text') {
              const messageBody = messageObj.text.body;
              console.log(`📩 Mensaje recibido de ${from}: ${messageBody}`);

              // --- LLAMAMOS AL CEREBRO DE LA BODA 🧠 ---
              const aiReplyRaw = await obtenerRespuestaBoda(messageBody);

              // --- ENVIAMOS LA RESPUESTA A WHATSAPP ---
              await enviarMensajeWhatsApp(from, aiReplyRaw);
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.status(404).send('No es un evento de WhatsApp API');
    }
  }

  return res.status(405).send('Método no permitido');
}

// --- FUNCIÓN AUXILIAR PARA ENVIAR A META ---
async function enviarMensajeWhatsApp(to, text) {
  const token = process.env.WHATSAPP_API_TOKEN; // Tu Token de Meta
  const phoneId = process.env.WHATSAPP_PHONE_ID; // Tu ID de número de teléfono de Meta

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: text }, 
    // Nota: WhatsApp usa Markdown simple (*negrita*, _cursiva_), 
    // así que enviamos el texto RAW que sale de tu cerebro, sin convertir a HTML.
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error enviando mensaje a WhatsApp:", error);
  }
}
