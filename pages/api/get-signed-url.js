const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido.' });
  }

  if (!adminApp) {
    return res.status(500).json({ message: 'Error interno: Admin SDK no inicializado.' });
  }

  const { fileName } = req.body;
  
  if (!fileName) {
    return res.status(400).json({ message: 'Falta el nombre del archivo.' });
  }

  try {
    const bucket = adminApp.storage().bucket();
    const file = bucket.file(`bodas/${fileName}`);

    // ⚠️ CAMBIO CLAVE: Forzamos SIEMPRE 'application/octet-stream' en la firma
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, 
      contentType: 'application/octet-stream', 
    };

    const [url] = await file.getSignedUrl(options);

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error generando URL:', error);
    res.status(500).json({ message: `Error al generar URL: ${error.message}` });
  }
}
