// lib/firebase.js (FINAL ROBUSTA) 

const firebase = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const admin = require("firebase-admin");

let storage;
let adminAppInstance = null; // Variable para la instancia del Admin SDK

// ID de proyecto (Asegúrate que coincida con tu Service Account)
const CORRECT_PROJECT_ID = "fotos-boda-478810"; 
const CANONICAL_STORAGE_BUCKET = CORRECT_PROJECT_ID + ".appspot.com";

// === LÓGICA DE INICIALIZACIÓN ===

// 1. SERVER SIDE (Vercel) - Usa el SDK de Admin para permisos elevados
if (process.env.FIREBASE_PRIVATE_KEY_STRING && admin.apps.length === 0) { 
    
    // TRUCO VERCEL: Reemplazar el caracter de escape \\n por un salto de línea real \n
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY_STRING.replace(/\\n/g, '\n');
    
    const adminConfig = {
        type: "service_account",
        projectId: process.env.FIREBASE_PROJECT_ID || CORRECT_PROJECT_ID,
        private_key: rawPrivateKey, 
        client_email: process.env.FIREBASE_CLIENT_EMAIL || "vercel-uploader@fotos-boda-478810.iam.gserviceaccount.com", 
        // Otras propiedades se asumen desde la clave JSON
    };

    const app = admin.initializeApp({
        credential: admin.credential.cert(adminConfig),
        projectId: adminConfig.projectId,
        storageBucket: CANONICAL_STORAGE_BUCKET 
    });
    
    adminAppInstance = app; // <--- Exportamos esta instancia
    storage = firebaseStorage.getStorage(app); 
    
} 
// 2. CLIENT SIDE (Navegador) - Usa el SDK regular para el frontend
else if (firebase.getApps().length === 0) { 
    
    // Configuración pública (usa tus propios valores de apiKey)
    const firebaseConfig = {
      apiKey: "TU_API_KEY_DEL_PROYECTO_ACTUAL", 
      authDomain: CORRECT_PROJECT_ID + ".firebaseapp.com",
      projectId: CORRECT_PROJECT_ID,
      storageBucket: CANONICAL_STORAGE_BUCKET,
      messagingSenderId: "154296508162",
      appId: "1:1542998604633186654:web:10a93aebd7960b31a02c1b"
    }; 
    
    const app = firebase.initializeApp(firebaseConfig);
    storage = firebaseStorage.getStorage(app);
    
} else {
    // 3. Usa la aplicación ya inicializada
    const app = admin.apps[0] || firebase.getApps()[0];
    if (admin.apps.length > 0) {
        adminAppInstance = admin.apps[0];
    }
    storage = firebaseStorage.getStorage(app);
}

// Exportamos ambas instancias. adminApp será la instancia autenticada en el servidor.
module.exports = { storage, adminApp: adminAppInstance };
