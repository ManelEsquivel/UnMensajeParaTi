// pages/api/get-signed-url.js (FINAL ULTRA-ESTABLE)

// Importamos la instancia del Admin App directamente
const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  // Manejamos OPTIONS y métodos no permitidos
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Origin", "https://bodamanelcarla.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  // 1. Verificación Crítica: Si el Admin SDK no se cargó, fallamos explícitamente.
  if (!adminApp) {
    console.error('CRASH: Admin SDK no inicializado. Revise la variable de entorno FIREBASE_PRIVATE_KEY.');
    return res.status(500).json({ message: 'Error interno: Credenciales de Firebase Admin no cargadas o malformadas.' });
  }

  const { fileName } = req.body;
  if (!fileName) {
    return res.status(400).json({ message: 'Falta el nombre del archivo.' });
  }

  try {
    // 2. Uso de la instancia Admin App
    const bucket = adminApp.storage().bucket();
    const file = bucket.file(`bodas/${fileName}`);

    // Configuración para la URL firmada
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 5 * 60 * 1000, 
      contentType: 'application/octet-stream', 
      headers: {
          'Content-Type': 'application/octet-stream' 
      }
    };

    // 3. Generar la URL
    const [url] = await file.getSignedUrl(options);

    return res.status(200).json({ url, fileName });
  } catch (error) {
    // 4. Capturamos el error y devolvemos un JSON válido (para evitar el 'Unexpected end of JSON')
    console.error('Error FATAL al generar URL firmada:', error);
    return res.status(500).json({ message: `Error al generar URL. Verifique clave privada. Detalle: ${error.message.substring(0, 50)}...` });
  }
}
