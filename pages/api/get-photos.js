const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });
  if (!adminApp) return res.status(500).json({ message: 'Admin SDK no inicializado' });

  try {
    const bucket = adminApp.storage().bucket();
    
    // Leemos el token de la página siguiente si el frontend nos lo envía
    const { pageToken } = req.query;

    const options = {
      prefix: 'bodas/',
      maxResults: 12, // ⚠️ LÍMITE: Cargamos solo 12 fotos por vez
      pageToken: pageToken || undefined, // Si hay token, seguimos desde ahí
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
      nextPageToken: nextQuery ? nextQuery.pageToken : null // Enviamos el token para la siguiente carga
    });

  } catch (error) {
    console.error('Error al listar fotos:', error);
    res.status(500).json({ message: 'Error obteniendo la galería' });
  }
}
