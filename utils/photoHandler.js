// utils/photoHandler.js
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getApps, getApp } from 'firebase/app';

// Función para obtener el storage de forma segura
function getFirebaseStorage() {
  try {
    // Intentamos obtener la app ya inicializada (la que usa tu proyecto)
    const app = getApp(); 
    return getStorage(app);
  } catch (e) {
    console.error("❌ Error obteniendo la instancia de Firebase App:", e);
    // Si no encuentra la app, es que lib/firebase.js no se ha cargado antes.
    // Esto suele arreglarse asegurando que importamos firebase en el flujo principal,
    // pero intentaremos recuperar la instancia por defecto.
    if (getApps().length > 0) {
        return getStorage(getApps()[0]);
    }
    throw new Error("No hay ninguna App de Firebase inicializada. Revisa lib/firebase.js");
  }
}

export async function descargarYSubirFoto(mediaId) {
  console.log("🚀 Iniciando proceso de foto. ID:", mediaId);

  try {
    const token = process.env.WHATSAPP_API_TOKEN;
    if (!token) throw new Error("Falta el TOKEN en variables de entorno");

    // 1. Obtener la instancia de Storage
    const storage = getFirebaseStorage();
    if (!storage) throw new Error("El objeto STORAGE de Firebase es undefined.");

    // 2. Obtener la URL de descarga de Meta
    console.log("1. Pidiendo URL a Meta...");
    const urlResponse = await fetch(`https://graph.facebook.com/v17.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!urlResponse.ok) {
      const err = await urlResponse.text();
      throw new Error(`Error Meta URL: ${urlResponse.status} - ${err}`);
    }
    
    const mediaData = await urlResponse.json();
    const imageUrl = mediaData.url;
    console.log("✅ URL obtenida:", imageUrl);

    // 3. Descargar la imagen
    console.log("2. Descargando imagen...");
    const imageResponse = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!imageResponse.ok) throw new Error(`Error descargando imagen: ${imageResponse.status}`);
    
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log("✅ Imagen descargada. Bytes:", imageBuffer.byteLength);

    // 4. Subir a Firebase
    console.log("3. Subiendo a Firebase...");
    const timestamp = Date.now();
    const fileName = `whatsapp_${timestamp}.jpg`;
    
    // Referencia a la carpeta 'bodas'
    const storageRef = ref(storage, `bodas/${fileName}`);
    
    const metadata = { contentType: 'image/jpeg' };
    
    // Usamos Uint8Array para máxima compatibilidad
    const resultado = await uploadBytes(storageRef, new Uint8Array(imageBuffer), metadata);
    
    console.log("✅ SUBIDA COMPLETADA:", resultado.ref.fullPath);
    return true;

  } catch (error) {
    console.error("❌ ERROR FATAL EN photoHandler:", error);
    return false;
  }
}
