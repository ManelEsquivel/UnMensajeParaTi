// pages/api/megafono_generico.js
const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  // 1. SEGURIDAD
  if (req.query.clave !== 'boda_secreta_1234') { 
    return res.status(401).json({ error: 'No tienes permiso 👮‍♂️' });
  }

  const mensajeAviso = req.query.mensaje || "Aviso importante del evento";
  
  // 🆕 SEGURIDAD: ¿Es una prueba? Leemos el número si existe
  const testTelefono = req.query.test_telefono; 

  try {
    const db = adminApp.firestore();
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    // 2. LEER INVITADOS
    const snapshot = await db.collection('invitados').get();
    
    // Si no es prueba y no hay invitados, paramos.
    if (!testTelefono && snapshot.empty) {
      return res.status(200).json({ status: 'No hay invitados guardados aún.' });
    }

    let enviados = 0;
    let errores = 0;
    let logDetalles = [];

    // 🆕 DECISIÓN: ¿A quién enviamos?
    // Si hay test_telefono, creamos una lista falsa con SOLO ese número.
    // Si NO hay test_telefono, usamos la lista real de la base de datos.
    const listaDestinatarios = testTelefono 
      ? [{ data: () => ({ telefono: testTelefono }) }] 
      : snapshot.docs;

    // 3. ENVIAR
    const envios = listaDestinatarios.map(async (doc) => {
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
              name: "alerta_evento", // 👈 TU PLANTILLA GENÉRICA
              language: { code: "es" },
              components: [
                {
                  type: "body",
                  parameters: [
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
        ? `🧪 MODO PRUEBA: Enviado solo a ${testTelefono}` 
        : `📢 Megáfono GENÉRICO terminado. Enviados: ${enviados}, Fallos: ${errores}`,
      detalles: logDetalles
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
