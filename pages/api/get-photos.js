const { adminApp } = require('../../lib/firebase'); 

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  if (!adminApp) {
    return res.status(500).json({ message: 'Admin SDK no inicializado' });
  }

  try {
    const bucket = adminApp.storage().bucket();
    
    // Listamos los archivos en la carpeta 'bodas/'
    const [files] = await bucket.getFiles({ prefix: 'bodas/' });

    // Generamos URLs firmadas para lectura (válidas por mucho tiempo)
    // para que el navegador pueda mostrarlas.
    const urls = await Promise.all(
      files.map(async (file) => {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-2030', // Fecha lejana
        });
        return { name: file.name, url };
      })
    );

    // Filtramos para no mostrar la carpeta en sí misma si aparece
    const photos = urls.filter(f => !f.name.endsWith('/'));

    res.status(200).json({ photos });
  } catch (error) {
    console.error('Error al listar fotos:', error);
    res.status(500).json({ message: 'Error obteniendo la galería' });
  }
}
