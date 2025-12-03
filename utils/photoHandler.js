// utils/photoHandler.js
import { ref, uploadBytes } from 'firebase/storage';
// Asegúrate de que esta ruta apunta a tu archivo de configuración de Firebase
import { storage } from '../lib/firebase'; 

export async function descargarYSubirFoto(mediaId) {
  try {
    const token = process.env.WHATSAPP_API_TOKEN;
    
    // 1. Obtener la URL real de la imagen desde Meta
    const mediaUrlResponse = await fetch(`https://graph.facebook.com/v17.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!mediaUrlResponse.ok) throw new Error("Error obteniendo URL de Meta");
    const mediaData = await mediaUrlResponse.json();
    const imageUrl = mediaData.url;

    // 2. Descargar la imagen binaria (los datos crudos)
    const imageResponse = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!imageResponse.ok) throw new Error("Error descargando la imagen");
    
    // Convertimos la respuesta a un ArrayBuffer (compatible con Firebase uploadBytes)
    const imageBuffer = await imageResponse.arrayBuffer();

    // 3. Generar un nombre único
    // Usamos la fecha y un random para que no se repitan
    const timestamp = Date.now();
    const fileName = `whatsapp_${timestamp}.jpg`;

    // 4. Subir a Firebase Storage (Carpeta 'bodas/')
    // Usamos Uint8Array para asegurar compatibilidad en Vercel/Node
    const storageRef = ref(storage, `bodas/${fileName}`);
    const metadata = { contentType: 'image/jpeg' };
    
    await uploadBytes(storageRef, new Uint8Array(imageBuffer), metadata);

    console.log(`✅ Foto guardada en Firebase: ${fileName}`);
    return true;

  } catch (error) {
    console.error("❌ Error procesando foto de WhatsApp:", error);
    return false;
  }
}
