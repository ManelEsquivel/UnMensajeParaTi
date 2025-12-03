// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain';
import { descargarYSubirFoto } from '../../utils/photoHandler';

const { adminApp } = require('../../lib/firebase');
const db = adminApp.firestore();
// Importamos FieldValue para poder añadir elementos a una lista (array) en Firebase
const { FieldValue } = require('firebase-admin').firestore; 

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

            // 👮‍♂️ ZONA LEGAL: BORRADO
            let esBorrado = false;
            if (messageType === 'text') {
                const texto = messageObj.text.body.toLowerCase();
                const frasesBorrado = ["eliminar mi telefono", "borrar mi telefono", "borrar mis datos", "darse de baja"];
                if (frasesBorrado.some(frase => texto.includes(frase))) esBorrado = true;
            }

            if (esBorrado) {
                try {
                    await db.collection('invitados').doc(from).delete();
                    await enviarMensajeWhatsApp(from, "✅ Datos eliminados correctamente. ¡Gracias!");
                    continue; 
                } catch (e) { console.error(e); }
            }

            // 💾 GUARDAR FICHA BÁSICA (Si no es borrado)
            try {
                const docRef = db.collection('invitados').doc(from);
                const docSnap = await docRef.get();
                if (!docSnap.exists) {
                    await enviarMensajeWhatsApp(from, `🔒 *Aviso de Privacidad*\n\nHola ${userName}. Tu número se guardará para gestionar la boda.\n\nEscribe *"Eliminar mi teléfono"* cuando quieras para borrarte.`);
                }
                await docRef.set({
                    telefono: from,
                    nombre: userName,
                    ultima_interaccion: new Date()
                }, { merge: true });
            } catch (e) { console.error(e); }


            // 📸 CASO 1: IMAGEN
            if (messageType === 'image') {
              await enviarMensajeWhatsApp(from, "¡Wow! 📸 Guardando foto... ⏳");
              const mediaId = messageObj.image.id;
              const subidaExitosa = await descargarYSubirFoto(mediaId);
              if (subidaExitosa) await enviarMensajeWhatsApp(from, "¡Foto guardada en el álbum! 🎉");
              else await enviarMensajeWhatsApp(from, "Error guardando la foto.");
            }

            // 💬 CASO 2: TEXTO
            else if (messageType === 'text') {
              const messageBody = messageObj.text.body;
              const msgLower = messageBody.toLowerCase();
              console.log(`📩 Mensaje de ${from}: ${messageBody}`);

              // --- 🚑 ZONA CATERING: DETECTOR DE ALERGIAS ---
              // Palabras clave que indican que el usuario está REPORTANDO una alergia
              const frasesAlergia = ["tengo alergia", "soy alergico", "soy alérgico", "soy celiaco", "soy celíaco", "soy intolerante", "tengo intolerancia", "soy vegano", "soy vegetariano", "no como carne", "no como pescado"];
              
              const esReporteAlergia = frasesAlergia.some(frase => msgLower.includes(frase));

              if (esReporteAlergia) {
                  try {
                      // Guardamos la alergia en un array (lista) para que puedan añadir varias
                      await db.collection('invitados').doc(from).update({
                          alergias: FieldValue.arrayUnion(messageBody) // Guarda el mensaje exacto
                      });

                      // Respondemos confirmando
                      await enviarMensajeWhatsApp(from, `📝 *¡Oído cocina!* \n\nHe anotado en tu ficha: _"${messageBody}"_. \n\nSe lo pasaremos al equipo de catering para que lo tengan en cuenta. ¡Gracias por avisar! 🛡️`);
                      
                      // Cortamos aquí para que la IA no responda otra cosa
                      continue; 

                  } catch (e) {
                      console.error("Error guardando alergia:", e);
                      // Si falla (ej: el documento no existía aún), intentamos crearlo con set
                      await db.collection('invitados').doc(from).set({
                          alergias: [messageBody]
                      }, { merge: true });
                      await enviarMensajeWhatsApp(from, `📝 Anotado en tu ficha.`);
                      continue;
                  }
              }
              // -----------------------------------------------------

              // CEREBRO (Si no es borrado ni alergia)
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
