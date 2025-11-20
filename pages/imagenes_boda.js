import React, { useState, useRef } from 'react';

// === COMPONENTE PRINCIPAL ===
export default function ImagenesBoda() {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false); // Nuevo estado
    const fileInputRef = useRef(null);

    // --- LÓGICA DE DRAG AND DROP / UI ---
    const handleZoneClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...Array.from(e.dataTransfer.files)]);
        }
    };
    
    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    // --- LÓGICA DE SUBIDA CON URL FIRMADA (SIGNED URL) ---
    
    const sendFileToServer = async (file) => {
        // === PASO 1: PEDIR LA URL FIRMADA AL SERVIDOR DE VERCEL ===
        const urlResponse = await fetch('/api/get-signed-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name }), // Solo enviamos el nombre
        });

        if (!urlResponse.ok) {
            const error = await urlResponse.json();
            throw new Error(error.message || 'Fallo al obtener la URL firmada.');
        }

        const { url } = await urlResponse.json();
        
        // === PASO 2: SUBIR EL ARCHIVO DIRECTAMENTE A GOOGLE CLOUD ===
        const uploadResponse = await fetch(url, {
            method: 'PUT', 
            // ⚠️ SOLUCIÓN FINAL AL ERROR CORS: No incluimos 'headers' para que el navegador use los que necesita.
            body: file, // Enviamos el objeto File (el payload de la foto)
        });

        if (!uploadResponse.ok) {
            throw new Error(`Error en la subida directa: Código ${uploadResponse.status}`);
        }
    };

    // Función principal del botón
    const handleSubmit = async () => {
        if (files.length === 0) {
            alert("Por favor selecciona al menos una foto.");
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(file => sendFileToServer(file));
            await Promise.all(uploadPromises);
            
            alert(`🎉 ¡Éxito! Se subieron ${files.length} fotos a tu Firebase Storage.`);
            setFiles([]); 
        } catch (error) {
            console.error("Error al subir:", error);
            alert(`🛑 Fallo en la subida. Causa: ${error.message}.`);
        } finally {
            setUploading(false);
        }
    };

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>¡Comparte tus Momentos!</h1>
                <p style={styles.subtitle}>Sube las fotos de la boda para la galería</p>
                
                {/* Zona de Drop */}
                <div 
                    style={{ ...styles.dropZone, ...(isDragging ? styles.dropZoneActive : {}) }}
                    onClick={handleZoneClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div style={styles.iconContainer}>
                        <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12L12 14L14 12M12 14V4M18 18H20C21.1046 18 22 17.1046 22 16V10C22 8.89543 21.1046 8 20 8H4C2.89543 8 2 8.89543 2 10V16C2 17.1046 2.89543 18 4 18H6M18 18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18M18 18H6" stroke="#7f9cf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <p style={{...styles.dropText, color: isDragging ? '#5a67d8' : styles.dropText.color}}>
                        {isDragging ? '¡Suelta las fotos aquí!' : 'Arrastra y suelta tus fotos, o haz click para seleccionar.'}
                    </p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        style={{ display: 'none' }}
                        multiple 
                        accept="image/*" 
                    />
                </div>
                
                {/* Lista de Archivos Seleccionados */}
                {files.length > 0 && (
                    <div style={styles.fileListContainer}>
                        <p style={styles.fileListTitle}>Archivos listos para subir ({files.length}):</p>
                        <ul style={styles.fileList}>
                            {files.map((file, index) => (
                                <li key={index} style={styles.fileItem}>
                                    <span style={styles.fileName}>{file.name}</span>
                                    <button 
                                        onClick={() => handleRemoveFile(index)} 
                                        style={styles.removeBtn}
                                        disabled={uploading}
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Botón de Subida */}
                <button 
                    onClick={handleSubmit} 
                    style={{...styles.submitBtn, opacity: (files.length === 0 || uploading) ? 0.6 : 1}}
                    disabled={files.length === 0 || uploading}
                >
                    {uploading ? 'Subiendo... por favor espera' : `Subir ${files.length} Fotos`}
                </button>
                {uploading && <p style={styles.uploadingText}>El proceso puede tardar dependiendo de tu conexión.</p>}

            </div>
        </div>
    );
}

// === ESTILOS (Mantenidos) ===
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f7f8fc',
        padding: '20px'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
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
        width: '100%',
        padding: '12px',
        marginTop: '25px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#5a67d8',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    fileListContainer: {
        textAlign: 'left',
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        maxHeight: '150px',
        overflowY: 'auto',
    },
    fileListTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2d3748',
        marginBottom: '5px',
    },
    fileList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    fileItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 0',
        borderBottom: '1px solid #f0f0f0',
    },
    fileName: {
        fontSize: '13px',
        color: '#4a5568',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        maxWidth: '85%',
    },
    removeBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#e53e3e',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '0 5px',
        marginLeft: '10px',
    },
    uploadingText: {
        fontSize: '12px',
        color: '#5a67d8',
        marginTop: '10px',
        fontStyle: 'italic',
    }
};
