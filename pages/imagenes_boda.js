import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

// Componente principal de la aplicación de la galería
const App = () => {
    // Definiciones de estado
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    // Se elimina el estado 'description'
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null); // Ref para el input de tipo file

    // Variables globales (asumidas disponibles en el entorno Canvas)
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // 1. Inicialización de Firebase y Autenticación
    useEffect(() => {
        if (!firebaseConfig || !Object.keys(firebaseConfig).length) {
            setError('Error: Configuración de Firebase no disponible.');
            setIsLoading(false);
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestore);
            setAuth(firebaseAuth);

            // Listener de autenticación
            const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsLoading(false);
                } else {
                    // Intentar autenticación si no hay usuario
                    (async () => {
                        try {
                            if (initialAuthToken) {
                                await signInWithCustomToken(firebaseAuth, initialAuthToken);
                            } else {
                                await signInAnonymously(firebaseAuth);
                            }
                        } catch (e) {
                            console.error("Autenticación fallida:", e);
                            setError('Error de autenticación: ' + e.message);
                            setIsLoading(false);
                        }
                    })();
                }
            });

            return () => unsubscribe(); // Limpieza del listener
        } catch (e) {
            console.error("Error al inicializar Firebase:", e);
            setError('Error al inicializar Firebase. Revisa la configuración.');
            setIsLoading(false);
        }
    }, [initialAuthToken, JSON.stringify(firebaseConfig)]); // Dependencias de inicialización

    // 2. Carga y escucha en tiempo real de las fotos
    useEffect(() => {
        if (!db || !userId) return; // Esperar a que Firebase y el usuario estén listos

        const collectionRef = collection(db, `artifacts/${appId}/public/data/wedding_photos`);
        // Consulta ordenada por fecha de subida (simulada)
        const q = query(collectionRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const photosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPhotos(photosData);
            setIsLoading(false);
        }, (err) => {
            console.error("Error al obtener datos de Firestore:", err);
            setError('Error al cargar la galería: ' + err.message);
            setIsLoading(false);
        });

        return () => unsubscribe(); // Limpieza del listener
    }, [db, userId, appId]); // Dependencias para la carga de datos

    // Manejador para el cambio de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setError(''); // Limpiar errores al seleccionar un archivo
    };

    // Manejadores para Drag & Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('border-[#884a4a]', 'bg-pink-50'); // Resaltar área
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-[#884a4a]', 'bg-pink-50'); // Quitar resaltado
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-[#884a4a]', 'bg-pink-50'); // Quitar resaltado
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            if (fileInputRef.current) {
                fileInputRef.current.files = files; // Sincronizar con el input real
            }
            setError('');
        }
    };

    // 3. Lógica para la simulación de subida de fotos
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!db || !userId) {
            setError('Error: El usuario no está autenticado o la base de datos no está lista.');
            return;
        }
        if (!selectedFile) {
            setError('Por favor, selecciona o arrastra una imagen.');
            return;
        }

        setUploading(true);
        setError('');

        const fileName = selectedFile.name;
        
        // Generar un color aleatorio para el placeholder
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        const placeholderText = encodeURIComponent(`Foto: ${fileName}`);
        const placeholderUrl = `https://placehold.co/600x400/${randomColor.substring(1)}/000?text=${placeholderText}`;

        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/wedding_photos`), {
                // La descripción se envía como un string vacío
                description: '', 
                userId: userId,
                timestamp: Timestamp.now(),
                // Almacenamos el placeholder en lugar de la imagen real
                imageUrl: placeholderUrl,
                originalFileName: fileName,
            });
            
            // Limpiar formulario y notificar éxito
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Limpiar el input de archivo
            }
            setError('¡Foto subida con éxito! (Simulación de metadatos)');

            // Limpiar mensaje de éxito después de un tiempo
            setTimeout(() => setError(''), 5000);

        } catch (e) {
            console.error("Error al añadir documento:", e);
            setError('Error al subir la foto: ' + e.message);
        } finally {
            setUploading(false);
        }
    };

    // Componente funcional para renderizar una tarjeta de foto
    const PhotoCard = ({ photo }) => {
        const date = photo.timestamp 
            ? photo.timestamp.toDate().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) 
            : 'Fecha desconocida';
        
        return (
            <div className="card-photo bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-all duration-300">
                <div className="relative w-full aspect-video bg-gray-200">
                    <img 
                        src={photo.imageUrl} 
                        alt={photo.originalFileName || 'Foto de Boda'} 
                        className="w-full h-full object-cover rounded-t-xl"
                        onError={(e) => {
                            // Fallback si la URL del placeholder falla
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/600x400/884a4a/ffffff?text=Error+de+Carga";
                        }}
                    />
                </div>
                {/* Contenido de la tarjeta más limpio y enfocado (sin descripción) */}
                <div className={`p-3 transition-colors duration-300`}>
                    {/* Nombre del archivo */}
                    <p className="text-gray-800 font-bold text-base text-center mb-3 truncate">
                        {photo.originalFileName || 'Archivo sin nombre'}
                    </p>
                    
                    {/* Metadatos */}
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="truncate text-[10px] md:text-xs">Usuario: {photo.userId.substring(0, 8)}...</span>
                        <span className="text-[10px] md:text-xs">{date}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-2 md:p-8" style={{ fontFamily: 'Playfair Display, serif', backgroundColor: '#f7f1eb' }}>

            <div id="app-container" className="max-w-6xl mx-auto bg-white p-4 md:p-10 rounded-xl shadow-2xl border-t-8 border-[#884a4a]">

                {/* Encabezado - Más compacto en móvil */}
                <header className="text-center mb-8 md:mb-10 pt-2">
                    <h1 className="text-3xl md:text-5xl font-bold text-[#884a4a] mb-1">
                        Álbum de Boda
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        Manel & Carla — ¡Sube tus recuerdos!
                    </p>
                    <div id="user-id-display" className="mt-1 text-xs text-gray-400 truncate">
                        ID de Usuario: {userId || 'Conectando...'}
                    </div>
                </header>

                {/* Mensajes de Error/Estado */}
                {(error && error.includes('Error')) ? (
                    <p className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 font-medium border border-red-300 animate-pulse">
                        ⚠️ {error}
                    </p>
                ) : (error && (
                    <p className="p-3 mb-4 rounded-lg bg-green-100 text-green-700 font-medium border border-green-300">
                        ✅ {error}
                    </p>
                ))}


                {/* Sección de Carga de Fotos */}
                <section className="bg-white p-4 md:p-8 rounded-xl shadow-md mb-10 border border-gray-100">
                    <h2 className="text-3xl font-bold text-[#884a4a] mb-2 text-center">
                        Sube tus Fotos
                    </h2>
                    <p className="text-md text-gray-600 mb-6 text-center">
                        ¡Rápido y fácil!
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div 
                            className="flex flex-col items-center justify-center p-6 md:p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#884a4a] hover:bg-pink-50 transition-all duration-200 group relative"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()} // Al hacer clic, abre el selector de archivos
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange} 
                                disabled={uploading || !userId}
                            />
                            {selectedFile ? (
                                <p className="text-lg text-[#884a4a] font-semibold text-center mb-2">
                                    Archivo seleccionado: <span className="font-normal text-gray-700">{selectedFile.name}</span>
                                </p>
                            ) : (
                                <>
                                    <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400 group-hover:text-[#884a4a] transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18.274-10.602A3.75 3.75 0 0116.5 4.5c1.488 0 2.904.568 3.997 1.574m-12.796 3.025A7.5 7.5 0 0118 9.75m-7.5-3A5.25 5.25 0 0112 12V21M3 21h18"></path>
                                    </svg>
                                    <p className="text-gray-500 mt-4 text-center text-sm md:text-base">Arrastra y suelta aquí tus archivos</p>
                                    <p className="text-gray-400 text-xs mt-1">(o haz clic para seleccionar)</p>
                                </>
                            )}
                        </div>
                        
                        <button 
                            type="submit" 
                            className="bg-[#884a4a] text-white w-full py-3 rounded-lg font-semibold shadow-md hover:bg-[#6a3939] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                            disabled={uploading || !userId || !selectedFile}
                        >
                            {uploading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Subir a la Galería'
                            )}
                        </button>
                    </form>
                </section>

                {/* Sección de Galería de Fotos */}
                <section>
                    <h2 className="text-3xl font-bold text-[#884a4a] mb-6 border-b pb-2">Galería de Recuerdos</h2>
                    
                    {isLoading && (
                        <div className="text-center p-10 text-gray-500">
                            Cargando fotos en tiempo real...
                            <div className="flex justify-center items-center mt-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#884a4a]"></div>
                            </div>
                        </div>
                    )}
                    
                    {!isLoading && photos.length === 0 && (
                        <div className="text-center p-10 text-gray-500 italic">
                            ¡Sé el primero en subir una foto! La galería está vacía.
                        </div>
                    )}

                    <div id="gallery" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {photos.map(photo => (
                            <PhotoCard key={photo.id} photo={photo} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default App;

export default App;
