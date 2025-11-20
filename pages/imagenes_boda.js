import React, { useState, useRef, useEffect } from 'react';

export default function ImagenesBoda() {
    const [fileItems, setFileItems] = useState([]); 
    const [galleryPhotos, setGalleryPhotos] = useState([]); 
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isGlobalUploading, setIsGlobalUploading] = useState(false);
    
    const fileInputRef = useRef(null);

    // --- CARGA DE GALERÍA ---
    const fetchGallery = async (token = null, reset = false) => {
        // Evitamos spinner si es una recarga silenciosa (reset) para que no moleste
        if (!reset) setIsLoadingGallery(true);
        try {
            let url = '/api/get-photos';
            if (token) url += `?pageToken=${token}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (reset) {
                    setGalleryPhotos(data.photos);
                } else {
                    setGalleryPhotos(prev => [...prev, ...data.photos]);
                }
                setNextPageToken(data.nextPageToken);
            }
        } catch (error) {
            console.error("Error cargando galería:", error);
        } finally {
            if (!reset) setIsLoadingGallery(false);
        }
    };

    useEffect(() => { fetchGallery(); }, []);
    const handleLoadMore = () => { if (nextPageToken) fetchGallery(nextPageToken, false); };

    // --- SELECCIÓN DE ARCHIVOS ---
    const processNewFiles = (incomingFiles) => {
        const newItems = Array.from(incomingFiles).map(file => ({
            id: Date.now() + Math.random(), 
            file: file,
            previewUrl: URL.createObjectURL(file),
            status: 'idle' 
        }));
        setFileItems(prev => [...prev, ...newItems]);
    };

    useEffect(() => {
        return () => { fileItems.forEach(item => URL.revokeObjectURL(item.previewUrl)); };
    }, [fileItems]);

    const handleZoneClick = () => fileInputRef.current.click();
    const handleFileSelect = (e) => { if (e.target.files?.length) processNewFiles(e.target.files); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files?.length) processNewFiles(e.dataTransfer.files);
    };
    
    const handleRemoveItem = (idToRemove) => {
        setFileItems(prev => {
            const item = prev.find(i => i.id === idToRemove);
            if (item) URL.revokeObjectURL(item.previewUrl);
            return prev.filter(i => i.id !== idToRemove);
        });
    };

    // --- SUBIDA INDIVIDUAL ---
    const updateItemStatus = (id, newStatus, errorMessage = null) => {
        setFileItems(prev => prev.map(item => 
            item.id === id ? { ...item, status: newStatus, error: errorMessage } : item
        ));
    };

    const uploadSingleItem = async (item) => {
        if (item.status === 'success' || item.status === 'uploading') return;

        updateItemStatus(item.id, 'uploading');

        try {
            const file = item.file;
            // Enviar tipo original o defecto
            const typeToSend = file.type || 'application/octet-stream';

            // 1. Obtener URL Firmada
            const urlRes = await fetch('/api/get-signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileType: typeToSend }), 
            });
            
            if (!urlRes.ok) throw new Error('Error permiso');
            const { url } = await urlRes.json();
            
            // 2. Subir a Google
            const uploadRes = await fetch(url, {
                method: 'PUT', 
                headers: { 'Content-Type': typeToSend }, // IMPORTANTE: Mismo tipo
                body: file,
            });
            
            if (!uploadRes.ok) throw new Error('Error subida');

            // ÉXITO
            updateItemStatus(item.id, 'success');
            
            // 3. ACTUALIZACIÓN INMEDIATA DE LA GALERÍA
            // Recargamos la galería en segundo plano para que aparezca la foto nueva
            fetchGallery(null, true); 

        } catch (error) {
            console.error(error);
            updateItemStatus(item.id, 'error', error.message);
        }
    };

    // --- SUBIDA GLOBAL ---
    const handleUploadAll = async () => {
        const itemsToUpload = fileItems.filter(i => i.status === 'idle' || i.status === 'error');
        if (itemsToUpload.length === 0) return alert("No hay fotos nuevas para subir.");

        setIsGlobalUploading(true);
        
        // Subimos todas en paralelo
        await Promise.all(itemsToUpload.map(item => uploadSingleItem(item)));
        
        setIsGlobalUploading(false);

        // Limpieza opcional: Quitar las fotos exitosas de la lista después de 2 segundos
        // para que el usuario vea que se subieron y luego la lista quede limpia.
        setTimeout(() => {
            setFileItems(prev => prev.filter(i => i.status !== 'success'));
        }, 2000);
    };

    // --- RENDERIZADO ---
    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>Sube tus Fotos</h1>
                <p style={styles.subtitle}>Comparte tus recuerdos de la boda</p>
                
                <div 
                    style={{ ...styles.dropZone, ...(isDragging ? styles.dropZoneActive : {}) }}
                    onClick={handleZoneClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div style={styles.iconContainer}>📸</div>
                    <p style={styles.dropText}>{isDragging ? '¡Suelta aquí!' : 'Toca para seleccionar'}</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{display:'none'}} multiple accept="image/*" />
                </div>
                
                {/* LISTA DE PREVISUALIZACIÓN (Mejorada para Móvil) */}
                {fileItems.length > 0 && (
                    <ul style={styles.previewList}>
                        {fileItems.map((item) => (
                            <li key={item.id} style={styles.previewItem}>
                                {/* Miniatura Grande */}
                                <img src={item.previewUrl} alt="Preview" style={styles.thumbnail} />
                                
                                {/* Info */}
                                <div style={styles.fileInfo}>
                                    <span style={styles.fileName}>{item.file.name}</span>
                                    
                                    {/* Estados visuales claros */}
                                    {item.status === 'idle' && <span style={{color: '#666'}}>Esperando...</span>}
                                    {item.status === 'uploading' && <span style={{color: '#5a67d8', fontWeight: 'bold'}}>Subiendo... ⏳</span>}
                                    {item.status === 'success' && <span style={{color: 'green', fontWeight: 'bold'}}>¡LISTO! ✅</span>}
                                    {item.status === 'error' && <span style={{color: 'red', fontWeight: 'bold'}}>Error ❌</span>}
                                </div>

                                {/* Botón X Gigante (Solo si no está subiendo) */}
                                {item.status !== 'uploading' && item.status !== 'success' && (
                                    <button 
                                        onClick={() => handleRemoveItem(item.id)} 
                                        style={styles.removeBtn}
                                        title="Eliminar"
                                    >
                                        ✕
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Botón Principal */}
                <button 
                    onClick={handleUploadAll} 
                    style={{...styles.submitBtn, opacity: (isGlobalUploading || fileItems.length === 0) ? 0.5 : 1}}
                    disabled={isGlobalUploading || fileItems.length === 0}
                >
                    {isGlobalUploading ? 'Subiendo...' : `ENVIAR FOTOS (${fileItems.length})`}
                </button>
            </div>

            {/* GALERÍA */}
            <div style={styles.galleryContainer}>
                <h2 style={styles.galleryTitle}>📸 Galería en Vivo</h2>
                <div style={styles.grid}>
                    {galleryPhotos.map((photo, index) => (
                        <div key={index} style={styles.gridItem}>
                            <img src={photo.url} alt="Boda" style={styles.image} loading="lazy" />
                        </div>
                    ))}
                </div>
                {nextPageToken && (
                    <button onClick={handleLoadMore} style={styles.loadMoreBtn} disabled={isLoadingGallery}>
                        {isLoadingGallery ? 'Cargando...' : 'Ver más fotos'}
                    </button>
                )}
            </div>
        </div>
    );
}

// --- ESTILOS ADAPTADOS PARA MÓVIL ---
const styles = {
    pageContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif', padding: '15px' },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '25px', width: '100%', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' },
    title: { margin: '0 0 8px 0', color: '#2d3748', fontSize: '22px' },
    subtitle: { margin: '0 0 25px 0', color: '#718096', fontSize: '14px' },
    
    // Zona de toque más amigable
    dropZone: { border: '3px dashed #cbd5e0', borderRadius: '12px', padding: '30px 15px', cursor: 'pointer', backgroundColor: '#fafafa', marginBottom: '20px' },
    dropZoneActive: { borderColor: '#5a67d8', backgroundColor: '#ebf4ff' },
    iconContainer: { marginBottom: '10px', fontSize: '30px' },
    dropText: { margin: 0, color: '#4a5568', fontWeight: '500' },
    
    // Lista de previsualización mejorada
    previewList: { listStyle: 'none', padding: 0, margin: '0 0 20px 0', textAlign: 'left', maxHeight: '350px', overflowY: 'auto' },
    previewItem: { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #edf2f7' },
    
    // Miniatura más grande (80px)
    thumbnail: { width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', marginRight: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    
    fileInfo: { flex: 1, overflow: 'hidden', fontSize: '14px' },
    fileName: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#2d3748', marginBottom: '4px' },
    
    // Botón eliminar GIGANTE para dedos
    removeBtn: { 
        background: '#fff5f5', 
        border: '1px solid #feb2b2', 
        color: '#c53030', 
        cursor: 'pointer', 
        fontSize: '20px', 
        width: '44px', // Tamaño mínimo táctil recomendado
        height: '44px', 
        borderRadius: '50%', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '10px'
    },
    
    // Botón enviar
    submitBtn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#5a67d8', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(90, 103, 216, 0.3)' },

    // Galería
    galleryContainer: { width: '100%', maxWidth: '800px', textAlign: 'center', paddingBottom: '40px' },
    galleryTitle: { color: '#2d3748', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '100%' }, // 3 columnas en móvil
    gridItem: { backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden', aspectRatio: '1 / 1' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    loadMoreBtn: { marginTop: '25px', padding: '12px 25px', backgroundColor: 'white', border: '2px solid #5a67d8', color: '#5a67d8', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px' }
};
