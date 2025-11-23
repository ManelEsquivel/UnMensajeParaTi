import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- ESTADOS ---
    const playerRef = useRef(null);
    const [showVideo, setShowVideo] = useState(true); 
    const [isFadingOut, setIsFadingOut] = useState(false);

    // 0: Cerrado (Se ve el sobre)
    // 1: Animación (El sobre baja, la carta sube)
    // 2: Carta lista
    const [animationStep, setAnimationStep] = useState(0);

    // --- LÓGICA DE VIDEO (MÉTODO IFRAME NATIVO) ---
    // Usamos este método porque es el único que garantiza autoplay en iPhone/Android
    // al cargar el iframe directamente en el HTML inicial.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Cargamos la API solo para detectar cuando termina
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                document.head.appendChild(tag);
            }

            // Función que conecta con el iframe YA EXISTENTE
            const onYouTubeIframeAPIReady = () => {
                playerRef.current = new window.YT.Player('video-iframe', {
                    events: {
                        'onStateChange': (event) => {
                            // 0 = Terminó el video
                            if (event.data === 0) {
                                handleVideoEnd();
                            }
                        }
                    }
                });
            };

            // Polling para conectar en cuanto la API cargue
            const interval = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    onYouTubeIframeAPIReady();
                    clearInterval(interval);
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, []);

    const handleVideoEnd = () => {
        if (isFadingOut) return;
        setIsFadingOut(true);
        setTimeout(() => {
            setShowVideo(false);
        }, 1500); 
    };

    // --- LÓGICA DE ANIMACIÓN DEL SOBRE ---
    const startAnimation = () => {
        setAnimationStep(1);
        // Tiempos ajustados para que la carta salga suavemente
        setTimeout(() => setAnimationStep(2), 1500); 
    };

    const handleConfirm = () => {
        window.open('https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3', '_blank');
    };

    return (
        <>
            <Head>
                <title>Invitación Manel & Carla</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@200;400&family=Great+Vibes&display=swap" rel="stylesheet" />
                <style>{`
                    body { margin: 0; padding: 0; background-color: #000; overflow: hidden; }
                `}</style>
            </Head>

            {/* --- 1. CAPA DE VIDEO --- */}
            {showVideo && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, left: 0, width: '100vw', height: '100vh', 
                    backgroundColor: 'black', 
                    zIndex: 9999, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    opacity: isFadingOut ? 0 : 1, 
                    transition: 'opacity 1.5s ease-in-out',
                    pointerEvents: isFadingOut ? 'none' : 'auto' // Permite click si falla el autoplay
                }}>
                    {/* TRUCO DEL AUTOPLAY:
                        Ponemos el Iframe DIRECTO en el HTML con todos los parámetros.
                        No esperamos a React ni a JS para crearlo.
                    */}
                    <iframe 
                        id="video-iframe"
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/7n-NFVzyGig?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&playsinline=1&enablejsapi=1&loop=0"
                        title="Video Intro"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            transform: 'scale(1.5)', // Zoom para evitar bordes negros
                            pointerEvents: 'none' // Evita que toquen pausa/play, solo ver
                        }}
                    ></iframe>
                </div>
            )}

            {/* --- 2. ESCENARIO (FONDO Y SOBRE) --- */}
            <div style={styles.container}>
                <div style={styles.wrapper}>

                    {/* --- CARTA (Está DETRÁS de la imagen al principio) --- */}
                    <div style={{
                        ...styles.card,
                        // Si animationStep >= 1, la carta sube (Y negativo)
                        transform: animationStep >= 1 ? 'translateY(-15%)' : 'translateY(20%)',
                        // Al principio está un poco oculta, luego sube
                        zIndex: 5, 
                        transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={styles.cardContent}>
                            <p style={styles.saveTheDate}>NOS CASAMOS</p>
                            <h1 style={styles.names}>Manel & Carla</h1>
                            <div style={styles.divider}></div>
                            <p style={styles.date}>21 · OCTUBRE · 2026</p>
                            <p style={styles.location}>MASIA MAS LLOMBART</p>
                            <p style={styles.quote}>"El amor es lo que hace que<br/>el viaje valga la pena."</p>
                            
                            {/* Botón solo visible al final */}
                            <button onClick={handleConfirm} style={{
                                ...styles.button, 
                                opacity: animationStep === 2 ? 1 : 0, 
                                pointerEvents: animationStep === 2 ? 'auto' : 'none', 
                                transition: 'opacity 0.5s ease 1s'
                            }}>
                                Confirmar Asistencia
                            </button>
                        </div>
                    </div>

                    {/* --- IMAGEN DEL SOBRE (TU FOTO) --- */}
                    {/* Debe llamarse 'sobre.jpg' en la carpeta public */}
                    <div 
                        onClick={animationStep === 0 ? startAnimation : undefined}
                        style={{
                            ...styles.envelopeImageContainer,
                            // Cuando se anima (Step 1), la imagen baja para dejar ver la carta
                            transform: animationStep >= 1 ? 'translateY(100vh)' : 'translateY(0)',
                            opacity: animationStep >= 1 ? 0 : 1,
                            transition: 'transform 1.5s ease-in-out, opacity 1s ease-in-out'
                        }}
                    >
                        <img 
                            src="/sobre.jpg" 
                            alt="Abrir Invitación" 
                            style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                        />
                    </div>

                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#222', // Fondo oscuro elegante
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    wrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '500px', // Ajustado al tamaño típico de un sobre en móvil
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // CARTA
    card: {
        position: 'absolute',
        width: '90%', 
        maxWidth: '400px',
        height: '70vh', // Alto de la carta
        backgroundColor: '#fff',
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
        boxShadow: '0 0 30px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        borderRadius: '4px',
    },
    cardContent: {
        width: '100%',
        height: '100%',
        border: '1px solid #c5b358', // Borde dorado
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        textAlign: 'center',
        padding: '20px 10px',
    },
    // TEXTOS
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: 'clamp(35px, 4vh, 50px)', color: '#333', margin: '10px 0', lineHeight: 1.1 },
    divider: { width: '40px', height: '1px', backgroundColor: '#c5b358', margin: '10px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: '600', color: '#333', letterSpacing: '1px', marginTop: '5px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontStyle: 'italic', color: '#666', lineHeight: '1.4', marginBottom: '5px', maxWidth: '80%' },
    button: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '15px 30px', fontSize: '12px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginTop: '20px' },

    // SOBRE (IMAGEN)
    envelopeImageContainer: {
        position: 'absolute',
        zIndex: 20, // Encima de la carta
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Animación de "palpitar" suave para indicar que es clickeable
        animation: 'pulse 3s infinite ease-in-out',
    }
};
