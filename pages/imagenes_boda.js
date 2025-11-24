import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ImagenesBoda() {
    const [fileItems, setFileItems] = useState([]); 
    const [galleryPhotos, setGalleryPhotos] = useState([]); 
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isGlobalUploading, setIsGlobalUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    
    const MAX_VIDEO_SIZE_MB = 50;
    const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

    // --- 1. FUNCIÓN DE COMPRESIÓN ---
    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1280; 
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
                        if (!blob) return reject(new Error('Error al comprimir'));
                        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        resolve(new File([blob], newFileName, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.7); 
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // --- 2. CARGA DE GALERÍA ---
    const fetchGallery = async (token = null, reset = false) => {
        if (!reset) setIsLoadingGallery(true);
        try {
            let url = '/api/get-photos?limit=20';
            if (token) url += `&pageToken=${encodeURIComponent(token)}`;
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
    
    // --- 3. SELECCIÓN Y PROCESADO ---
    const processNewFiles = (incomingFiles) => {
        const validFiles = Array.from(incomingFiles).filter(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            if (!isImage && !isVideo) {
                alert(`⚠️ El archivo "${file.name}" no es válido.`);
                return false;
            }
            if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
                alert(`⚠️ El vídeo "${file.name}" es demasiado grande.`);
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

    useEffect(() => { return () => { fileItems.forEach(item => URL.revokeObjectURL(item.previewUrl)); }; }, [fileItems]);

    const handleFileSelect = (e) => { 
        if (e.target.files?.length) processNewFiles(e.target.files); 
        e.target.value = null; 
    };
    
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

    // --- 4. SUBIDA ---
    const updateItemStatus = (id, newStatus, errorMessage = null) => {
        setFileItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus, error: errorMessage } : item));
    };

    const uploadSingleItem = async (item) => {
        if (item.status === 'success' || item.status === 'uploading') return;
        updateItemStatus(item.id, 'uploading');
        try {
            let fileToUpload = item.file;
            if (item.file.type.startsWith('image/')) {
                try { fileToUpload = await compressImage(item.file); } catch (e) { console.warn("Error comprimiendo", e); }
            }
            const typeToSend = fileToUpload.type; 
            const urlRes = await fetch('/api/get-signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: fileToUpload.name, fileType: typeToSend }), 
            });
            if (!urlRes.ok) throw new Error('Error permiso');
            const { url } = await urlRes.json();
            const uploadRes = await fetch(url, {
                method: 'PUT', 
                headers: { 'Content-Type': typeToSend },
                body: fileToUpload,
            });
            if (!uploadRes.ok) throw new Error('Error subida');
            updateItemStatus(item.id, 'success');
            setTimeout(() => { fetchGallery(null, true).catch(console.warn); }, 1500); 
        } catch (error) {
            console.error(error);
            updateItemStatus(item.id, 'error', error.message);
        }
    };

    const handleUploadAll = async () => {
        const itemsToUpload = fileItems.filter(i => i.status === 'idle' || i.status === 'error');
        if (itemsToUpload.length === 0) return alert("No hay archivos nuevos.");
        setIsGlobalUploading(true);
        await Promise.all(itemsToUpload.map(item => uploadSingleItem(item)));
        setIsGlobalUploading(false);
        setTimeout(() => { setFileItems(prev => prev.filter(i => i.status !== 'success')); }, 3000);
    };

    const openMediaInModal = (url) => {
        const isVideo = url.match(/\.(mp4|mov|avi|webm|m4v|hevc)$/i);
        setSelectedMedia({ url: url, type: isVideo ? 'video' : 'image' });
    };

    return (
        <div style={styles.pageContainer}>
            <Head>
                <title>Sube tus Fotos de la Boda 📸</title>
                <meta name="description" content="Comparte tus mejores momentos." />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </Head>

            <div style={styles.card}>
                <h1 style={styles.title}>Sube tus fotos de la boda 🥂</h1>
                <p style={styles.subtitle}>Fotos y vídeos cortos (máx 50MB)</p>
                
                <label 
                    style={{ ...styles.dropZone, ...(isDragging ? styles.dropZoneActive : {}) }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div style={styles.iconContainer}>📸 🎥</div>
                    <p style={styles.dropText}>{isDragging ? '¡Suelta aquí!' : 'Toca para seleccionar'}</p>
                    <input type="file" onChange={handleFileSelect} style={{display: 'none'}} multiple accept="image/*,video/*" />
                </label>
                
                {fileItems.length > 0 && (
                    <ul style={styles.previewList}>
                        {fileItems.map((item) => (
                            <li key={item.id} style={styles.previewItem}>
                                {item.isVideo ? (
                                    <div style={styles.videoPreviewBox}><span style={{fontSize:'20px'}}>🎬</span></div>
                                ) : (
                                    <img src={item.previewUrl} alt="Preview" style={styles.thumbnail} />
                                )}
                                <div style={styles.fileInfo}>
                                    <span style={styles.fileName}>{item.file.name}</span>
                                    {item.status === 'idle' && <span style={{color: '#666'}}>{item.isVideo ? 'Vídeo' : 'Foto'}</span>}
                                    {item.status === 'uploading' && <span style={{color: '#5a67d8', fontWeight: 'bold'}}>Subiendo... ⏳</span>}
                                    {item.status === 'success' && <span style={{color: 'green', fontWeight: 'bold'}}>¡LISTO! ✅</span>}
                                    {item.status === 'error' && <span style={{color: 'red', fontWeight: 'bold'}}>Error ❌</span>}
                                </div>
                                {item.status !== 'uploading' && item.status !== 'success' && (
                                    <button onClick={(e) => { e.preventDefault(); handleRemoveItem(item.id); }} style={styles.removeBtn}>✕</button>
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
                    {isGlobalUploading ? 'Subiendo...' : `SUBIR FOTOS`}
                </button>
            </div>

            <div style={styles.galleryContainer}>
                <h2 style={styles.galleryTitle}>📸 Galería en Vivo</h2>
                <div style={styles.grid}>
                    {galleryPhotos.map((media, index) => {
                        const isVid = media.name.match(/\.(mp4|mov|avi|webm|m4v|hevc)$/i);
                        return (
                            <div key={index} style={styles.gridItem} onClick={() => openMediaInModal(media.url)}>
                                {isVid ? (
                                    <div style={styles.videoContainer}>
                                        <div style={{...styles.videoContainer, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                             <span style={{fontSize:'24px'}}>🎬</span>
                                        </div>
                                        <video src={`${media.url}#t=0.1`} preload="metadata" style={styles.videoThumbImg} playsInline muted />
                                        <div style={styles.playIconOverlay}>▶️</div>
                                    </div>
                                ) : (
                                    <img src={media.url} alt="Boda" style={styles.image} loading="lazy" />
                                )}
                            </div>
                        );
                    })}
                </div>
                {nextPageToken && (
                    /* ⚠️ SOLUCIÓN: Usamos un DIV en vez de BUTTON */
                    /* Al ser un div, el móvil no intenta enfocarlo primero, clic directo */
                    <div 
                        onClick={() => {
                            if (!isLoadingGallery) fetchGallery(nextPageToken, false);
                        }}
                        style={{
                            ...styles.loadMoreBtn, 
                            opacity: isLoadingGallery ? 0.6 : 1
                        }}
                    >
                        {isLoadingGallery ? 'Cargando...' : 'Ver más fotos 👇'}
                    </div>
                )}
            </div>

            {selectedMedia && (
                <div style={styles.modalOverlay} onClick={() => setSelectedMedia(null)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.type === 'video' ? (
                            <video src={selectedMedia.url} controls autoPlay playsInline preload="auto" style={styles.modalMedia}>Tu navegador no soporta este video.</video>
                        ) : (
                            <img src={selectedMedia.url} alt="Zoom" style={styles.modalMedia} />
                        )}
                        <button style={styles.closeButton} onClick={() => setSelectedMedia(null)}>✕</button>
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
    dropZone: { display: 'block', border: '3px dashed #cbd5e0', borderRadius: '12px', padding: '30px 15px', cursor: 'pointer', backgroundColor: '#fafafa', marginBottom: '20px' },
    dropZoneActive: { borderColor: '#5a67d8', backgroundColor: '#ebf4ff' },
    iconContainer: { marginBottom: '10px', fontSize: '30px' },
    dropText: { margin: 0, color: '#4a5568', fontWeight: '500' },
    previewList: { listStyle: 'none', padding: 0, margin: '0 0 20px 0', textAlign: 'left', maxHeight: '350px', overflowY: 'auto' },
    previewItem: { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #edf2f7' },
    thumbnail: { width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', marginRight: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    videoPreviewBox: { width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' },
    fileInfo: { flex: 1, overflow: 'hidden', fontSize: '14px' },
    fileName: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#2d3748', marginBottom: '4px' },
    removeBtn: { background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', cursor: 'pointer', fontSize: '20px', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' },
    submitBtn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#5a67d8', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(90, 103, 216, 0.3)' },
    galleryContainer: { width: '100%', maxWidth: '800px', textAlign: 'center', paddingBottom: '40px' },
    galleryTitle: { color: '#2d3748', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '100%' },
    gridItem: { backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden', aspectRatio: '1 / 1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', position: 'relative' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    videoContainer: { width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' },
    videoThumbImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 },
    playIconOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', zIndex: 10 },
    
    // --- ESTILOS ADAPTADOS PARA EL DIV ---
    loadMoreBtn: { 
        // Display inline-block para que actúe como botón
        display: 'inline-block',
        marginTop: '25px', 
        padding: '12px 25px', 
        backgroundColor: 'white', 
        border: '2px solid #5a67d8', 
        color: '#5a67d8', 
        borderRadius: '30px', 
        fontWeight: 'bold', 
        fontSize: '14px', 
        cursor: 'pointer',
        // Propiedades antiselección
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
    },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalMedia: { width: '100%', maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px' },
    closeButton: { position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }
};
