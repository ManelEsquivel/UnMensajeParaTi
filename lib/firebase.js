import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import "firebase/storage"; 
// Módulo de administración de Firebase para autenticación de servidor
const admin = require('firebase-admin'); 

// 1. Verificamos si la variable de entorno de Service Account existe (solo existe en el servidor Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT && !admin.apps.length) {
    
    // Si estamos en el servidor, usamos las credenciales de administrador
    
    // Parsear el JSON desde la variable de entorno
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    // Inicialización del SDK de Firebase Admin para el Servidor
    const app = admin.initializeApp({
        // Usamos las credenciales certificadas
        credential: admin.credential.cert(serviceAccount),
        projectId: "boda-74934", // El ID de tu proyecto
        storageBucket: "boda-74934.appspot.com" // Tu bucket de almacenamiento
    });
    
    const storage = getStorage(app);
    export { storage };
    
} else if (!admin.apps.length) {
    // 2. Si NO estamos en el servidor, usamos las claves públicas (Frontend/Navegador)
    
    const firebaseConfig = {
      apiKey: "AIzaSyDlYPq0WoXY5q5evJTdMX5ABd3nV_IISr0",
      authDomain: "boda-74934.firebaseapp.com",
      projectId: "boda-74934",
      storageBucket: "boda-74934.appspot.com", 
      messagingSenderId: "154296508162",
      appId: "1:1542998604633186654:web:10a93aebd7960b31a02c1b" 
    }; 
    
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    export { storage };
} else {
    // Si ya existe una app, usamos la existente (para evitar errores en hot reload)
    const app = admin.apps[0];
    const storage = getStorage(app);
    export { storage };
}
