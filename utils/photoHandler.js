// utils/photoHandler.js

// 1. Importamos la instancia de ADMIN que sí funciona en tu servidor
const { adminApp } = require('../lib/firebase'); 

export async function descargarYSubirFoto(mediaId) {
  console.log("🚀 Iniciando proceso de foto (Modo Admin). ID:", mediaId);

  try {
    const token = process.env.WHATSAPP_API_TOKEN;
    if (!token) throw new Error("Falta el TOKEN en variables de entorno");

    // --- A. DESCARGAR DE WHATSAPP ---
    console.log("1. Pidiendo URL a Meta...");
    const urlResponse = await fetch(`https://graph.facebook.com/v17.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!urlResponse.ok) throw new Error(`Error Meta URL: ${urlResponse.status}`);
    const mediaData = await urlResponse.json();
    const imageUrl = mediaData.url;

    console.log("2. Descargando imagen binaria...");
    const imageResponse = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!imageResponse.ok) throw new Error(`Error descarga imagen: ${imageResponse.status}`);
    
    // Convertimos la imagen a un Buffer (formato nativo de Node.js)
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // --- B. SUBIR A FIREBASE (Usando Admin SDK) ---
    console.log("3. Subiendo a Firebase Storage...");
    
    // Usamos el bucket por defecto que ya configuraste en firebase.js
    const bucket = adminApp.storage().bucket();
    
    const timestamp = Date.now();
    const fileName = `bodas/whatsapp_${timestamp}.jpg`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: { contentType: 'image/jpeg' },
      public: true // Opcional: Si quieres que sea pública
    });
    
    console.log("✅ SUBIDA COMPLETADA:", fileName);
    return true;

  } catch (error) {
    console.error("❌ ERROR FATAL EN photoHandler:", error);
    return false;
  }
}
