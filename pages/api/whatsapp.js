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

            // --- 👮‍♂️ ZONA LEGAL: GESTIÓN DE CONTACTOS ---
            
            // Verificamos primero si es un comando de borrado para NO guardarlo
            let esBorrado = false;
            if (messageType === 'text') {
                const texto = messageObj.text.body.toLowerCase();
                if (texto.includes("eliminar mi telefono") || texto.includes("borrar mi telefono")) {
                    esBorrado = true;
                }
            }

            if (!esBorrado) {
                // Si NO quiere borrarse, gestionamos su ficha normalmente
                try {
                    const docRef = db.collection('invitados').doc(from);
                    const docSnap = await docRef.get();

                    // Si es NUEVO, le damos el aviso legal CON la instrucción de borrado
                    if (!docSnap.exists) {
                        console.log(`👤 Nuevo usuario: ${from}`);
                        const mensajeLegal = `🔒 *Aviso de Privacidad*
                        
Hola ${userName}, bienvenido al asistente de la boda.

Tu número se guardará en la base de datos de **Manel Esquivel** para gestionar el evento.

🛑 *¿Quieres darte de baja?*
Solo tienes que escribir **"Eliminar mi teléfono"** en cualquier momento y borraremos tus datos al instante.`;

                        await enviarMensajeWhatsApp(from, mensajeLegal);
                    }

                    // Guardamos/Actualizamos interacción
                    await docRef.set({
                        telefono: from,
                        nombre: userName,
                        ultima_interaccion: new Date()
                    }, { merge: true });

                } catch (e) {
                    console.error("Error Firebase:", e);
                }
            }
            // -----------------------------------------------------

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
              const messageBodyLower = messageBody.toLowerCase();
              console.log(`📩 Mensaje de ${from}: ${messageBody}`);

              // 🗑️ LÓGICA DE BORRADO (GDPR)
              if (messageBodyLower.includes("eliminar mi telefono") || messageBodyLower.includes("borrar mi telefono")) {
                  try {
                      // Borramos el documento de la colección 'invitados'
                      await db.collection('invitados').doc(from).delete();
                      console.log(`🗑️ Usuario eliminado: ${from}`);
                      
                      await enviarMensajeWhatsApp(from, "✅ Hecho. Hemos eliminado tu número de nuestra base de datos. Ya no recibiras los avisos de los novios. ¡Esperamos verte en la boda!");
                  } catch (e) {
                      console.error("Error al borrar:", e);
                      await enviarMensajeWhatsApp(from, "❌ Hubo un error técnico al intentar borrarte. Por favor, avisa a Manel.");
                  }
                  // IMPORTANTE: No seguimos procesando para que no salte el Cerebro
                  continue; 
              }

              // Si no es borrado, preguntamos al Cerebro
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
