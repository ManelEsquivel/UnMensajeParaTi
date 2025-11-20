import React, { useState, useRef } from 'react';

export default function ImagenesBoda() {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleZoneClick = () => fileInputRef.current.click();
    const handleFileSelect = (e) => {
        if (e.target.files?.length) setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files?.length) setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    };
    const handleRemoveFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    // --- LÓGICA DE SUBIDA ---
    const sendFileToServer = async (file) => {
        // 1. Determinar el tipo (si está vacío, usamos octet-stream por defecto)
        const contentType = file.type || 'application/octet-stream';

        // 2. Pedir URL firmada enviando el tipo EXACTO
        const urlResponse = await fetch('/api/get-signed-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fileName: file.name,
                fileType: contentType 
            }), 
        });

        if (!urlResponse.ok) throw new Error('Fallo al obtener permiso del servidor.');

        const { url } = await urlResponse.json();
        
        // 3. Subir a Google usando el MISMO Content-Type
        const uploadResponse = await fetch(url, {
            method: 'PUT', 
            headers: { 'Content-Type': contentType },
            body: file,
        });

        if (!uploadResponse.ok) throw new Error(`Error subiendo a Google: ${uploadResponse.status}`);
    };

    const handleSubmit = async () => {
        if (files.length === 0) return alert("Selecciona una foto.");
        setUploading(true);
        try {
            await Promise.all(files.map(file => sendFileToServer(file)));
            alert(`🎉 ¡Éxito! Se subieron ${files.length} fotos.`);
            setFiles([]); 
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

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
                    <p style={styles.dropText}>{isDragging ? '¡Suelta aquí!' : 'Toca para seleccionar fotos'}</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{display:'none'}} multiple accept="image/*" />
                </div>
                {files.length > 0 && (
                    <div style={styles.fileListContainer}>
                        <ul style={styles.fileList}>
                            {files.map((f, i) => (
                                <li key={i} style={styles.fileItem}>
                                    <span style={styles.fileName}>{f.name}</span>
                                    <button onClick={() => handleRemoveFile(i)} style={styles.removeBtn}>✕</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <button onClick={handleSubmit} style={{...styles.submitBtn, opacity: uploading ? 0.7 : 1}} disabled={uploading || !files.length}>
                    {uploading ? 'Subiendo...' : 'Enviar Fotos'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    pageContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    title: { margin: '0 0 10px 0', color: '#333' },
    subtitle: { margin: '0 0 20px 0', color: '#666', fontSize: '14px' },
    dropZone: { border: '2px dashed #ccc', borderRadius: '8px', padding: '40px 20px', cursor: 'pointer', backgroundColor: '#fafafa' },
    dropZoneActive: { borderColor: '#5a67d8', backgroundColor: '#eef2ff' },
    iconContainer: { marginBottom: '15px', fontSize: '24px' },
    dropText: { margin: 0, color: '#888' },
    submitBtn: { width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: 'none', backgroundColor: '#5a67d8', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    fileListContainer: { marginTop: '20px', textAlign: 'left', maxHeight: '100px', overflowY: 'auto' },
    fileList: { listStyle: 'none', padding: 0, margin: 0 },
    fileItem: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid #eee' },
    fileName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' },
    removeBtn: { background: 'none', border: 'none', color: 'red', cursor: 'pointer' }
};
