// lib/firebase.js (VERSIÓN FINAL CON CORRECCIÓN DEL ID DEL PROYECTO REAL)

const firebase = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const admin = require("firebase-admin");

let storage;

// ⚠️ ID de proyecto corregido y definitivo
const CORRECT_PROJECT_ID = "fotos-boda-478810";
const CANONICAL_STORAGE_BUCKET = CORRECT_PROJECT_ID + ".appspot.com"; 

// 1. Lógica de Inicialización del Servidor (Server-Side)
if (process.env.FIREBASE_PRIVATE_KEY_STRING && admin.apps.length === 0) { 
    
    // Reconstrucción de la clave privada
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY_STRING.replace(/\\n/g, '\n');
    
    // Configuración del Admin SDK con las identidades de 'fotos-boda-478810'
    const adminConfig = {
        type: "service_account",
        projectId: process.env.FIREBASE_PROJECT_ID || CORRECT_PROJECT_ID, 
        private_key_id: "81e7ab04fd58f50a14c4f647f0713d0052b08ac2",
        private_key: rawPrivateKey, 
        client_email: process.env.FIREBASE_CLIENT_EMAIL || "vercel-uploader@fotos-boda-478810.iam.gserviceaccount.com", 
        client_id: "103279998604633186654", 
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/vercel-uploader%40fotos-boda-478810.iam.gserviceaccount.com"
    };

    // Inicialización del SDK de Firebase Admin para el Servidor
    const app = admin.initializeApp({
        credential: admin.credential.cert(adminConfig),
        projectId: adminConfig.projectId,
        storageBucket: CANONICAL_STORAGE_BUCKET 
    });
    
    storage = firebaseStorage.getStorage(app);
    module.exports = { storage };
    
} else if (firebase.getApps().length === 0) { 
    // 2. Lógica de Inicialización del Cliente (Client-Side)
    
    // ⚠️ ATENCIÓN: Necesitas la API Key del proyecto 'fotos-boda-478810' para esta sección
    const firebaseConfig = {
      // Reemplaza esto con tu API Key REAL del proyecto fotos-boda-478810
      apiKey: "TU_API_KEY_DEL_PROYECTO_ACTUAL", 
      authDomain: CORRECT_PROJECT_ID + ".firebaseapp.com",
      projectId: CORRECT_PROJECT_ID,
      storageBucket: CANONICAL_STORAGE_BUCKET,
      messagingSenderId: "154296508162",
      appId: "1:1542998604633186654:web:10a93aebd7960b31a02c1b"
    }; 
    
    const app = firebase.initializeApp(firebaseConfig);
    storage = firebaseStorage.getStorage(app);
    module.exports = { storage };
    
} else {
    // 3. Usa la aplicación ya inicializada
    const app = admin.apps[0] || firebase.getApps()[0];
    storage = firebaseStorage.getStorage(app);
    module.exports = { storage };
}
