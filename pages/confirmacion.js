import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- ESTADOS ---
    const playerRef = useRef(null);
    const [showVideo, setShowVideo] = useState(true); 
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Estados del sobre: 0: Cerrado, 1: Abriendo, 2: Sacando carta, 3: Leyendo
    const [animationStep, setAnimationStep] = useState(0);

    // --- LÓGICA DE YOUTUBE ---
    useEffect(() => {
        // 1. Cargar API de YouTube si no existe
        if (typeof window !== 'undefined' && !window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            if(firstScriptTag) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            } else {
                document.head.appendChild(tag);
            }
        }

        // 2. Función para inicializar el reproductor
        const initPlayer = () => {
            if (playerRef.current) return; // Ya existe

            playerRef.current = new window.YT.Player('youtube-player-confirm', {
                videoId: '7n-NFVzyGig', 
                playerVars: { 
                    autoplay: 1,      // Intentar autoinicio
                    controls: 0,      // Sin controles
                    showinfo: 0, 
                    rel: 0, 
                    playsinline: 1,   // Móvil: no fullscreen automático
                    modestbranding: 1, 
                    loop: 0, 
                    fs: 0,
                    mute: 1,          // Muteado para facilitar autoplay
                    iv_load_policy: 3
                },
                events: { 
                    'onReady': (event) => {
                        // Intentar forzar reproducción
                        event.target.mute();
                        event.target.playVideo();
                    },
                    'onStateChange': (event) => {
                        // ESTADO 0 = Video Terminado
                        if (event.data === 0) {
                            handleVideoEnd();
                        }
                    }
                }
            });
        };

        // 3. Polling: Comprobar cada 100ms si la API está lista
        const intervalId = setInterval(() => {
            if (window.YT && window.YT.Player) {
                initPlayer();
                clearInterval(intervalId);
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    // --- FUNCIÓN DE TRANSICIÓN (IGUAL A INTRO.JS) ---
    const handleVideoEnd = () => {
        if (isFadingOut) return;
        
        // 1. Activamos la bandera de desvanecimiento (CSS opacity -> 0)
        setIsFadingOut(true);
        
        // 2. Esperamos 1.5s (tiempo de la transición CSS) para quitar el video del HTML
        setTimeout(() => {
            setShowVideo(false);
            // Limpieza de memoria
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        }, 1500); 
    };

    // --- LÓGICA DEL SOBRE ---
    const startAnimation = () => {
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
                    body { margin: 0; padding: 0; background-color: #2c2c2c; overflow: hidden; }
                `}</style>
            </Head>

            {/* --- CAPA DE VIDEO (TRANSICIÓN SUAVE) --- */}
            {showVideo && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, left: 0, width: '100vw', height: '100vh', 
                    backgroundColor: 'black', // Fondo negro para fundido
                    zIndex: 9999, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    // AQUÍ ESTÁ LA MAGIA DE LA TRANSICIÓN:
                    opacity: isFadingOut ? 0 : 1, 
                    transition: 'opacity 1.5s ease-in-out',
                    // Si está desvaneciéndose, quitamos interacción para poder tocar el sobre inmediatamente si se quiere
                    pointerEvents: isFadingOut ? 'none' : 'auto' 
                }}>
                    <div style={{ 
                        width: '100%', height: '100%', 
                        pointerEvents: 'none', // El usuario toca el contenedor, no el iframe directamente
                        transform: 'scale(1.4)', // Zoom para evitar bordes
                    }}>
                        <div id="youtube-player-confirm" style={{ width: '100%', height: '100%' }}></div>
                    </div>
                </div>
            )}

            {/* --- CONTENIDO DEL SOBRE (SIEMPRE RENDERIZADO DEBAJO) --- */}
            <div style={styles.container}>
                <div style={{
                    ...styles.wrapper,
                    transform: animationStep === 3 ? 'translateY(40vh)' : 'translateY(0)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* CARTA */}
                    <div style={{
                        ...styles.card,
                        // La carta sube desde atrás de la imagen del sobre
                        transform: animationStep >= 2 ? 'translateY(-60%)' : 'translateY(20%)',
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

                    {/* IMAGEN DEL SOBRE (SUSTITUYE AL SOBRE CSS) */}
                    <img 
                        src="image_0.png" 
                        alt="Sobre de Invitación"
                        onClick={animationStep === 0 ? startAnimation : undefined}
                        style={{
                            ...styles.envelopeImage,
                            opacity: animationStep >= 1 ? 0 : 1, // Desaparece al abrir
                            pointerEvents: animationStep === 0 ? 'auto' : 'none',
                            transform: animationStep >= 1 ? 'scale(1.1)' : 'scale(1)', // Pequeño efecto al desaparecer
                        }}
                    />
                </div>
            </div>
        </>
    );
}

// --- ESTILOS ---
const styles = {
    container: {
        width: '100vw', height: '100vh', backgroundColor: '#2c2c2c',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        overflow: 'hidden', position: 'relative',
    },
    wrapper: {
        position: 'relative', width: '100%', height: '100%', maxWidth: '600px',
        margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', 
        perspective: '1500px',
    },
    card: {
        position: 'absolute', bottom: '0', width: '90%', height: '85%',
        backgroundColor: '#fff',
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
        boxShadow: '0 -5px 25px rgba(0,0,0,0.2)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '20px', boxSizing: 'border-box', borderRadius: '4px 4px 0 0',
    },
    cardContent: {
        width: '100%', height: '100%', border: '1px solid #c5b358',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
        textAlign: 'center', padding: '20px 10px',
    },
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: 'clamp(40px, 5vh, 60px)', color: '#333', margin: '10px 0', lineHeight: 1.1 },
    divider: { width: '40px', height: '1px', backgroundColor: '#c5b358', margin: '10px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: '600', color: '#333', letterSpacing: '1px', marginTop: '5px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontStyle: 'italic', color: '#666', lineHeight: '1.4', marginBottom: '5px', maxWidth: '80%' },
    button: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '15px 30px', fontSize: '12px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginTop: '20px' },
    // ESTILO PARA LA NUEVA IMAGEN DEL SOBRE
    envelopeImage: {
        position: 'relative',
        width: '100%',
        height: 'auto',
        maxWidth: '600px',
        zIndex: 10,
        cursor: 'pointer',
        transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
        display: 'block', // Asegura que se comporte como bloque
        marginBottom: '-5px' // Ajuste fino para que se asiente en el fondo
    },
};
