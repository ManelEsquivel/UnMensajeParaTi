// pages/api/get-signed-url.js (FINAL ROBUSTA)

// Importamos la instancia del Admin App directamente
const { adminApp } = require('../../lib/firebase'); 

export const config = {
  api: {
    // No necesitamos bodyParser: false aquí ya que no manejamos archivos grandes, solo JSON
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido.' });
  }

  // 1. Verificación de Autenticación del Servidor
  if (!adminApp) {
    console.error('ERROR: Admin SDK no inicializado. Faltan variables de entorno.');
    return res.status(500).json({ message: 'Error interno del servidor: Credenciales de Firebase Admin incompletas.' });
  }

  const { fileName } = req.body;
  if (!fileName) {
    return res.status(400).json({ message: 'Falta el nombre del archivo.' });
  }

  try {
    // 2. Usar la instancia del Admin App para acceder a Storage
    // .bucket() sin argumentos usa el bucket configurado en la inicialización
    const bucket = adminApp.storage().bucket();
    const file = bucket.file(`bodas/${fileName}`);

    // Configuración para la URL firmada (expira en 5 minutos)
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 5 * 60 * 1000, // 5 minutos de validez
      contentType: 'application/octet-stream', 
    };

    // 3. Generar la URL
    const [url] = await file.getSignedUrl(options);

    res.status(200).json({ url, fileName });
  } catch (error) {
    // Si falla aquí, es por un problema de permisos del Service Account o un error de clave.
    console.error('Error al generar URL firmada. Posiblemente permisos:', error);
    res.status(500).json({ message: 'Error interno de autenticación para Storage. Revisa tus variables y el rol de tu Service Account.' });
  }
}
