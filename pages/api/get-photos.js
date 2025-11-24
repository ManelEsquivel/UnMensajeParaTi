const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });
  if (!adminApp) return res.status(500).json({ message: 'Admin SDK no inicializado' });

  try {
    const bucket = adminApp.storage().bucket();
    
    // Recibimos el "token" (que ahora usaremos como número de página/índice)
    const { pageToken, limit } = req.query;
    
    // Si no hay token, empezamos en la foto 0. Si hay token, lo convertimos a número.
    const startIndex = parseInt(pageToken) || 0;
    const resultsLimit = parseInt(limit) || 20;

    // 1. OBTENER TODO (Sin límite inicial, para poder ordenar)
    const [files] = await bucket.getFiles({
      prefix: 'bodas/',
    });

    // 2. ORDENAR: De más reciente a más antigua
    // Usamos 'timeCreated' que viene en los metadatos del archivo
    files.sort((a, b) => {
        const timeA = new Date(a.metadata.timeCreated).getTime();
        const timeB = new Date(b.metadata.timeCreated).getTime();
        return timeB - timeA; // B - A pone los más nuevos primero
    });

    // 3. CORTAR (PAGINACIÓN MANUAL)
    // Cogemos desde el índice actual (ej. 0) hasta el límite (ej. 20)
    const filesOnThisPage = files.slice(startIndex, startIndex + resultsLimit);

    // Generar URLs firmadas solo para estas 20
    const photos = await Promise.all(
      filesOnThisPage.map(async (file) => {
        if (file.name.endsWith('/')) return null;
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-2030',
        });
        return { name: file.name, url };
      })
    );

    const validPhotos = photos.filter(p => p !== null);

    // 4. CALCULAR SIGUIENTE PÁGINA
    // Si quedan fotos por mostrar, el "token" será el índice donde nos quedamos
    let nextToken = null;
    if (startIndex + resultsLimit < files.length) {
        nextToken = startIndex + resultsLimit;
    }

    res.status(200).json({ 
      photos: validPhotos, 
      nextPageToken: nextToken // Enviamos un número (ej. 20, 40...)
    });

  } catch (error) {
    console.error('Error al listar fotos:', error);
    res.status(500).json({ message: 'Error obteniendo la galería' });
  }
}
