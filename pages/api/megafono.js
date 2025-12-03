// pages/api/megafono.js
const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  // 1. SEGURIDAD
  if (req.query.clave !== 'boda_secreta_1234') { 
    return res.status(401).json({ error: 'No tienes permiso 👮‍♂️' });
  }

  // Leemos el mensaje de la URL (ej: ...?mensaje=El bus sale ya)
  const mensajeAviso = req.query.mensaje || "Aviso importante de la boda";

  try {
    const db = adminApp.firestore();
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    // 2. LEER INVITADOS
    const snapshot = await db.collection('invitados').get();
    
    if (snapshot.empty) {
      return res.status(200).json({ status: 'No hay invitados guardados aún.' });
    }

    let enviados = 0;
    let errores = 0;
    let logDetalles = [];

    // 3. ENVIAR A CADA UNO
    const envios = snapshot.docs.map(async (doc) => {
      const invitado = doc.data();
      const numero = invitado.telefono;

      try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: numero,
            type: "template",
            template: {
              name: "aviso_boda", // 👈 TU PLANTILLA REAL
              language: { code: "es_ES" }, // 👈 IDIOMA ESPAÑOL
              components: [
                {
                  type: "body",
                  parameters: [
                    // Aquí metemos tu mensaje en la variable {{1}}
                    { type: "text", text: mensajeAviso } 
                  ]
                }
              ]
            }
          })
        });

        if (response.ok) {
            enviados++;
        } else {
            const errData = await response.json();
            console.error(`Fallo envío a ${numero}:`, errData);
            logDetalles.push({ numero, error: errData.error?.message });
            errores++;
        }
        
      } catch (err) {
        console.error("Error red enviando a " + numero, err);
        errores++;
      }
    });

    await Promise.all(envios);

    return res.status(200).json({ 
      resultado: `📢 Megáfono terminado. Enviados: ${enviados}, Fallos: ${errores}`,
      detalles: logDetalles
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
