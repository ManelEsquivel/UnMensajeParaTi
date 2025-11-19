// components/SavetheDate.js
import Head from 'next/head';

export default function SavetheDate() {
    
    // Función para manejar el desplazamiento
    if (typeof window !== 'undefined') {
        window.onload = function() {
            window.scrollTo(0, 50); 
        };
    }

    return (
        <>
            <Head>
                <title>Save The Date - Manel & Carla</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                {/* Tailwind CSS CDN */}
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />
                {/* Google Fonts */}
                <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="main-container">
                
                <div className="invitation-frame"> 

                    {/* Íconos de Hoja (SVG) */}
                    <div className="leaf-detail top-left-leaf">
                        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M 5 95 C 30 75, 75 30, 95 5" />
                            <path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/>
                            <path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/>
                            <circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
                        </svg>
                    </div>
                    
                    <div className="leaf-detail top-right-leaf">
                        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M 5 95 C 30 75, 75 30, 95 5" />
                            <path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/>
                            <path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/>
                            <circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
                        </svg>
                    </div>

                    <div className="leaf-detail bottom-right-leaf">
                        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M 5 95 C 30 75, 75 30, 95 5" />
                            <path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/>
                            <path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/>
                            <circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
                        </svg>
                    </div>

                    <div className="leaf-detail bottom-left-leaf">
                        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M 5 95 C 30 75, 75 30, 95 5" />
                            <path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/>
                            <path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/>
                            <circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
                        </svg>
                    </div>
                    
                    
                    <p className="animated-item step-1 text-xl tracking-widest uppercase mb-6 text-gray-800">
                        Save The Date
                    </p>

                    <h1 className="animated-item step-2 text-6xl font-normal text-gray-800 mb-0 leading-tight">Manel</h1>
                    <p className="animated-item step-2-5 text-4xl font-extrabold my-2 accent-color leading-tight">&</p> 
                    <h1 className="animated-item step-3 text-6xl font-normal text-gray-800 mt-0 mb-4 leading-tight">Carla</h1>

                    <p className="animated-item step-4 text-3xl font-bold mb-8 accent-color">
                        31 · 10 · 2026
                    </p>
                    <p></p>
                    {/* --- CORRECCIÓN AQUÍ: Volviendo a la clase original (text-xl y text-gray-800) --- */}
                    <p className="animated-item step-5 text-xl mt-16 mb-6 text-gray-800">
                        Masia Mas Llombart<br/>Sant Fost de Campsentelles, Barcelona
                    </p>
                    {/* --------------------------------------------------------------------------------- */}

                    <p className="animated-item step-6 text-base italic text-gray-500 mb-8">
                        ¡Nos encantaría que nos acompañaras en nuestro gran día!
                    </p>

                    <div className="animated-item step-7">
                        <a href="https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3" target="_blank" className="btn-details">
                            Confirmar Asistencia
                        </a>
                    </div>
                    
                </div>

                <style jsx global>{`
                    .main-container {
                        min-height: 100vh;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        /* Revertimos el fondo a la imagen original */
                        background: url('https://raw.githubusercontent.com/ManelEsquivel/SaveTheDate/main/anillos.png') no-repeat center center fixed;
                        background-size: cover;
                        overflow: hidden; 
                    }
                    
                    body {
                        font-family: 'Cormorant Garamond', serif;
                        position: relative;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background-color: #f7f3ed; /* Color de fondo base */
                        color: #3e2f1c; /* <--- COLOR ORIGINAL REVERTIDO */
                        overflow: hidden;
                    }

                    .invitation-frame {
                        position: relative;
                        z-index: 10; 
                        width: 100%;
                        max-width: 400px;
                        padding: 3rem 1.5rem; 
                        text-align: center;
                        
                        background-color: rgba(245, 245, 245, 0.7); /* Opacidad original */
                        background-blend-mode: overlay; 

                        /* --- EFECTO DE BRILLO EN EL BORDE DE LA CAJA (CASCADA DE LUCES) --- */
                        box-shadow: 0 0 0px 0px rgba(255, 255, 255, 0.8), 0 15px 50px rgba(0, 0, 0, 0.15); /* Sombra base */
                        border: 1px solid #e0d8c7; 
                        border-radius: 12px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        animation: borderGlow 6s ease-in-out infinite alternate; /* Animación para el brillo */
                    }

                    @keyframes borderGlow {
                        0% { box-shadow: 0 0 0px 0px rgba(255, 255, 255, 0.8), 0 15px 50px rgba(0, 0, 0, 0.15); }
                        50% { box-shadow: 0 0 20px 5px rgba(255, 255, 255, 0.8), 0 15px 50px rgba(0, 0, 0, 0.15); }
                        100% { box-shadow: 0 0 0px 0px rgba(255, 255, 255, 0.8), 0 15px 50px rgba(0, 0, 0, 0.15); }
                    }
                    /* --- FIN EFECTO DE BRILLO --- */
                    
                    /* --- ADORNOS DE ESQUINA (LEAF DETAIL) --- */
                    .leaf-detail {
                        position: absolute;
                        width: 70px;
                        height: 70px;
                        z-index: 15; 
                        color: #d4af94; /* Color suave para los adornos */
                        opacity: 0;
                        animation: fadeIn 0.8s forwards; 
                        animation-delay: 0.2s; 
                    }
                    .top-left-leaf { top: 5px; left: 5px; transform: rotate(0deg); }
                    .top-right-leaf { top: 5px; right: 5px; transform: rotate(90deg); }
                    .bottom-right-leaf { bottom: 5px; right: 5px; transform: rotate(180deg); }
                    .bottom-left-leaf { bottom: 5px; left: 5px; transform: rotate(-90deg); }

                    @keyframes fadeIn {
                        to { opacity: 1; }
                    }

                    .accent-color {
                        color: #b18579; 
                    }

                    .animated-item {
                        opacity: 0;
                        transform: translateY(15px);
                        animation-fill-mode: forwards;
                        animation-name: fadeInSlide;
                        font-family: 'Cormorant Garamond', serif; 
                        animation-duration: 0.8s;
                    }

                    @keyframes fadeInSlide {
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .step-1 { animation-delay: 0.2s; }
                    .step-2 { animation-delay: 1.0s; }
                    .step-2-5 { animation-delay: 1.6s; }
                    .step-3 { animation-delay: 2.2s; }
                    .step-4 { animation-delay: 3.2s; }
                    .step-5 { animation-delay: 4.0s; }
                    .step-6 { animation-delay: 4.8s; }
                    .step-7 { animation-delay: 5.6s; }
                    .step-8 { animation-delay: 6.6s; }

                    .btn-details {
                        font-family: 'Noto Sans', sans-serif;
                        background-color: #b18579;
                        color: white;
                        padding: 0.75rem 1.75rem;
                        border-radius: 6px;
                        text-decoration: none;
                        transition: background-color 0.3s, transform 0.1s;
                        display: inline-block;
                        box-shadow: 0 4px 10px rgba(177, 133, 121, 0.4);
                    }

                    .btn-details:hover {
                        background-color: #9c7569;
                        transform: translateY(-1px);
                    }
                `}</style>
            </div>
        </>
    );
}
