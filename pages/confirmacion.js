import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- ESTADOS ---
    const playerRef = useRef(null);
    const timerRef = useRef(null);
    const [isStarted, setIsStarted] = useState(false);
    const [showVideo, setShowVideo] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    
    // 0: Cerrado
    // 1: Abriendo Solapa (Solo se mueve la tapa)
    // 2: Sacando Carta (La carta empieza a salir)
    // 3: Lectura (Todo baja para centrarse)
    const [animationStep, setAnimationStep] = useState(0);

    // =========================================================
    // 1. VIDEO INTRO
    // =========================================================
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
                    videoId: 'liDatwofpxI', 
                    playerVars: { autoplay: 0, controls: 0, showinfo: 0, rel: 0, playsinline: 1, modestbranding: 1, loop: 0, fs: 0, mute: 1 },
                    events: { 'onStateChange': onPlayerStateChange }
                });
            };
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); window.onYouTubeIframeAPIReady = null; };
    }, []);

    const onPlayerStateChange = (event) => {
        if (event.data === 1) startEndTimer();
        if (event.data === 0 && !isFadingOut) finishVideo();
    };

    const startEndTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!playerRef.current || !playerRef.current.getCurrentTime) return;
            if (playerRef.current.getDuration() > 0 && (playerRef.current.getDuration() - playerRef.current.getCurrentTime()) <= 2) {
                finishVideo();
                clearInterval(timerRef.current);
            }
        }, 500);
    };

    const handleStart = () => {
        if (playerRef.current && playerRef.current.playVideo) {
            setIsStarted(true); playerRef.current.unMute(); playerRef.current.playVideo();
        } else { finishVideo(); }
    };

    const finishVideo = () => {
        if (isFadingOut) return;
        setIsFadingOut(true);
        if (playerRef.current && playerRef.current.pauseVideo) try { playerRef.current.pauseVideo(); } catch(e){}
        setTimeout(() => setShowVideo(false), 1500);
    };

    // =========================================================
    // 2. ANIMACIÓN CORREGIDA (TIEMPOS)
    // =========================================================
    const startEnvelopeAnimation = (e) => {
        if(e) e.stopPropagation();
        
        // Paso 1: Abrir la tapa (La carta sigue oculta/quieta)
        setAnimationStep(1); 
        
        // Paso 2: ESPERAR 1 SEGUNDO (antes era 0.8s) para que la tapa suba del todo.
        // Ahora la carta empieza a salir DESPUÉS de que el sobre esté abierto.
        setTimeout(() => setAnimationStep(2), 1000);  
        
        // Paso 3: Zoom y bajar todo
        setTimeout(() => setAnimationStep(3), 2200); 
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
                    @keyframes pulse-btn {
                        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                        70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                    }
                    @keyframes pulse-seal {
                        0% { transform: translate(-50%, -50%) scale(1); }
                        50% { transform: translate(-50%, -50%) scale(1.05); }
                        100% { transform: translate(-50%, -50%) scale(1); }
                    }
                `}</style>
            </Head>

            {/* --- PANTALLA INICIO --- */}
            {!isStarted && (
                <div onClick={handleStart} style={{ position: 'fixed', zIndex: 3000, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', animation: 'pulse-btn 2s infinite' }}>
                        <span style={{ fontSize: '30px' }}>📩</span>
                    </div>
                    <h1 style={{ fontFamily: '"Great Vibes", cursive', fontSize: '2.5rem', marginBottom: '10px' }}>Manel & Carla</h1>
                    <p style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>Ver Invitación</p>
                </div>
            )}

            {/* --- VIDEO --- */}
            {showVideo && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isFadingOut ? 0 : 1, transition: 'opacity 1.5s ease-in-out', pointerEvents: 'none' }}>
                    <div style={{ width: '100%', height: '100%', transform: 'scale(1.4)' }}>
                        <div id="youtube-player-confirm" style={{ width: '100%', height: '100%' }}></div>
                    </div>
                </div>
            )}

            {/* --- ESCENARIO --- */}
            <div style={styles.container}>
                <div style={{
                    ...styles.wrapper,
                    // CORRECCIÓN 1: Bajamos mucho más el contenedor (30vh) para que la carta no toque el techo
                    transform: animationStep === 3 ? 'translateY(30vh) scale(1.1)' : 'translateY(5vh) scale(1)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    <div style={{
                        ...styles.card,
                        // CORRECCIÓN 2: Reducimos cuánto sube la carta (-80% en vez de -88%)
                        transform: animationStep >= 2 ? 'translateY(-80%)' : 'translateY(0)',
                        // CORRECCIÓN 3: Opacidad con delay. No aparece hasta que AnimationStep 2 está bien entrado
                        opacity: animationStep >= 2 ? 1 : 0, 
                        zIndex: animationStep >= 2 ? 20 : 1, 
                        // Añadimos delay a la opacidad para que no haga "pop" antes de tiempo
                        transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease 0.2s'
                    }}>
                        <div style={styles.cardContent}>
                            <p style={styles.topText}>¡NOS CASAMOS!</p>
                            <h1 style={styles.names}>Manel & Carla</h1>
                            <div style={styles.divider}></div>
                            
                            <div style={styles.bodyTextContainer}>
                                <p style={styles.bodyText}>
                                    Nos haría mucha ilusión que nos acompañaras en este día tan especial para nosotros.
                                </p>
                                <p style={styles.bodyText}>
                                    Queremos celebrar nuestro amor contigo y que seas parte de este momento único.
                                </p>
                            </div>

                            <p style={styles.footerText}>¡Te esperamos!</p>

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

                    {/* --- SOBRE --- */}
                    <div style={styles.envelope}>
                        <div style={{...styles.layer, ...styles.backFace}}></div>
                        <div style={{...styles.layer, ...styles.flapLeft}}></div>
                        <div style={{...styles.layer, ...styles.flapRight}}></div>
                        <div style={{...styles.layer, ...styles.flapBottom}}></div>
                        
                        {/* TAPA SUPERIOR */}
                        <div style={{
                            ...styles.layer, ...styles.flapTop,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 50, 
                            // Transición un poco más lenta para dar tiempo
                            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s linear 0.5s'
                        }}>
                            <div style={styles.flapTopInner}></div>
                        </div>
                    </div>

                    {/* --- BOTÓN SELLO --- */}
                    <div 
                        onClick={startEnvelopeAnimation}
                        style={{
                            ...styles.waxSeal,
                            opacity: animationStep === 0 ? 1 : 0,
                            display: animationStep > 0 ? 'none' : 'block',
                            animation: 'pulse-seal 2s infinite'
                        }}
                    >
                        <div style={styles.sealContent}>
                            <span style={styles.sealText}>Abrir</span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

// --- ESTILOS ---
const styles = {
    container: {
        width: '100vw', height: '100vh', 
        backgroundColor: '#111',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
        background: 'radial-gradient(circle at center, #2c2c2c 0%, #000000 100%)'
    },
    wrapper: {
        position: 'relative',
        width: '320px',  
        height: '460px', 
        perspective: '1200px', 
        filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))',
    },

    // --- CARTA ---
    card: {
        position: 'absolute',
        top: '5px', left: '10px', right: '10px', bottom: '10px',
        backgroundColor: '#fffcf5',
        borderRadius: '4px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
        pointerEvents: 'auto'
    },
    cardContent: {
        width: 'calc(100% - 20px)', height: 'calc(100% - 20px)',
        padding: '20px 10px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #d4af37', 
        textAlign: 'center'
    },
    
    // Textos
    topText: { 
        fontFamily: '"Montserrat", sans-serif', fontSize: '11px', letterSpacing: '3px', 
        color: '#888', textTransform: 'uppercase', marginBottom: '5px' 
    },
    names: { 
        fontFamily: '"Great Vibes", cursive', fontSize: '3rem', color: '#222', 
        margin: '10px 0', lineHeight: 1 
    },
    divider: { width: '40px', height: '1px', backgroundColor: '#d4af37', margin: '15px 0' },
    
    bodyTextContainer: { width: '90%', marginBottom: '15px' },
    bodyText: {
        fontFamily: '"Cormorant Garamond", serif', fontSize: '15px', 
        color: '#444', lineHeight: '1.4', margin: '8px 0'
    },
    footerText: {
        fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontWeight: 'bold',
        color: '#333', margin: '10px 0'
    },

    button: { 
        backgroundColor: '#222', 
        color: '#fff', 
        border: 'none', 
        padding: '12px 30px', 
        fontSize: '11px', 
        fontFamily: '"Montserrat", sans-serif', 
        textTransform: 'uppercase', 
        letterSpacing: '2px', 
        cursor: 'pointer', 
        marginTop: '15px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },

    // --- ENVELOPE ---
    envelope: { 
        width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
        pointerEvents: 'none' 
    },
    layer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },

    backFace: { backgroundColor: '#2a2520', borderRadius: '4px' },
    flapLeft: {
        clipPath: 'polygon(0 0, 0% 100%, 55% 55%)',
        background: 'linear-gradient(90deg, #dccab1 0%, #ede3d3 100%)', zIndex: 10,
    },
    flapRight: {
        clipPath: 'polygon(100% 0, 100% 100%, 45% 55%)',
        background: 'linear-gradient(-90deg, #dccab1 0%, #ede3d3 100%)', zIndex: 10,
    },
    flapBottom: {
        zIndex: 11,
        clipPath: 'polygon(0 100%, 50% 45%, 100% 100%)',
        background: 'linear-gradient(to top, #cbb596 0%, #f0e7d8 100%)',
        filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.1))',
    },
    flapTop: {
        zIndex: 50, transformOrigin: 'top',
        clipPath: 'polygon(0 0, 50% 50%, 100% 0)',
        background: 'linear-gradient(to bottom, #f7f1e6 0%, #e6dac3 100%)',
        filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.15))',
    },
    flapTopInner: { width: '100%', height: '100%', backgroundColor: '#fdfbf7' },

    // --- SELLO ---
    waxSeal: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90px', height: '90px', 
        zIndex: 9999, 
        cursor: 'pointer', 
        transition: 'all 0.5s ease',
        filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))',
        pointerEvents: 'auto', 
        display: 'block', 
    },
    sealContent: {
        width: '80px', height: '80px', borderRadius: '50%', margin: '5px', 
        background: 'radial-gradient(circle at 35% 35%, #e53935, #b71c1c, #7f0000)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.1), 0 0 0 2px #8e0000', 
        border: '1px solid rgba(255,255,255,0.2)'
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive', color: '#520b0b', fontSize: '22px', fontWeight: 'bold',
        textShadow: '0 1px 0 rgba(255,255,255,0.3)', transform: 'rotate(-10deg)',
    }
};
