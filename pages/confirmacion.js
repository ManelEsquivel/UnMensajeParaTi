import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- ESTADOS INTRO (VIDEO) ---
    const playerRef = useRef(null);
    const [isStarted, setIsStarted] = useState(false);       // Controla la pantalla de "Click para empezar"
    const [showVideo, setShowVideo] = useState(true);        // Controla la visibilidad del contenedor de video
    const [isFadingOut, setIsFadingOut] = useState(false);   // Transición suave al acabar video

    // --- ESTADOS CONFIRMACION (SOBRE) ---
    // 0: Cerrado, 1: Abriendo Solapa, 2: Sacando Carta, 3: Lectura (Zoom)
    const [animationStep, setAnimationStep] = useState(0);

    // --- 1. LÓGICA DE YOUTUBE (Igual que Intro.js) ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            window.onYouTubeIframeAPIReady = () => {
                playerRef.current = new window.YT.Player('youtube-player-confirm', {
                    videoId: '7n-NFVzyGig', 
                    playerVars: { 
                        autoplay: 0, // Esperamos al click manual del usuario
                        controls: 0, 
                        showinfo: 0, 
                        rel: 0, 
                        playsinline: 1, 
                        modestbranding: 1, 
                        loop: 0, 
                        fs: 0 
                    },
                    events: { 'onStateChange': onPlayerStateChange }
                });
            };
        }
        return () => { window.onYouTubeIframeAPIReady = null; };
    }, []);

    const onPlayerStateChange = (event) => {
        // 0 = Video terminado
        if (event.data === 0 && !isFadingOut) { 
            handleVideoEnd();
        }
    };

    // --- 2. MANEJADORES DE EVENTOS ---

    // El usuario hace click en el botón "Ver Invitación"
    const handleStart = () => {
        if (playerRef.current && playerRef.current.playVideo) {
            setIsStarted(true);             // Quitamos el botón
            playerRef.current.unMute();     // Activamos sonido
            playerRef.current.setVolume(100);
            playerRef.current.playVideo();  // Play
        } else {
            // Fallback por si el video no cargó
            setIsStarted(true);
            setShowVideo(false);
        }
    };

    // El video termina
    const handleVideoEnd = () => {
        setIsFadingOut(true);
        setTimeout(() => { 
            setShowVideo(false); // Quitamos el video y revelamos el sobre
        }, 1500); 
    };

    // El usuario abre el sobre (Animación CSS)
    const startEnvelopeAnimation = () => {
        setAnimationStep(1);
        setTimeout(() => setAnimationStep(2), 800);
        setTimeout(() => setAnimationStep(3), 1800); 
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
                    html, body { margin: 0; padding: 0; background-color: #2c2c2c; overflow: hidden; height: 100%; }
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.05); opacity: 1; }
                        100% { transform: scale(1); opacity: 0.8; }
                    }
                `}</style>
            </Head>

            {/* --- CAPA 1: PANTALLA DE INICIO (BOTÓN) --- */}
            {!isStarted && (
                <div onClick={handleStart} style={{ 
                    position: 'fixed', zIndex: 2000, top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'black', display: 'flex', flexDirection: 'column', 
                    justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' 
                }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px', animation: 'pulse 2s infinite' }}>📩</div>
                    <h1 style={{ fontFamily: '"Great Vibes", cursive', fontSize: '2.5rem', marginBottom: '20px' }}>Manel & Carla</h1>
                    <div style={{ 
                        padding: '15px 40px', border: '1px solid white', borderRadius: '2px', 
                        textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.9rem', fontFamily: '"Montserrat", sans-serif' 
                    }}>
                        Ver Invitación
                    </div>
                    <p style={{marginTop: '20px', opacity: 0.6, fontSize: '10px'}}>Haga clic para comenzar</p>
                </div>
            )}

            {/* --- CAPA 2: VIDEO (Oculta el sobre hasta terminar) --- */}
            {showVideo && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    backgroundColor: 'black', zIndex: 1000, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    opacity: isFadingOut ? 0 : 1, 
                    transition: 'opacity 1.5s ease-in-out',
                    pointerEvents: 'none' 
                }}>
                     {/* Video escalado para ocupar todo */}
                    <div style={{ width: '100%', height: '100%', transform: 'scale(1.4)' }}>
                        <div id="youtube-player-confirm" style={{ width: '100%', height: '100%' }}></div>
                    </div>
                </div>
            )}


            {/* --- CAPA 3: EL SOBRE Y LA CARTA (Siempre debajo, esperando) --- */}
            <div style={styles.container}>
                <div style={{
                    ...styles.wrapper,
                    // ZOOM FINAL: Movemos todo abajo para centrar la carta
                    transform: animationStep === 3 ? 'translateY(40vh)' : 'translateY(0)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA (HTML puro para animaciones web) --- */}
                    <div style={{
                        ...styles.card,
                        transform: animationStep >= 2 ? 'translateY(-60%)' : 'translateY(0)',
                        opacity: animationStep >= 2 ? 1 : 0,
                        zIndex: animationStep >= 2 ? 20 : 1,
                        transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease'
                    }}>
                        <div style={styles.cardContent}>
                            <p style={styles.saveTheDate}>NOS CASAMOS</p>
                            <h1 style={styles.names}>Manel & Carla</h1>
                            <div style={styles.divider}></div>
                            <p style={styles.date}>21 · OCTUBRE · 2026</p>
                            <p style={styles.location}>MASIA MAS LLOMBART</p>
                            <p style={styles.quote}>"El amor es lo que hace que<br/>el viaje valga la pena."</p>
                            <button onClick={handleConfirm} style={{
                                ...styles.button, 
                                opacity: animationStep === 3 ? 1 : 0, 
                                pointerEvents: animationStep === 3 ? 'auto' : 'none', 
                                transition: 'opacity 1s ease 1s'
                            }}>
                                Confirmar Asistencia
                            </button>
                        </div>
                    </div>

                    {/* --- SOBRE CSS (Estilo Beige/Papel Antiguo) --- */}
                    <div style={styles.envelope}>
                        
                        {/* Interior oscuro */}
                        <div style={styles.envelopeInner}></div>
                        
                        {/* Solapas Laterales */}
                        <div style={styles.flapLeft}></div>
                        <div style={styles.flapRight}></div>
                        
                        {/* Solapa Inferior */}
                        <div style={styles.flapBottom}></div>

                        {/* Solapa Superior (La que se abre) */}
                        <div style={{
                            ...styles.flapTop,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 50, 
                            transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s linear 0.4s'
                        }}></div>

                        {/* Sello de Cera */}
                        <div onClick={animationStep === 0 ? startEnvelopeAnimation : undefined}
                             style={{
                                ...styles.waxSeal,
                                opacity: animationStep === 0 ? 1 : 0,
                                transform: animationStep === 0 ? 'scale(1)' : 'scale(1.5)',
                                pointerEvents: animationStep === 0 ? 'auto' : 'none',
                                cursor: 'pointer'
                            }}>
                            <div style={styles.sealInner}>
                                <span style={styles.sealText}>Abrir</span>
                            </div>
                        </div>

                    </div>
                    
                </div>
            </div>
        </>
    );
}

// --- ESTILOS CSS EN JS ---
const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#2c2c2c',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'hidden',
        position: 'relative',
    },
    wrapper: {
        position: 'relative',
        width: '100%',
        height: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end', 
        perspective: '1500px',
    },
    
    // --- CARTA ---
    card: {
        position: 'absolute',
        bottom: '0',
        width: '90%', 
        height: '85%', 
        backgroundColor: '#fff',
        // Textura sutil para el papel
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
        boxShadow: '0 -5px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        borderRadius: '4px 4px 0 0',
    },
    cardContent: {
        width: '100%',
        height: '100%',
        border: '1px solid #c5b358',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around', 
        textAlign: 'center',
        padding: '20px 10px',
    },
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: 'clamp(40px, 5vh, 60px)', color: '#333', margin: '10px 0', lineHeight: 1.1 },
    divider: { width: '40px', height: '1px', backgroundColor: '#c5b358', margin: '10px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: '600', color: '#333', letterSpacing: '1px', marginTop: '5px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontStyle: 'italic', color: '#666', lineHeight: '1.4', marginBottom: '5px', maxWidth: '80%' },
    button: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '15px 30px', fontSize: '12px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginTop: '20px' },

    // --- SOBRE CSS (COLORES AJUSTADOS A BEIGE/PAPEL VIEJO) ---
    envelope: {
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
    },
    envelopeInner: {
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: '#3a3a3a', // Fondo oscuro interior
    },
    
    // LATERALES (Color ajustado a Beige #e6dac3 similar a tu imagen)
    flapLeft: {
        position: 'absolute',
        top: 0, left: 0, width: 0, height: 0,
        borderTop: '50vh solid transparent',
        borderBottom: '50vh solid transparent',
        borderLeft: '55vw solid #e6dac3', // COLOR CAMBIADO (Antes blanco/gris)
        zIndex: 11,
    },
    flapRight: {
        position: 'absolute',
        top: 0, right: 0, width: 0, height: 0,
        borderTop: '50vh solid transparent',
        borderBottom: '50vh solid transparent',
        borderRight: '55vw solid #e6dac3', // COLOR CAMBIADO
        zIndex: 11,
    },
    
    // ABAJO (Un poco más oscuro para dar profundidad)
    flapBottom: {
        position: 'absolute',
        bottom: 0, left: 0, width: 0, height: 0,
        borderLeft: '50vw solid transparent',
        borderRight: '50vw solid transparent',
        borderBottom: '55vh solid #dccab1', // COLOR CAMBIADO
        zIndex: 12,
    },
    
    // ARRIBA (La tapa)
    flapTop: {
        position: 'absolute',
        top: 0, left: 0, width: 0, height: 0,
        borderLeft: '50vw solid transparent',
        borderRight: '50vw solid transparent',
        borderTop: '55vh solid #efe6d5', // COLOR CAMBIADO (Más claro)
        transformOrigin: 'top',
        zIndex: 50,
        filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.15))'
    },

    // --- SELLO ---
    waxSeal: {
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        marginTop: '25px',
        marginLeft: '-40px', 
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 30% 30%, #d32f2f, #b71c1c, #8e0000)', // Sello ROJO como en tu imagen
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 60,
        cursor: 'pointer',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        pointerEvents: 'auto',
    },
    sealInner: {
        width: '60px', height: '60px',
        borderRadius: '50%',
        border: '2px solid rgba(100, 0, 0, 0.3)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive',
        fontSize: '24px',
        color: '#5c0000',
        fontWeight: '600',
        transform: 'rotate(-5deg)',
    }
};
