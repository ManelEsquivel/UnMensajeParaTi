import React, { useState, useRef, useEffect } from 'react';

export default function ImagenesBoda() {
    const [fileItems, setFileItems] = useState([]); 
    const [galleryPhotos, setGalleryPhotos] = useState([]); 
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isGlobalUploading, setIsGlobalUploading] = useState(false);
    
    // ESTADO PARA EL ZOOM (Lightbox)
    const [selectedImage, setSelectedImage] = useState(null);

    const fileInputRef = useRef(null);

    // 🛑 CONFIGURACIÓN DE LÍMITE (50 MB)
    const MAX_VIDEO_SIZE_MB = 50;
    const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

    // --- 1. COMPRESIÓN DE IMÁGENES (AHORRO DE DATOS) ---
    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1280; // Calidad HD Móvil
                    const MAX_HEIGHT = 1280;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) return reject(new Error('Error compresión'));
                        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        resolve(new File([blob], newFileName, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.7); // Calidad 70%
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // --- 2. CARGA DE GALERÍA ---
    const fetchGallery = async (token = null, reset = false) => {
        if (!reset) setIsLoadingGallery(true);
        try {
            let url = '/api/get-photos';
            if (token) url += `?pageToken=${token}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                // Filtramos para mostrar solo imágenes en la galería visual
                const onlyImages = data.photos.filter(p => !p.name.match(/\.(mp4|mov|avi|webm)$/i));
                
                if (reset) {
                    setGalleryPhotos(data.photos); // (Opcional: usa onlyImages si prefieres ocultar videos)
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

    // --- 3. SELECCIÓN Y FILTRADO DE ARCHIVOS ---
    const processNewFiles = (incomingFiles) => {
        const validFiles = Array.from(incomingFiles).filter(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) {
                alert(`⚠️ El archivo "${file.name}" no es válido. Solo fotos y vídeos.`);
                return false;
            }

            // Validación de tamaño para vídeos
            if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
                alert(`⚠️ El vídeo "${file.name}" es demasiado grande.\nLímite: ${MAX_VIDEO_SIZE_MB}MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const newItems = validFiles.map(file => ({
            id: Date.now() + Math.random(), 
            file: file,
            previewUrl: URL.createObjectURL(file),
            isVideo: file.type.startsWith('video/'),
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

    // --- 4. SUBIDA INDIVIDUAL ---
    const updateItemStatus = (id, newStatus, errorMessage = null) => {
        setFileItems(prev => prev.map(item => 
            item.id === id ? { ...item, status: newStatus, error: errorMessage } : item
        ));
    };

    const uploadSingleItem = async (item) => {
        if (item.status === 'success' || item.status === 'uploading') return;
        updateItemStatus(item.id, 'uploading');

        try {
            let fileToUpload = item.file;

            // Si es IMAGEN -> Comprimir. Si es VIDEO -> Original.
            if (item.file.type.startsWith('image/')) {
                try {
                    fileToUpload = await compressImage(item.file);
                } catch (e) {
                    console.warn("No se pudo comprimir, subiendo original", e);
                }
            }

            // IMPORTANTE: Usar siempre el tipo del archivo final
            const typeToSend = fileToUpload.type; 

            // 1. Obtener URL Firmada
            const urlRes = await fetch('/api/get-signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: fileToUpload.name, fileType: typeToSend }), 
            });
            
            if (!urlRes.ok) {
                const err = await urlRes.json();
                throw new Error(err.message || 'Error permiso');
            }
            const { url } = await urlRes.json();
            
            // 2. Subir a Google (SIN HEADERS MANUALES para evitar CORS)
            // El navegador detectará automáticamente el Content-Type del Blob/File
            const uploadRes = await fetch(url, {
                method: 'PUT', 
                body: fileToUpload,
            });
            
            if (!uploadRes.ok) throw new Error('Error subida');

            updateItemStatus(item.id, 'success');
            // Recargar galería en segundo plano
            fetchGallery(null, true); 

        } catch (error) {
            console.error(error);
            updateItemStatus(item.id, 'error', error.message);
        }
    };

    const handleUploadAll = async () => {
        const itemsToUpload = fileItems.filter(i => i.status === 'idle' || i.status === 'error');
        if (itemsToUpload.length === 0) return alert("No hay archivos nuevos para subir.");
        setIsGlobalUploading(true);
        await Promise.all(itemsToUpload.map(item => uploadSingleItem(item)));
        setIsGlobalUploading(false);
        setTimeout(() => {
            setFileItems(prev => prev.filter(i => i.status !== 'success'));
        }, 2000);
    };

    // Helper para abrir modal o video
    const openMedia = (url) => {
        if (url.match(/\.(mp4|mov|avi|webm)$/i)) {
            window.open(url, '_blank');
        } else {
            setSelectedImage(url);
        }
    };

    // --- RENDERIZADO ---
    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>Sube tus Recuerdos</h1>
                <p style={styles.subtitle}>Fotos y vídeos cortos (máx 50MB)</p>
                
                <div 
                    style={{ ...styles.dropZone, ...(isDragging ? styles.dropZoneActive : {}) }}
                    onClick={handleZoneClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div style={styles.iconContainer}>📸 🎥</div>
                    <p style={styles.dropText}>{isDragging ? '¡Suelta aquí!' : 'Toca para seleccionar'}</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{display:'none'}} multiple accept="image/*,video/*" />
                </div>
                
                {fileItems.length > 0 && (
                    <ul style={styles.previewList}>
                        {fileItems.map((item) => (
                            <li key={item.id} style={styles.previewItem}>
                                {item.isVideo ? (
                                    <div style={styles.videoPlaceholder}>🎥</div>
                                ) : (
                                    <img src={item.previewUrl} alt="Preview" style={styles.thumbnail} />
                                )}
                                <div style={styles.fileInfo}>
                                    <span style={styles.fileName}>{item.file.name}</span>
                                    {item.status === 'idle' && <span style={{color: '#666'}}>
                                        {item.isVideo ? `Vídeo (${(item.file.size / 1024 / 1024).toFixed(1)} MB)` : 'Foto'}
                                    </span>}
                                    {item.status === 'uploading' && <span style={{color: '#5a67d8', fontWeight: 'bold'}}>Subiendo... ⏳</span>}
                                    {item.status === 'success' && <span style={{color: 'green', fontWeight: 'bold'}}>¡LISTO! ✅</span>}
                                    {item.status === 'error' && <span style={{color: 'red', fontWeight: 'bold'}}>Error ❌</span>}
                                </div>
                                {item.status !== 'uploading' && item.status !== 'success' && (
                                    <button onClick={() => handleRemoveItem(item.id)} style={styles.removeBtn}>✕</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <button 
                    onClick={handleUploadAll} 
                    style={{...styles.submitBtn, opacity: (isGlobalUploading || fileItems.length === 0) ? 0.5 : 1}}
                    disabled={isGlobalUploading || fileItems.length === 0}
                >
                    {isGlobalUploading ? 'Subiendo...' : `ENVIAR ARCHIVOS`}
                </button>
            </div>

            <div style={styles.galleryContainer}>
                <h2 style={styles.galleryTitle}>📸 Galería en Vivo</h2>
                <div style={styles.grid}>
                    {galleryPhotos.map((media, index) => {
                        const isVid = media.name.match(/\.(mp4|mov|avi|webm)$/i);
                        return (
                            <div key={index} style={styles.gridItem} onClick={() => openMedia(media.url)}>
                                {isVid ? (
                                    <div style={styles.videoThumb}>🎥 VIDEO</div>
                                ) : (
                                    <img src={media.url} alt="Boda" style={styles.image} loading="lazy" onContextMenu={(e) => e.preventDefault()} />
                                )}
                            </div>
                        );
                    })}
                </div>
                {nextPageToken && (
                    <button onClick={handleLoadMore} style={styles.loadMoreBtn} disabled={isLoadingGallery}>
                        {isLoadingGallery ? 'Cargando...' : 'Ver más fotos'}
                    </button>
                )}
            </div>

            {/* MODAL ZOOM */}
            {selectedImage && (
                <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
                    <div style={styles.modalContent}>
                        <img src={selectedImage} alt="Zoom" style={styles.modalImage} onContextMenu={(e) => e.preventDefault()} />
                        <button style={styles.closeButton} onClick={() => setSelectedImage(null)}>✕</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    pageContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif', padding: '15px' },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '25px', width: '100%', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' },
    title: { margin: '0 0 8px 0', color: '#2d3748', fontSize: '22px' },
    subtitle: { margin: '0 0 25px 0', color: '#718096', fontSize: '14px' },
    dropZone: { border: '3px dashed #cbd5e0', borderRadius: '12px', padding: '30px 15px', cursor: 'pointer', backgroundColor: '#fafafa', marginBottom: '20px' },
    dropZoneActive: { borderColor: '#5a67d8', backgroundColor: '#eef2ff' },
    iconContainer: { marginBottom: '10px', fontSize: '30px' },
    dropText: { margin: 0, color: '#4a5568', fontWeight: '500' },
    previewList: { listStyle: 'none', padding: 0, margin: '0 0 20px 0', textAlign: 'left', maxHeight: '350px', overflowY: 'auto' },
    previewItem: { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #edf2f7' },
    thumbnail: { width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', marginRight: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    videoPlaceholder: { width: '80px', height: '80px', borderRadius: '8px', background: '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '24px' },
    fileInfo: { flex: 1, overflow: 'hidden', fontSize: '14px' },
    fileName: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#2d3748', marginBottom: '4px' },
    removeBtn: { background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', cursor: 'pointer', fontSize: '20px', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' },
    submitBtn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#5a67d8', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(90, 103, 216, 0.3)' },
    
    galleryContainer: { width: '100%', maxWidth: '800px', textAlign: 'center', paddingBottom: '40px' },
    galleryTitle: { color: '#2d3748', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '100%' },
    gridItem: { backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden', aspectRatio: '1 / 1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    videoThumb: { fontSize: '12px', color: '#333', fontWeight: 'bold' },
    loadMoreBtn: { marginTop: '25px', padding: '12px 25px', backgroundColor: 'white', border: '2px solid #5a67d8', color: '#5a67d8', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, cursor: 'zoom-out' },
    modalContent: { position: 'relative', maxWidth: '95%', maxHeight: '95%' },
    modalImage: { maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' },
    closeButton: { position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer' }
};
