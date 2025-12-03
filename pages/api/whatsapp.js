// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain';
import { descargarYSubirFoto } from '../../utils/photoHandler';

const { adminApp } = require('../../lib/firebase');
const db = adminApp.firestore();

export default async function handler(req, res) {
  // 1. VERIFICACIÓN DEL WEBHOOK
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

  // 2. RECEPCIÓN DE MENSAJES
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
            const userName = value.contacts?.[0]?.profile?.name || "Invitado";

            // --- 👮‍♂️ ZONA LEGAL: DETECTAR INTENCIÓN DE BORRADO ---
            let esBorrado = false;
            
            if (messageType === 'text') {
                const texto = messageObj.text.body.toLowerCase();
                // 🧠 LISTA DE FRASES PARA BORRAR (Más flexible)
                const frasesBorrado = [
                    "eliminar mi telefono", "eliminar telefono", "borrar mi telefono", 
                    "borrar telefono", "borrar mis datos", "eliminar mis datos", 
                    "eliminar numero", "borrar numero", "darse de baja", "baja"
                ];

                if (frasesBorrado.some(frase => texto.includes(frase))) {
                    esBorrado = true;
                }
            }

            // --- EJECUCIÓN DEL BORRADO ---
            if (esBorrado) {
                try {
                    console.log(`🗑️ Solicitud de borrado recibida: ${from}`);
                    // Borramos de Firebase
                    await db.collection('invitados').doc(from).delete();
                    
                    // Confirmamos al usuario
                    await enviarMensajeWhatsApp(from, "✅ *Datos Eliminados*\n\nHemos borrado tu número de nuestra base de datos correctamente. Ya no recibirás más notificaciones.\n\n¡Esperamos verte en la boda igualmente! 👋");
                    
                    // IMPORTANTE: Cortamos aquí para que NO guarde el número otra vez ni llame a la IA
                    continue; 

                } catch (e) {
                    console.error("Error al borrar:", e);
                    await enviarMensajeWhatsApp(from, "❌ Hubo un error técnico. Por favor, avisa a Manel.");
                }
            }
            // -----------------------------------------------------

            // Si NO es borrado, seguimos con la lógica normal (Guardar + Responder)

            // 💾 GUARDAR EL NÚMERO (Si no ha pedido borrarse)
            try {
                const docRef = db.collection('invitados').doc(from);
                const docSnap = await docRef.get();

                // Aviso Legal solo la primera vez
                if (!docSnap.exists) {
                    const mensajeLegal = `🔒 *Aviso de Privacidad*
                    
Hola ${userName}, bienvenido/a.

Tu número se guardará en la base de datos de **Manel Esquivel** para gestionar el evento.

🛑 *¿Quieres borrarte?*
Escribe **"Eliminar teléfono"** en cualquier momento y borraremos tus datos.`;
                    await enviarMensajeWhatsApp(from, mensajeLegal);
                }

                // Guardar/Actualizar
                await docRef.set({
                    telefono: from,
                    nombre: userName,
                    ultima_interaccion: new Date()
                }, { merge: true });

            } catch (e) {
                console.error("Error Firebase:", e);
            }

            // 📸 CASO 1: IMAGEN
            if (messageType === 'image') {
              await enviarMensajeWhatsApp(from, "¡Wow! 📸 Guardando foto en el álbum... ⏳");
              const mediaId = messageObj.image.id;
              const subidaExitosa = await descargarYSubirFoto(mediaId);
              if (subidaExitosa) await enviarMensajeWhatsApp(from, "¡Lista! Tu foto ya está en la galería. 🎉");
              else await enviarMensajeWhatsApp(from, "Ups, error al guardar la foto.");
            }

            // 💬 CASO 2: TEXTO
            else if (messageType === 'text') {
              const messageBody = messageObj.text.body;
              // Cerebro
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
