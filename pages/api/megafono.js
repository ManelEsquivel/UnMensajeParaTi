// pages/api/megafono.js
const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  // 1. SEGURIDAD
  if (req.query.clave !== 'boda_secreta_1234') { 
    return res.status(401).json({ error: 'No tienes permiso 👮‍♂️' });
  }

  // Leemos parámetros de la URL
  const mensajeAviso = req.query.mensaje || "Aviso importante de la boda";
  const testTelefono = req.query.test_telefono; // <--- NUEVO: Capturamos el teléfono de prueba

  try {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    
    let listaDestinatarios = [];

    // 2. DECIDIR A QUIÉN ENVIAR
    if (testTelefono) {
        // A) MODO PRUEBA: Solo al número indicado en la URL
        console.log(`🧫 Modo Test activado. Enviando solo a: ${testTelefono}`);
        listaDestinatarios = [{ telefono: testTelefono }]; // Creamos una lista falsa con un solo invitado
    } else {
        // B) MODO MEGÁFONO REAL: Leer de Firebase
        const db = adminApp.firestore();
        const snapshot = await db.collection('invitados').get();
        
        if (snapshot.empty) {
          return res.status(200).json({ status: 'No hay invitados guardados aún.' });
        }
        
        // Convertimos los documentos de firebase a un array simple de objetos
        listaDestinatarios = snapshot.docs.map(doc => doc.data());
    }

    let enviados = 0;
    let errores = 0;
    let logDetalles = [];

    // 3. BUCLE DE ENVÍO (Sirve tanto para 1 prueba como para todos)
    const envios = listaDestinatarios.map(async (invitado) => {
      // Si viene de Firebase es invitado.telefono, si es test es directo
      const numero = invitado.telefono; 

      if (!numero) return; // Si por alguna razón no hay número, saltamos

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
              name: "aviso_boda", // 👈 TU PLANTILLA DE MEGÁFONO
              language: { code: "es" },
              components: [
                {
                  type: "body",
                  parameters: [
                    // Aquí metemos tu mensaje en la variable {{1}} de la plantilla
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
      resultado: testTelefono 
        ? `🧪 Test enviado a ${testTelefono}` 
        : `📢 Megáfono masivo terminado. Enviados: ${enviados}, Fallos: ${errores}`,
      detalles: logDetalles
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
