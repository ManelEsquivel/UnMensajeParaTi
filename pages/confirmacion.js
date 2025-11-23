import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- ESTADOS DEL VIDEO ---
    const playerRef = useRef(null);
    const timerRef = useRef(null); // Para controlar el tiempo del video
    const [isStarted, setIsStarted] = useState(false);
    const [showVideo, setShowVideo] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // --- ESTADOS DE ANIMACIÓN DEL SOBRE ---
    // 0: Cerrado
    // 1: Abriendo (Solapa sube)
    // 2: Carta saliendo
    // 3: Zoom/Lectura
    const [animationStep, setAnimationStep] = useState(0);

    // ---------------------------------------------------------
    // 1. LÓGICA DE YOUTUBE (SILENCIO + CORTE 2 SEGUNDOS ANTES)
    // ---------------------------------------------------------
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
                        autoplay: 0, 
                        controls: 0, 
                        showinfo: 0, 
                        rel: 0, 
                        playsinline: 1, 
                        modestbranding: 1, 
                        loop: 0, 
                        fs: 0,
                        mute: 1 // IMPORTANTE: Silencio activado
                    },
                    events: { 
                        'onStateChange': onPlayerStateChange 
                    }
                });
            };
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            window.onYouTubeIframeAPIReady = null; 
        };
    }, []);

    const onPlayerStateChange = (event) => {
        // Si se está reproduciendo (state = 1), iniciamos el monitor de tiempo
        if (event.data === 1) {
            startEndTimer();
        }
        // Si termina naturalmente (state = 0)
        if (event.data === 0 && !isFadingOut) { 
            finishVideo();
        }
    };

    // Monitor para cortar el video 2 segundos antes
    const startEndTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(() => {
            if (!playerRef.current || !playerRef.current.getCurrentTime) return;

            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration();

            // Si estamos a menos de 2 segundos del final (y la duración es válida > 0)
            if (duration > 0 && (duration - currentTime) <= 2) {
                finishVideo();
                clearInterval(timerRef.current);
            }
        }, 500); // Chequeamos cada medio segundo
    };

    const handleStart = () => {
        if (playerRef.current && playerRef.current.playVideo) {
            setIsStarted(true);
            playerRef.current.mute(); // Aseguramos silencio
            playerRef.current.playVideo();
        } else {
            // Fallback
            finishVideo();
        }
    };

    const finishVideo = () => {
        if (isFadingOut) return;
        setIsFadingOut(true);
        // Pausamos el video visualmente
        if (playerRef.current && playerRef.current.pauseVideo) {
           try { playerRef.current.pauseVideo(); } catch(e){}
        }
        setTimeout(() => { 
            setShowVideo(false); 
        }, 1500);
    };

    // ---------------------------------------------------------
    // 2. LÓGICA DEL SOBRE (ANIMACIÓN CSS)
    // ---------------------------------------------------------
    const startEnvelopeAnimation = () => {
        setAnimationStep(1); // Abre tapa
        setTimeout(() => setAnimationStep(2), 800);  // Saca carta
        setTimeout(() => setAnimationStep(3), 2000); // Zoom final
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
                    html, body { margin: 0; padding: 0; background-color: #1a1a1a; overflow: hidden; height: 100%; }
                    
                    /* Patrón de ruido sutil para el papel */
                    .paper-texture {
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E");
                    }
                    
                    @keyframes pulse-btn {
                        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                        70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                    }
                `}</style>
            </Head>

            {/* --- CAPA BOTÓN INICIAL --- */}
            {!isStarted && (
                <div onClick={handleStart} style={{ 
                    position: 'fixed', zIndex: 2000, top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'black', display: 'flex', flexDirection: 'column', 
                    justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' 
                }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', border: '1px solid white',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px',
                        animation: 'pulse-btn 2s infinite'
                    }}>
                        <span style={{ fontSize: '30px' }}>📩</span>
                    </div>
                    <h1 style={{ fontFamily: '"Great Vibes", cursive', fontSize: '2.5rem', marginBottom: '10px' }}>Manel & Carla</h1>
                    <p style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>Ver Invitación</p>
                </div>
            )}

            {/* --- CAPA VIDEO --- */}
            {showVideo && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    backgroundColor: 'black', zIndex: 1000, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    opacity: isFadingOut ? 0 : 1, 
                    transition: 'opacity 1.5s ease-in-out',
                    pointerEvents: 'none' 
                }}>
                    <div style={{ width: '100%', height: '100%', transform: 'scale(1.4)' }}>
                        <div id="youtube-player-confirm" style={{ width: '100%', height: '100%' }}></div>
                    </div>
                </div>
            )}

            {/* --- CAPA SOBRE REALISTA --- */}
            <div style={styles.container}>
                <div style={{
                    ...styles.wrapper,
                    // Movimiento final para centrar la carta
                    transform: animationStep === 3 ? 'translateY(25vh) scale(1.1)' : 'translateY(5vh)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    <div style={{
                        ...styles.card,
                        transform: animationStep >= 2 ? 'translateY(-70%)' : 'translateY(0)',
                        zIndex: animationStep >= 2 ? 30 : 2, // Sube por encima del sobre al salir
                        transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
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

                    {/* --- SOBRE ESTRUCTURA MODERNA (CLIP-PATH) --- */}
                    <div style={styles.envelopeBody}>
                        
                        {/* Fondo Interior (Oscuro) */}
                        <div style={styles.innerPocket}></div>

                        {/* Tapa Trasera (Fondo del papel) */}
                        <div style={{...styles.paperLayer, backgroundColor: '#e0d0b6'}}></div>

                        {/* Solapa Inferior (El bolsillo) */}
                        <div style={{
                            ...styles.bottomFlap,
                            zIndex: 10
                        }}></div>

                        {/* Solapa Izquierda (Sombra + Papel) */}
                        <div style={{
                            ...styles.sideFlap,
                            left: 0,
                            clipPath: 'polygon(0 0, 0% 100%, 100% 50%)', // Triángulo lateral
                            background: 'linear-gradient(90deg, #e6dac3 0%, #d6c5a8 100%)',
                            zIndex: 11
                        }}></div>

                        {/* Solapa Derecha */}
                        <div style={{
                            ...styles.sideFlap,
                            right: 0,
                            clipPath: 'polygon(100% 0, 0% 50%, 100% 100%)',
                            background: 'linear-gradient(-90deg, #e6dac3 0%, #d6c5a8 100%)',
                            zIndex: 11
                        }}></div>

                        {/* Solapa Superior (La que se abre) */}
                        <div style={{
                            ...styles.topFlap,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 20, // Baja z-index al abrirse
                            transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.1s linear 0.4s'
                        }}>
                             {/* Interior de la solapa (se ve al abrir) */}
                            <div style={styles.topFlapInner}></div>
                        </div>

                        {/* Sello de Lacre (Realista con Sombras) */}
                        <div onClick={animationStep === 0 ? startEnvelopeAnimation : undefined}
                             style={{
                                ...styles.waxSeal,
                                opacity: animationStep === 0 ? 1 : 0,
                                transform: animationStep === 0 ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(1.2)',
                                pointerEvents: animationStep === 0 ? 'auto' : 'none',
                            }}>
                            <div style={styles.sealContent}>
                                <span style={styles.sealText}>Abrir</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

// --- ESTILOS MODERNOS ---
const styles = {
    container: {
        width: '100vw', height: '100vh', backgroundColor: '#1a1a1a',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
    },
    wrapper: {
        position: 'relative',
        width: '350px',  // Tamaño base del sobre (iPhone width aprox)
        height: '240px', // Proporción de sobre rectangular
        perspective: '1000px',
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))', // Sombra realista del sobre completo
    },

    // --- CARTA (DISEÑO) ---
    card: {
        position: 'absolute',
        top: '5px', left: '5px',
        width: 'calc(100% - 10px)', height: '140%', // Más alta que el sobre
        backgroundColor: '#fffcf5',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        borderRadius: '4px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    cardContent: {
        padding: '20px',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly',
        border: '1px solid #d4af37', // Dorado
        margin: '10px',
        width: 'calc(100% - 20px)', height: 'calc(100% - 20px)',
    },
    // Tipografías y textos
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '10px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: '2.8rem', color: '#222', margin: '10px 0', lineHeight: 1 },
    divider: { width: '30px', height: '1px', backgroundColor: '#d4af37', margin: '10px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontWeight: '600', color: '#333', letterSpacing: '1px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '9px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '14px', fontStyle: 'italic', color: '#666', textAlign: 'center' },
    button: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '12px 24px', fontSize: '10px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', marginTop: '15px' },

    // --- SOBRE ESTRUCTURA (MODERN CSS) ---
    envelopeBody: {
        width: '100%', height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
    },
    
    // Capa interior oscura (lo que se ve dentro cuando se abre)
    innerPocket: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: '#2a2520',
        borderRadius: '4px',
    },

    // Solapa INFERIOR (Bolsillo)
    bottomFlap: {
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%',
        // Forma trapezoidal
        clipPath: 'polygon(0 100%, 50% 55%, 100% 100%)',
        // Gradiente para dar volumen (más oscuro abajo)
        background: 'linear-gradient(to top, #d1c0a5 0%, #e6dac3 100%)',
        borderRadius: '0 0 4px 4px',
    },

    // Solapas LATERALES
    sideFlap: {
        position: 'absolute', top: 0, width: '50%', height: '100%',
        // clipPath definido inline
        // background definido inline
    },

    // Solapa SUPERIOR (Tapa)
    topFlap: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        transformOrigin: 'top',
        // Forma triangular apuntando abajo
        clipPath: 'polygon(0 0, 50% 50%, 100% 0)',
        // Gradiente de luz
        background: 'linear-gradient(to bottom, #f2eadd 0%, #e6dac3 100%)',
        // Sombra sutil bajo la tapa
        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
    },
    topFlapInner: {
        width: '100%', height: '100%',
        backgroundColor: '#f5f0e6', // Un poco más claro para el reverso
    },

    // --- SELLO DE LACRE (WAX SEAL) REALISTA ---
    waxSeal: {
        position: 'absolute',
        top: '50%', left: '50%',
        width: '70px', height: '70px',
        zIndex: 50,
        cursor: 'pointer',
        transition: 'all 0.5s ease',
        // Sombra del sello sobre el papel
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
    },
    sealContent: {
        width: '100%', height: '100%',
        borderRadius: '50%',
        // Gradiente rojo intenso brillante a oscuro
        background: 'radial-gradient(circle at 30% 30%, #d94646, #a61e1e, #6e0a0a)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        // Borde irregular simulado con boxShadow
        boxShadow: 'inset 0 0 0 3px rgba(100, 0, 0, 0.2), 0 0 0 2px #8a1c1c',
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive',
        color: '#4a0505',
        fontSize: '22px',
        fontWeight: 'bold',
        textShadow: '0 1px 1px rgba(255,255,255,0.2)', // Efecto de grabado
        transform: 'rotate(-10deg)',
    }
};
