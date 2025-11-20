<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subir Fotos de Boda</title>
    
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8; /* Fondo gris muy suave */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .card {
            background-color: white;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            padding: 40px 30px;
            width: 90%;
            max-width: 400px;
            text-align: center;
        }

        h1 {
            color: #2d3748;
            font-size: 24px;
            margin-bottom: 5px;
            margin-top: 0;
        }

        p.subtitle {
            color: #a0aec0;
            font-size: 14px;
            margin-top: 0;
            margin-bottom: 30px;
        }

        /* Zona de carga (Drag & Drop) */
        .drop-zone {
            background-color: #f7fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 15px;
            padding: 40px 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .drop-zone:hover, .drop-zone.active {
            border-color: #5a67d8;
            background-color: #ebf4ff;
        }

        .icon-container {
            background-color: #eef1f8; /* Azul muy pálido para el fondo del icono */
            width: 80px;
            height: 80px;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 20px auto;
        }
        
        .icon-svg {
            width: 40px;
            height: 40px;
            fill: #7f9cf5; /* Color del icono */
        }

        .drop-text {
            color: #cbd5e0;
            font-size: 14px;
        }

        /* Input oculto */
        input[type="file"] {
            display: none;
        }

        /* Botón Submit */
        .submit-btn {
            background: linear-gradient(90deg, #5a67d8 0%, #667eea 100%);
            color: white;
            border: none;
            border-radius: 10px;
            padding: 15px 0;
            width: 100%;
            font-size: 16px;
            font-weight: bold;
            margin-top: 30px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(90, 103, 216, 0.3);
            transition: transform 0.2s;
        }

        .submit-btn:active {
            transform: scale(0.98);
        }

        /* Vista previa básica */
        .file-preview {
            margin-top: 15px;
            font-size: 12px;
            color: #4a5568;
            text-align: left;
        }
    </style>
</head>
<body>

    <div id="root"></div>

    <script type="text/babel">
        const { useState, useRef } = React;

        function App() {
            const [files, setFiles] = useState([]);
            const [isDragging, setIsDragging] = useState(false);
            const fileInputRef = useRef(null);

            // Manejar clic en la zona para abrir selector de archivos
            const handleZoneClick = () => {
                fileInputRef.current.click();
            };

            // Manejar selección de archivos via input
            const handleFileSelect = (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    setFiles([...files, ...Array.from(e.target.files)]);
                }
            };

            // Manejar Drag & Drop
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
                    setFiles([...files, ...Array.from(e.dataTransfer.files)]);
                }
            };

            const handleSubmit = () => {
                if (files.length === 0) {
                    alert("Por favor selecciona al menos una foto.");
                    return;
                }
                // AQUÍ IRÍA LA LÓGICA PARA ENVIAR AL SERVIDOR
                alert(`¡Listo! Se enviarán ${files.length} fotos.`);
                console.log("Archivos a subir:", files);
            };

            return (
                <div className="card">
                    <h1>Sube tus fotos</h1>
                    <p className="subtitle">rápido y fácil</p>

                    <div 
                        className={`drop-zone ${isDragging ? 'active' : ''}`}
                        onClick={handleZoneClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="icon-container">
                            {/* SVG Icono de imagen/paisaje similar al diseño */}
                            <svg viewBox="0 0 24 24" className="icon-svg">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                        </div>
                        
                        <div className="drop-text">
                            {files.length === 0 
                                ? "Arrastra y suelta o toca aquí" 
                                : `${files.length} archivo(s) seleccionado(s)`
                            }
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            multiple 
                            accept="image/*"
                        />
                    </div>

                    {/* Lista simple de archivos seleccionados (Opcional) */}
                    {files.length > 0 && (
                        <div className="file-preview">
                            <ul>
                                {files.slice(0,3).map((f, i) => <li key={i}>{f.name}</li>)}
                                {files.length > 3 && <li>... y {files.length - 3} más</li>}
                            </ul>
                        </div>
                    )}

                    <button className="submit-btn" onClick={handleSubmit}>
                        Enviar
                    </button>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>

</body>
</html>
