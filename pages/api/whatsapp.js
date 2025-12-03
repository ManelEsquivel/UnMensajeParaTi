// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain'; // Importamos el cerebro

export default async function handler(req, res) {
  // 1. VERIFICACIÓN DEL WEBHOOK (GET)
  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

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

    if (body.object === 'whatsapp_business_account') {
      
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          if (value.messages && value.messages.length > 0) {
            const messageObj = value.messages[0];
            const from = messageObj.from; 
            const messageType = messageObj.type;

            // Solo procesamos texto por ahora
            if (messageType === 'text') {
              const messageBody = messageObj.text.body;
              console.log(`📩 Mensaje recibido de ${from}: ${messageBody}`);

              // --- LLAMAMOS AL CEREBRO DE LA BODA 🧠 ---
              const aiReplyRaw = await obtenerRespuestaBoda(messageBody);

              // --- DETECCIÓN DE MAPA/UBICACIÓN 📍 ---
              // Si el cerebro nos devuelve la "bandera secreta", enviamos el mapa nativo
              if (aiReplyRaw === "__UBICACION__") {
                console.log("📍 Enviando ubicación nativa...");
                await enviarUbicacionNativa(from);
              } else {
                // Si es texto normal, lo enviamos como siempre
                await enviarMensajeWhatsApp(from, aiReplyRaw);
              }
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

// --- FUNCIÓN ESTÁNDAR PARA TEXTO ---
async function enviarMensajeWhatsApp(to, text) {
  const token = process.env.WHATSAPP_API_TOKEN; 
  const phoneId = process.env.WHATSAPP_PHONE_ID; 
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: text }, 
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

// --- NUEVA FUNCIÓN PARA ENVIAR UBICACIÓN NATIVA 📍 ---
async function enviarUbicacionNativa(to) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "location",
    location: {
      latitude: "41.503889", // Coordenadas de Masia Mas Llombart
      longitude: "2.246389",
      name: "Masia Mas Llombart",
      address: "Sant Fost de Campsentelles, Barcelona"
    }
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
    console.error("Error enviando ubicación nativa:", error);
  }
}
