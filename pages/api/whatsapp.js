// pages/api/whatsapp.js
import { obtenerRespuestaBoda } from '../../utils/bodaBrain';
import { descargarYSubirFoto } from '../../utils/photoHandler';

const { adminApp } = require('../../lib/firebase');
const db = adminApp.firestore();
const { FieldValue } = require('firebase-admin').firestore; 

// --- FUNCIÓN DE LIMPIEZA (Quita tildes y mayúsculas) ---
const normalize = (str) => {
  if (!str) return '';
  return str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Elimina tildes (é -> e)
            .trim();
};

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

            // 👮‍♂️ ZONA LEGAL: BORRADO (Mejorada con normalización)
            let esBorrado = false;
            
            if (messageType === 'text') {
                const textoOriginal = messageObj.text.body;
                const textoLimpio = normalize(textoOriginal); // "Teléfono" -> "telefono"

                const frasesBorrado = [
                    "eliminar mi telefono", "eliminar telefono", "borrar mi telefono", 
                    "borrar telefono", "borrar mis datos", "eliminar mis datos", 
                    "eliminar numero", "borrar numero", "darse de baja", "baja"
                ];

                if (frasesBorrado.some(frase => textoLimpio.includes(frase))) {
                    esBorrado = true;
                }
            }

            if (esBorrado) {
                try {
                    await db.collection('invitados').doc(from).delete();
                    await enviarMensajeWhatsApp(from, "✅ Datos eliminados correctamente. Tu número ha sido borrado de nuestra base de datos. ¡Gracias!");
                    continue; 
                } catch (e) { console.error(e); }
            }

            // 💾 GUARDAR FICHA BÁSICA
            try {
                const docRef = db.collection('invitados').doc(from);
                const docSnap = await docRef.get();
                if (!docSnap.exists) {
                    await enviarMensajeWhatsApp(from, `🔒 *Aviso de Privacidad*\n\nHola ${userName}. Tu número se guardará en la base de datos de Manel para gestionar las notificaciones.\n\nSi quieres borrarte en el futuro, solo escribe *"Eliminar mi teléfono"*.`);
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

              // --- 🎵 ZONA DJ: PETICIONES ---
              const frasesMusica = ["cancion", "canción", "musica", "música", "quiero escuchar", "pon la de", "temazo", "para bailar", "quiero añadir"];
              
              if (frasesMusica.some(f => msgLower.includes(f)) && !msgLower.includes("que musica")) {
                  try {
                      // Limpieza inteligente del título
                      let cancionLimpia = messageBody;
                      const frasesLimpieza = [
                          "quiero añadir la canción de", "quiero añadir la cancion de", "quiero añadir","la canción", 
                          "quiero escuchar la canción de", "quiero escuchar la cancion de", 
                          "añadir la canción de", "añadir la cancion de", "pon la canción de", 
                          "pon la cancion de", "la canción de", "la cancion de", 
                          "canción de", "cancion de", "pon la de", "añadir", 
                          "canción", "cancion", "musica", "música"
                      ];
                      
                      for (const frase of frasesLimpieza) {
                          const regex = new RegExp(`^${frase}\\s*`, "i");
                          if (regex.test(cancionLimpia)) {
                              cancionLimpia = cancionLimpia.replace(regex, "");
                              break;
                          }
                      }
                      cancionLimpia = cancionLimpia.trim().replace(/^[:\-\.]\s*/, ""); 

                      // ---------------------------------------------------------
                      // 🛡️ NUEVO FILTRO: DETECTAR PETICIÓN GENÉRICA
                      // ---------------------------------------------------------
                      const textoVerificacion = cancionLimpia.toLowerCase();
                      const esGenerico = ["una cancion", "una canción", "cancion", "canción", "musica", "música", ""].includes(textoVerificacion);

                      // Si está vacío o es solo "una canción", enviamos instrucciones y PARAMOS
                      if (cancionLimpia.length < 2 || esGenerico) {
                          await enviarMensajeWhatsApp(from, "¡Claro! 🎧 Para añadir una canción, dime la **canción y el artista** y la subo directamente.\n\nPuedes ver la lista completa en: https://bodamanelcarla.vercel.app/dj");
                          continue; // 🛑 Importante: Esto evita que se guarde en la BD
                      }
                      // ---------------------------------------------------------

                      // A. Firebase
                      await db.collection('canciones').add({
                          peticion: cancionLimpia,
                          original: messageBody,
                          solicitado_por: userName,
                          origen: "whatsapp",
                          fecha: new Date()
                      });

                      // B. Google Sheets
                      const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdUwUkcF_RHlfHdraWI0Vdca6Or6HxE1M_ykj2mfci_cokyoA/formResponse";
                      const params = new URLSearchParams();
                      params.append("entry.38062662", cancionLimpia); 
                      params.append("entry.1279581249", userName);  
                      params.append("entry.2026891459", "WhatsApp"); 

                      await fetch(FORM_URL, {
                          method: 'POST',
                          mode: 'no-cors',
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                          body: params
                      });

                      await enviarMensajeWhatsApp(from, `🎶 *¡Anotada en la Pizarra!* \n\nHe añadido _"${cancionLimpia}"_ a la lista. 💃🕺`);
                      continue; 

                  } catch (e) {
                      console.error("Error guardando canción:", e);
                      await enviarMensajeWhatsApp(from, "Ups, error al guardar la canción.");
                  }
              }

              // --- 🚑 ZONA CATERING: ALERGIAS ---
              const frasesAlergia = ["tengo alergia", "soy alergico", "soy alérgico", "soy celiaco", "soy celíaco", "soy intolerante", "tengo intolerancia", "soy vegano", "soy vegetariano"];
              if (frasesAlergia.some(frase => msgLower.includes(frase))) {
                  try {
                      await db.collection('invitados').doc(from).update({
                          alergias: FieldValue.arrayUnion(messageBody)
                      });
                      await enviarMensajeWhatsApp(from, `📝 *Anotado* \n\nHe guardado tu alergia/intolerancia en tu ficha. ¡Gracias por avisar! 🛡️`);
                      continue; 
                  } catch (e) {
                      await db.collection('invitados').doc(from).set({ alergias: [messageBody] }, { merge: true });
                      await enviarMensajeWhatsApp(from, `📝 Anotado en tu ficha.`);
                      continue;
                  }
              }

              // --- 🧠 CEREBRO GENERAL (IA + MAPA) ---
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
      latitude: "41.50218567011168", 
      longitude: "2.2398807840017856",
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
