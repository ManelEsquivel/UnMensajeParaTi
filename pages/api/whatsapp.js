// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain';
import { descargarYSubirFoto } from '../../utils/photoHandler';

const { adminApp } = require('../../lib/firebase');
const db = adminApp.firestore();

// ⏳ Pausa para dar "Efecto Humano" (2 segundos es suficiente)
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

            // 🟢 1. ACTIVAR "ESCRIBIENDO..." (SIN AWAIT)
            // Quitamos el 'await' para que no frene la respuesta si falla
            simularEscribiendo(from);

            // 💾 2. GUARDAR CONTACTO
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

              // 🟢 3. PAUSA (2 SEGUNDOS)
              // Mientras el usuario ve (o no) el escribiendo, el bot piensa
              await sleep(2000); 

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
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  // 🛠️ PAYLOAD SIMPLIFICADO AL MÁXIMO
  // Quitamos 'type' y 'recipient_type' para evitar conflictos
  const data = {
    messaging_product: "whatsapp",
    to: to,
    sender_action: "typing_on"
  };

  try {
    // No usamos await aquí para no bloquear, pero capturamos error en log
    fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch(err => console.error("Error silencioso escribiendo:", err));
    
  } catch (error) {
    console.error("Error lanzando escribiendo:", error);
  }
}

async function enviarMensajeWhatsApp(to, text) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

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
