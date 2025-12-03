// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain';
import { descargarYSubirFoto } from '../../utils/photoHandler';

const { adminApp } = require('../../lib/firebase');
const db = adminApp.firestore();

// ⏳ AUMENTADO: Pausa de 3 segundos para que dé tiempo a ver "Escribiendo..."
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Token incorrecto' });
      }
    }
  }

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

            // 🟢 1. ACTIVAR "ESCRIBIENDO..."
            // Lo ejecutamos con await para asegurar que sale antes que nada
            await simularEscribiendo(from);

            // 💾 2. GUARDAR CONTACTO (En segundo plano)
            db.collection('invitados').doc(from).set({
                telefono: from,
                nombre: userName,
                ultima_interaccion: new Date()
            }, { merge: true }).catch(e => console.error("Error Firebase:", e));

            // 📸 CASO 1: IMAGEN
            if (messageType === 'image') {
              console.log(`📸 Imagen de ${from}`);
              await enviarMensajeWhatsApp(from, "¡Wow! 📸 Guardando foto en el álbum... ⏳");
              
              const mediaId = messageObj.image.id;
              const subidaExitosa = await descargarYSubirFoto(mediaId);

              if (subidaExitosa) {
                await enviarMensajeWhatsApp(from, "¡Lista! Tu foto ya está en la galería. 🎉");
              } else {
                await enviarMensajeWhatsApp(from, "Ups, error al guardar la foto.");
              }
            }

            // 💬 CASO 2: TEXTO
            else if (messageType === 'text') {
              const messageBody = messageObj.text.body;
              console.log(`📩 Mensaje de ${from}: ${messageBody}`);

              // 🟢 3. PAUSA DRAMÁTICA (3 SEGUNDOS)
              // Mientras el usuario ve "Escribiendo...", el cerebro piensa
              await sleep(3000); 

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

async function simularEscribiendo(to) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  // 🆙 Actualizado a v21.0
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "sender_action", // Tipo de mensaje especial
    sender_action: "typing_on" // La orden clave
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    // 🔍 LOG DE CONTROL: Mira en los logs de Vercel si sale esto
    if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error activando 'Escribiendo':", errorData);
    } else {
        console.log("✅ Estado 'Escribiendo' enviado correctamente.");
    }

  } catch (error) {
    console.error("Error de red al enviar 'escribiendo':", error);
  }
}

async function enviarMensajeWhatsApp(to, text) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
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
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

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
