import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// --- Tu Configuración de Firebase (Claves del proyecto boda-74934) ---
const firebaseConfig = {
  apiKey: "AIzaSyDlYPq0WoXY5q5evJTdMX5ABd3nV_IISr0",
  authDomain: "boda-74934.firebaseapp.com",
  projectId: "boda-74934",
  storageBucket: "boda-74934.appspot.com", 
  messagingSenderId: "154296508162",
  appId: "1:154296508162:web:10a93aebd7960b31a02c1b"
}; 

// Inicializa la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Obtiene el servicio de Storage a partir de la app inicializada
const storage = getStorage(app);

// Exportamos el objeto 'storage' para que otros archivos (como la API Route) lo puedan importar
export { storage };
