const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!adminApp) {
    return res.status(500).json({ message: 'Error servidor: Admin SDK no cargado.' });
  }

  // Recibimos el nombre Y el tipo de archivo
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ message: 'Falta nombre o tipo de archivo.' });
  }

  try {
    const bucket = adminApp.storage().bucket();
    const file = bucket.file(`bodas/${fileName}`);

    // ⚠️ CAMBIO CLAVE: Firmamos especificando el Content-Type real
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, 
      contentType: fileType, // "image/png", "image/jpeg", etc.
    };

    const [url] = await file.getSignedUrl(options);

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error firmando URL:', error);
    res.status(500).json({ message: error.message });
  }
}
