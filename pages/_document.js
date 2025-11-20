<script type="module">
    // --- URLs del SDK de Firebase (versión moderna) con CDN ---
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
    import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

    // --- Tu Configuración Única ---
    const firebaseConfig = {
      apiKey: "AIzaSyDlYPq0WoXY5q8evJTdMX5ABd3nV_IISr0",
      authDomain: "boda-74934.firebaseapp.com",
      projectId: "boda-74934",
      storageBucket: "boda-74934.appspot.com", 
      messagingSenderId: "154296508162",
      appId: "1:154296508162:web:10a93aebd7960b31a02c1b"
    }; 

    // --- Inicialización y Exposición Global ---
    const app = initializeApp(firebaseConfig);
    
    // Hacemos las funciones accesibles globalmente (window)
    window.storage = getStorage(app); 
    window.storageRef = ref;
    window.uploadBytes = uploadBytes;
</script>
