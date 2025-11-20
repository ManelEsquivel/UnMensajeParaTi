// lib/firebase.js (FINAL ROBUSTO con Variable de Entorno ÚNICA)

const firebase = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const admin = require("firebase-admin");

let storage; // Referencia para el SDK de Storage (Web SDK)
let adminAppInstance = null; // Referencia para el SDK de Admin (Servidor)

// IDs y URLs confirmados por tus archivos
const CORRECT_PROJECT_ID = "boda-74934"; 
const CANONICAL_STORAGE_BUCKET = CORRECT_PROJECT_ID + ".appspot.com";

// === LÓGICA DE INICIALIZACIÓN ===

// 1. SERVER SIDE (Vercel) - Usa el SDK de Admin con el Service Account ÚNICO
if (process.env.FIREBASE_SERVICE_ACCOUNT && admin.apps.length === 0) { 
    
    // TRUCO VERCEL FINAL: Limpieza y Parseo del JSON Completo
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // ⚠️ Convertimos la doble barra invertida ('\\n') a salto de línea ('\n') para el Admin SDK
    const cleanedJsonString = serviceAccountString.replace(/\\n/g, '\n');
    const serviceAccount = JSON.parse(cleanedJsonString);
    
    // Inicialización del SDK de Admin para el Servidor
    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: CORRECT_PROJECT_ID,
        storageBucket: CANONICAL_STORAGE_BUCKET 
    });
    
    adminAppInstance = app; 
    
} 
// 2. CLIENT SIDE (Navegador) - Usa el SDK regular (Clave Pública Web)
else if (firebase.getApps().length === 0) { 
    
    const firebaseConfig = {
      // Clave Web confirmada
      apiKey: "AIzaSyDlYPq0WoXY5q8evJTdMX5ABd3nV_IISr0", 
      authDomain: CORRECT_PROJECT_ID + ".firebaseapp.com",
      projectId: CORRECT_PROJECT_ID,
      storageBucket: CANONICAL_STORAGE_BUCKET,
      
      messagingSenderId: "154296508162", 
      appId: "1:154296508162:web:10a93aebd7960b31a02c1b" 
    }; 
    
    const app = firebase.initializeApp(firebaseConfig);
    storage = firebaseStorage.getStorage(app); 
    
} else {
    // 3. Usa la aplicación ya inicializada
    const app = admin.apps[0] || firebase.getApps()[0];
    if (admin.apps.length > 0) {
        adminAppInstance = admin.apps[0];
    }
    if (firebase.getApps().length > 0) {
        storage = firebaseStorage.getStorage(app);
    }
}

// Exportamos las referencias para que puedan ser usadas por las rutas API y los componentes
module.exports = { storage, adminApp: adminAppInstance };
