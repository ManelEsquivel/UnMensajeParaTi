// pages/api/megafono.js
const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  // 1. SEGURIDAD: Contraseña simple
  if (req.query.clave !== 'boda_secreta_1234') { 
    return res.status(401).json({ error: 'No tienes permiso 👮‍♂️' });
  }

  // 2. Mensaje a enviar (lo leemos de la URL)
  // Ejemplo: .../megafono?mensaje=El bus sale ya
  const mensajeAviso = req.query.mensaje || "¡Hola! Esto es una prueba del megáfono.";

  try {
    const db = adminApp.firestore();
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    // 3. Leer invitados de la base de datos (Colección 'invitados')
    const snapshot = await db.collection('invitados').get();
    
    if (snapshot.empty) {
      return res.status(200).json({ status: 'No hay invitados guardados en la base de datos aún.' });
    }

    let enviados = 0;
    let errores = 0;

    // 4. Enviar a cada uno
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
              name: "aviso_boda", // El nombre exacto de tu plantilla en Meta
              language: { code: "es_ES" }, // El idioma que elegiste (Spanish - Spain)
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: mensajeAviso } // Rellena el {{1}}
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
            errores++;
        }
        
      } catch (err) {
        console.error("Error red enviando a " + numero, err);
        errores++;
      }
    });

    await Promise.all(envios);

    return res.status(200).json({ 
      resultado: `📢 Megáfono terminado. Enviados: ${enviados}, Fallos: ${errores}` 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
