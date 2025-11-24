const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });
  if (!adminApp) return res.status(500).json({ message: 'Admin SDK no inicializado' });

  try {
    const bucket = adminApp.storage().bucket();
    
    // 1. Leemos el token Y el límite que envía el frontend
    const { pageToken, limit } = req.query;

    // Convertimos el límite a número. Si no viene nada, usamos 20 por defecto.
    const resultsLimit = parseInt(limit) || 20;

    const options = {
      prefix: 'bodas/',
      maxResults: resultsLimit, // <--- AHORA ES DINÁMICO
      pageToken: pageToken || undefined, 
    };

    // getFiles devuelve [files, nextQuery, apiResponse]
    const [files, nextQuery] = await bucket.getFiles(options);

    const photos = await Promise.all(
      files.map(async (file) => {
        // Ignorar la carpeta misma
        if (file.name.endsWith('/')) return null;
        
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-2030',
        });
        return { name: file.name, url };
      })
    );

    // Filtramos los nulos (carpetas)
    const validPhotos = photos.filter(p => p !== null);

    res.status(200).json({ 
      photos: validPhotos, 
      nextPageToken: nextQuery ? nextQuery.pageToken : null 
    });

  } catch (error) {
    console.error('Error al listar fotos:', error);
    res.status(500).json({ message: 'Error obteniendo la galería' });
  }
}
