import React, { useState, useRef, useEffect } from 'react';

export default function ImagenesBoda() {
    // NOTA: Ahora 'fileItems' es una lista de objetos complejos, no solo archivos planos.
    const [fileItems, setFileItems] = useState([]); 
    const [galleryPhotos, setGalleryPhotos] = useState([]); 
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    // El estado global 'uploading' ya no es tan necesario, usamos el estado individual de cada foto
    const [isGlobalUploading, setIsGlobalUploading] = useState(false);
    
    const fileInputRef = useRef(null);

    // --- CARGA DE GALERÍA (Igual que antes) ---
    const fetchGallery = async (token = null, reset = false) => {
        setIsLoadingGallery(true);
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
            setIsLoadingGallery(false);
        }
    };

    useEffect(() => { fetchGallery(); }, []);
    const handleLoadMore = () => { if (nextPageToken) fetchGallery(nextPageToken, false); };

    // --- NUEVA LÓGICA DE SELECCIÓN DE ARCHIVOS ---
    
    const processNewFiles = (incomingFiles) => {
        const newItems = Array.from(incomingFiles).map(file => ({
            id: Date.now() + Math.random(), // ID único para React
            file: file,
            // Creamos una URL temporal para mostrar la previsualización
            previewUrl: URL.createObjectURL(file),
            status: 'idle' // Estado inicial: esperando
        }));
        setFileItems(prev => [...prev, ...newItems]);
    };

    // Limpieza de memoria de las previsualizaciones cuando se desmonta el componente
    useEffect(() => {
        return () => {
            fileItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
        };
    }, [fileItems]);

    const handleZoneClick = () => fileInputRef.current.click();
    const handleFileSelect = (e) => { if (e.target.files?.length) processNewFiles(e.target.files); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files?.length) processNewFiles(e.dataTransfer.files);
    };
    
    // Eliminar un archivo de la lista de espera
    const handleRemoveItem = (idToRemove) => {
        setFileItems(prev => {
             // Importante: liberar la memoria de la URL de previsualización
            const item = prev.find(i => i.id === idToRemove);
            if (item) URL.revokeObjectURL(item.previewUrl);
            return prev.filter(i => i.id !== idToRemove);
        });
    };

    // --- LÓGICA DE SUBIDA INDIVIDUAL ---

    // Función auxiliar para actualizar el estado de UN solo ítem
    const updateItemStatus = (id, newStatus, errorMessage = null) => {
        setFileItems(prev => prev.map(item => 
            item.id === id ? { ...item, status: newStatus, error: errorMessage } : item
        ));
    };

    // La función principal que sube UN archivo y gestiona sus estados visuales
    const uploadSingleItem = async (item) => {
        if (item.status === 'success' || item.status === 'uploading') return;

        updateItemStatus(item.id, 'uploading');

        try {
            const file = item.file;
            const typeToSend = file.type || 'application/octet-stream';

            // 1. Pedir URL
            const urlRes = await fetch('/api/get-signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileType: typeToSend }), 
            });
            if (!urlRes.ok) throw new Error('Error de permiso');
            const { url } = await urlRes.json();
            
            // 2. Subir a Google
            const uploadRes = await fetch(url, {
                method: 'PUT', 
                headers: { 'Content-Type': typeToSend },
                body: file,
            });
            if (!uploadRes.ok) throw new Error('Error al subir');

            // ¡Éxito!
            updateItemStatus(item.id, 'success');
            return true; // Retorna éxito

        } catch (error) {
            console.error(error);
            updateItemStatus(item.id, 'error', error.message);
            return false; // Retorna fallo
        }
    };

    // Botón grande "Enviar Todas": Sube todas las que estén en estado 'idle' o 'error'
    const handleUploadAll = async () => {
        const itemsToUpload = fileItems.filter(i => i.status === 'idle' || i.status === 'error');
        if (itemsToUpload.length === 0) return alert("No hay fotos nuevas para subir.");

        setIsGlobalUploading(true);
        // Ejecutamos todas las subidas individuales en paralelo
        await Promise.all(itemsToUpload.map(item => uploadSingleItem(item)));
        
        setIsGlobalUploading(false);
        // Recargar galería si hubo éxitos
        setTimeout(() => fetchGallery(null, true), 1500);
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
                
                {/* --- NUEVA LISTA DE PREVISUALIZACIÓN --- */}
                {fileItems.length > 0 && (
                    <ul style={styles.previewList}>
                        {fileItems.map((item) => (
                            <li key={item.id} style={styles.previewItem}>
                                {/* Miniatura */}
                                <img src={item.previewUrl} alt="Preview" style={styles.thumbnail} />
                                
                                {/* Info y Estado */}
                                <div style={styles.fileInfo}>
                                    <span style={styles.fileName}>{item.file.name}</span>
                                    {item.status === 'uploading' && <span style={styles.statusText}>Subiendo... ⏳</span>}
                                    {item.status === 'success' && <span style={{color: 'green'}}>¡Subida! ✅</span>}
                                    {item.status === 'error' && <span style={{color: 'red'}}>Error ❌</span>}
                                </div>

                                {/* Botones de Acción Individuales */}
                                <div style={styles.actions}>
                                    {/* Botón Subir Individual (solo si no se está subiendo ya ni ha terminado) */}
                                    {(item.status === 'idle' || item.status === 'error') && (
                                        <button 
                                            onClick={() => uploadSingleItem(item)} 
                                            style={styles.miniUploadBtn}
                                            disabled={isGlobalUploading}
                                            title="Subir esta foto"
                                        >
                                            ⬆️
                                        </button>
                                    )}
                                    
                                    {/* Botón Cancelar/Borrar (siempre visible salvo si se está subiendo) */}
                                    {item.status !== 'uploading' && (
                                        <button 
                                            onClick={() => handleRemoveItem(item.id)} 
                                            style={styles.removeBtn}
                                            title="Eliminar"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Botón Principal Global */}
                <button 
                    onClick={handleUploadAll} 
                    style={{...styles.submitBtn, opacity: (isGlobalUploading || fileItems.length === 0) ? 0.7 : 1}}
                    disabled={isGlobalUploading || fileItems.length === 0}
                >
                    {isGlobalUploading ? 'Subiendo todo...' : `Enviar ${fileItems.filter(i => i.status === 'idle').length > 0 ? 'Todas' : ''} las Fotos`}
                </button>
            </div>

            {/* --- GALERÍA (Igual que antes) --- */}
            <div style={styles.galleryContainer}>
                <h2 style={styles.galleryTitle}>📸 Galería de la Boda</h2>
                <div style={styles.grid}>
                    {galleryPhotos.length === 0 ? (
                        <p style={{color: '#888', width: '100%', gridColumn: '1/-1'}}>Aún no hay fotos.</p>
                    ) : (
                        galleryPhotos.map((photo, index) => (
                            <div key={index} style={styles.gridItem}>
                                <img src={photo.url} alt="Boda" style={styles.image} loading="lazy" />
                            </div>
                        ))
                    )}
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

// --- NUEVOS ESTILOS ---
const styles = {
    pageContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif', padding: '20px 10px' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '40px' },
    title: { margin: '0 0 10px 0', color: '#333' },
    subtitle: { margin: '0 0 20px 0', color: '#666', fontSize: '14px' },
    dropZone: { border: '2px dashed #ccc', borderRadius: '8px', padding: '30px 20px', cursor: 'pointer', backgroundColor: '#fafafa', marginBottom: '20px' },
    dropZoneActive: { borderColor: '#5a67d8', backgroundColor: '#eef2ff' },
    iconContainer: { marginBottom: '10px', fontSize: '24px' },
    dropText: { margin: 0, color: '#888' },
    submitBtn: { width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: 'none', backgroundColor: '#5a67d8', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    
    // --- ESTILOS NUEVOS PARA LA LISTA PRELIMINAR ---
    previewList: { listStyle: 'none', padding: 0, margin: '20px 0', textAlign: 'left', maxHeight: '300px', overflowY: 'auto', borderTop: '1px solid #eee' },
    previewItem: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    thumbnail: { width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', marginRight: '15px' },
    fileInfo: { flex: 1, overflow: 'hidden', fontSize: '14px' },
    fileName: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' },
    statusText: { fontSize: '12px', color: '#666' },
    actions: { display: 'flex', alignItems: 'center', gap: '10px' },
    miniUploadBtn: { background: '#eef2ff', border: 'none', color: '#5a67d8', cursor: 'pointer', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    removeBtn: { background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px', padding: '5px' },

    // Estilos Galería (Iguales)
    galleryContainer: { width: '100%', maxWidth: '800px', textAlign: 'center', paddingBottom: '40px' },
    galleryTitle: { color: '#333', marginBottom: '20px', fontSize: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', width: '100%' },
    gridItem: { backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', aspectRatio: '1 / 1' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    loadMoreBtn: { marginTop: '20px', padding: '10px 20px', backgroundColor: 'transparent', border: '2px solid #5a67d8', color: '#5a67d8', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }
};
