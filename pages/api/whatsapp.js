// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain';
import { descargarYSubirFoto } from '../../utils/photoHandler';

// Base de datos para guardar contactos
const { adminApp } = require('../../lib/firebase');
const db = adminApp.firestore();

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
            const userName = value.contacts?.[0]?.profile?.name || "Sin nombre";

            // 🟢 EFECTO HUMANO: PONER "ESCRIBIENDO..." 🟢
            // Lo lanzamos sin 'await' para que no bloquee, pero que aparezca ya
            simularEscribiendo(from); 

            // 💾 GUARDAR EL NÚMERO EN FIREBASE
            try {
                await db.collection('invitados').doc(from).set({
                    telefono: from,
                    nombre: userName,
                    ultima_interaccion: new Date()
                }, { merge: true });
            } catch (e) {
                console.error("Error guardando contacto:", e);
            }

            // 📸 CASO 1: ES UNA IMAGEN
            if (messageType === 'image') {
              console.log(`📸 Imagen recibida de ${from}`);
              await enviarMensajeWhatsApp(from, "¡Wow! 📸 Guardando foto en el álbum de la boda... ⏳");
              
              const mediaId = messageObj.image.id;
              const subidaExitosa = await descargarYSubirFoto(mediaId);

              if (subidaExitosa) {
                await enviarMensajeWhatsApp(from, "¡Lista! Tu foto ya está en la galería compartida. 🎉");
              } else {
                await enviarMensajeWhatsApp(from, "Ups, hubo un error guardando la foto. Intenta enviarla de nuevo.");
              }
            }

            // 💬 CASO 2: ES TEXTO
            else if (messageType === 'text') {
              const messageBody = messageObj.text.body;
              console.log(`📩 Mensaje recibido de ${from}: ${messageBody}`);

              // El "Escribiendo..." ya está activo mientras esto piensa
              const aiReplyRaw = await obtenerRespuestaBoda(messageBody);

              if (aiReplyRaw === "__UBICACION__") {
                await enviarUbicacionNativa(from);
              } else {
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

// --- FUNCIONES AUXILIARES ---

// 🆕 FUNCIÓN PARA QUE APAREZCA "ESCRIBIENDO..."
async function simularEscribiendo(to) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "sender_action",
    sender_action: "typing_on" // 👈 ESTA ES LA CLAVE MÁGICA
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
    console.error("Error enviando estado 'escribiendo':", error);
  }
}

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
    console.error("Error enviando mensaje:", error);
  }
}

async function enviarUbicacionNativa(to) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "location",
    location: {
      latitude: "41.503889", 
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
    console.error("Error enviando ubicación:", error);
  }
}
