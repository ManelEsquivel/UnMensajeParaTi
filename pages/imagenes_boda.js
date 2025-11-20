import React, { useState, useRef } from 'react';

export default function ImagenesBoda() {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false); // Indica si está subiendo
    const fileInputRef = useRef(null);

    // --- LÓGICA DE SUBIDA A FIREBASE (USANDO FETCH NATIVO) ---
    
    // Función que sube un solo archivo usando la API REST de Google Cloud.
    const uploadFile = async (file) => {
        // Tu bucket es boda-74934.appspot.com
        const bucketName = "boda-74934.appspot.com";
        const path = `bodas/${file.name}`;
        
        // URL directa a la API de Google Cloud Storage (Método PUT)
        const url = `https://storage.googleapis.com/${bucketName}/${path}`;

        console.log(`Intentando subir a: ${url}`);

        // La subida simple requiere el método PUT y el archivo en el cuerpo (body)
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                // El Content-Type debe coincidir con el tipo de archivo
                'Content-Type': file.type || 'application/octet-stream',
            },
            body: file, // Envía el objeto de archivo directamente
        });

        if (!response.ok) {
            // Si la respuesta no es OK (ej. 403 Forbidden, 404 Not Found)
            const errorText = await response.text();
            throw new Error(`Error ${response.status} (${response.statusText}): ${errorText.substring(0, 100)}...`);
        }
        // Si response.ok es true, la promesa se resuelve y el archivo se subió.
    };

    // Función principal del botón
    const handleSubmit = async () => {
        if (files.length === 0) {
            alert("Por favor selecciona al menos una foto.");
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(file => uploadFile(file));
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
    // --- FIN LÓGICA DE SUBIDA ---


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
