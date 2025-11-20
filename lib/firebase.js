// Usamos require() para todo el archivo (CommonJS)
const firebase = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const admin = require("firebase-admin");

// 1. Verificamos si la variable de entorno de Service Account existe (Backend/Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT && !admin.apps.length) {
    
    // Parsear el JSON desde la variable de entorno
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    // Inicialización del SDK de Firebase Admin para el Servidor
    const app = admin.initializeApp({
        // Usamos las credenciales certificadas
        credential: admin.credential.cert(serviceAccount),
        projectId: "boda-74934", // Tu ID de proyecto
        storageBucket: "boda-74934.appspot.com" // Tu bucket de almacenamiento
    });
    
    const storage = firebaseStorage.getStorage(app);
    module.exports = { storage }; // Exportamos usando CommonJS
    
} else if (!admin.apps.length) {
    // 2. Si NO estamos en el servidor (Frontend/Navegador), usamos las claves públicas
    
    const firebaseConfig = {
      apiKey: "AIzaSyDlYPq0WoXY5q5evJTdMX5ABd3nV_IISr0",
      authDomain: "boda-74934.firebaseapp.com",
      projectId: "boda-74934",
      storageBucket: "boda-74934.appspot.com", 
      messagingSenderId: "154296508162",
      appId: "1:1542998604633186654:web:10a93aebd7960b31a02c1b"
    }; 
    
    const app = firebase.initializeApp(firebaseConfig);
    const storage = firebaseStorage.getStorage(app);
    module.exports = { storage }; // Exportamos usando CommonJS
    
} else {
    // Si ya existe una app, usamos la existente
    const app = admin.apps[0];
    const storage = firebaseStorage.getStorage(app);
    module.exports = { storage }; // Exportamos usando CommonJS
}
