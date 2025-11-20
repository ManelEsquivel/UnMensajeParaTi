// pages/api/get-signed-url.js

const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido.' });

  if (!adminApp) {
    return res.status(500).json({ message: 'Error interno: Admin SDK no inicializado.' });
  }

  const { fileName, fileType } = req.body;
  
  if (!fileName || !fileType) {
    return res.status(400).json({ message: 'Faltan datos del archivo.' });
  }

  try {
    const bucket = adminApp.storage().bucket();

    // 🧠 EL TRUCO MAESTRO PARA ORDENAR (Nuevo primero):
    // 1. Obtenemos el tiempo actual.
    // 2. Lo restamos a un número máximo seguro.
    // Resultado: Las fechas futuras crean números más pequeños.
    // Google ordena alfabéticamente: los números pequeños van primero -> ¡Las nuevas van arriba!
    const inverseTimestamp = Number.MAX_SAFE_INTEGER - Date.now();
    
    // Creamos un nombre único: "9005412355_foto.jpg"
    const sortedFileName = `${inverseTimestamp}_${fileName}`;

    const file = bucket.file(`bodas/${sortedFileName}`);

    // Configuración de la firma (agnóstica al tipo para evitar errores)
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, 
      // Nota: No forzamos contentType aquí para máxima compatibilidad con lo que envíe el navegador
    };

    const [url] = await file.getSignedUrl(options);

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error generando URL:', error);
    res.status(500).json({ message: `Error al generar URL: ${error.message}` });
  }
}
