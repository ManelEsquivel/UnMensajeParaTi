// pages/api/megafono.js

export default async function handler(req, res) {
  // 1. Seguridad
  if (req.query.clave !== 'boda_secreta_1234') { 
    return res.status(401).json({ error: 'No tienes permiso 👮‍♂️' });
  }

  const mensajeAviso = req.query.mensaje || "Aviso de prueba";
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  // 2. LISTA MANUAL DE INVITADOS (¡Escríbelos aquí!)
  // Tienen que tener el prefijo de país (34 para España)
  const listaTelefonos = [
    "34699XXXXXX", // Tu número
    "34600112233", // Carla
    "34611223344"  // Otro invitado
  ];

  let enviados = 0;

  // 3. Bucle de envío
  const envios = listaTelefonos.map(async (numero) => {
      try {
        await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
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
              name: "aviso_boda",
              language: { code: "es_ES" },
              components: [{
                  type: "body",
                  parameters: [{ type: "text", text: mensajeAviso }]
              }]
            }
          })
        });
        enviados++;
      } catch (e) { console.error(e); }
  });

  await Promise.all(envios);
  return res.status(200).json({ resultado: `Enviado a ${enviados} personas` });
}
