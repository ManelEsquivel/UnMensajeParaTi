import React, { useState, useRef } from 'react';

// NOTA: Ya no necesitamos importar 'firebase/storage' aquí porque la subida ocurre en el servidor.

export default function ImagenesBoda() {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false); // Indica si está subiendo
    const fileInputRef = useRef(null);

    // --- LÓGICA DE ENVÍO A LA RUTA API DEL SERVIDOR ---
    
    // Función que envía un solo archivo al endpoint local de Vercel (/api/upload-photo)
    const sendFileToServer = async (file) => {
        const formData = new FormData();
        // 'photos' es el nombre del campo que el servidor espera (pages/api/upload-photo.js)
        formData.append('photos', file); 

        // Enviamos la petición al API Route local de Next.js
        const response = await fetch('/api/upload-photo', {
            method: 'POST',
            body: formData, // FormData maneja automáticamente los headers
        });

        // Si el servidor (API Route) devuelve un error, lo lanzamos
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || `Error del servidor: Código ${response.status}`);
        }
        // Si response.ok es true, el archivo se subió a Firebase.
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            alert("Por favor selecciona al menos una foto.");
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(file => sendFileToServer(file));
            await Promise.all(uploadPromises);
            
            alert(`¡Éxito! Se subieron ${files.length} fotos a tu Firebase Storage.`);
            setFiles([]); 
        } catch (error) {
            console.error("Error al subir:", error);
            alert(`Fallo en la subida. Causa: ${error.message}.`);
        } finally {
            setUploading(false);
        }
    };
    // --- FIN LÓGICA DE ENVÍO ---


    // --- LÓGICA DE MANEJO DE ARCHIVOS (UI) ---
    const handleZoneClick = () => { fileInputRef.current.click(); };
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles([...files, ...Array.from(e.dataTransfer.files)]);
        }
    };

    // --- RENDERIZADO ---
    const buttonText = uploading ? "Subiendo..." : "Submit";

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>Upload your photos</h1>
                <p style={styles.subtitle}>fast and easy way</p>

                <div 
                    style={{
                        ...styles.dropZone,
                        ...(isDragging ? styles.dropZoneActive : {})
                    }}
                    onClick={handleZoneClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div style={styles.iconContainer}>
                        <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                    </div>
                    
                    <div style={styles.dropText}>
                        {files.length === 0 
                            ? "Drag and drop files here" 
                            : `${files.length} archivo(s) listo(s)`
                        }
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        multiple 
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>

                <button 
                    style={styles.submitBtn} 
                    onClick={handleSubmit}
                    disabled={uploading || files.length === 0}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

// --- ESTILOS EN JAVASCRIPT (Inline Styles) ---
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        margin: 0,
        padding: 0
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        padding: '40px 30px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center'
    },
    title: {
        color: '#2d3748',
        fontSize: '24px',
        marginBottom: '5px',
        marginTop: 0,
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#a0aec0',
        fontSize: '14px',
        marginTop: 0,
        marginBottom: '30px'
    },
    dropZone: {
        backgroundColor: '#f7fafc',
        border: '2px dashed #e2e8f0',
        borderRadius: '15px',
        padding: '40px 20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
    },
    dropZoneActive: { 
        borderColor: '#5a67d8',
        backgroundColor: '#ebf4ff'
    },
    iconContainer: {
        backgroundColor: '#eef1f8',
        width: '80px',
        height: '80px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 20px auto'
    },
    iconSvg: {
        width: '40px',
        height: '40px',
        fill: '#7f9cf5'
    },
    dropText: {
        color: '#cbd5e0',
        fontSize: '14px'
    },
    submitBtn: {
        background: 'linear-gradient(90deg, #5a67d8 0%, #667eea 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '15px 0',
        width: '100%',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '30px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(90, 103, 216, 0.3)'
    }
};
