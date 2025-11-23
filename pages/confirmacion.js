import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- ESTADOS DEL VIDEO ---
    const playerRef = useRef(null);
    const timerRef = useRef(null);
    const [isStarted, setIsStarted] = useState(false);
    const [showVideo, setShowVideo] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // --- ESTADOS DE ANIMACIÓN DEL SOBRE ---
    // 0: Cerrado (SOLO se ve el sobre)
    // 1: Abriendo (Tapa sube, carta se hace visible dentro)
    // 2: Sacando carta
    // 3: Zoom final para leer
    const [animationStep, setAnimationStep] = useState(0);

    // ---------------------------------------------------------
    // 1. LÓGICA DE YOUTUBE
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
                        autoplay: 0, controls: 0, showinfo: 0, rel: 0, 
                        playsinline: 1, modestbranding: 1, loop: 0, fs: 0, mute: 1 
                    },
                    events: { 'onStateChange': onPlayerStateChange }
                });
            };
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            window.onYouTubeIframeAPIReady = null; 
        };
    }, []);

    const onPlayerStateChange = (event) => {
        if (event.data === 1) startEndTimer();
        if (event.data === 0 && !isFadingOut) finishVideo();
    };

    const startEndTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!playerRef.current || !playerRef.current.getCurrentTime) return;
            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration();
            // Cortar 2 segundos antes
            if (duration > 0 && (duration - currentTime) <= 2) {
                finishVideo();
                clearInterval(timerRef.current);
            }
        }, 500);
    };

    const handleStart = () => {
        if (playerRef.current && playerRef.current.playVideo) {
            setIsStarted(true);
            playerRef.current.mute(); 
            playerRef.current.playVideo();
        } else {
            finishVideo();
        }
    };

    const finishVideo = () => {
        if (isFadingOut) return;
        setIsFadingOut(true);
        if (playerRef.current && playerRef.current.pauseVideo) {
           try { playerRef.current.pauseVideo(); } catch(e){}
        }
        // Transición de 1.5s para que desaparezca el negro
        setTimeout(() => setShowVideo(false), 1500);
    };

    // ---------------------------------------------------------
    // 2. ANIMACIÓN DEL SOBRE
    // ---------------------------------------------------------
    const startEnvelopeAnimation = () => {
        // Paso 1: Levantar la tapa y hacer visible la carta (dentro)
        setAnimationStep(1); 
        // Paso 2: La carta empieza a deslizarse hacia arriba
        setTimeout(() => setAnimationStep(2), 600);  
        // Paso 3: Zoom para leer
        setTimeout(() => setAnimationStep(3), 1600); 
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
                `}</style>
            </Head>

            {/* --- PANTALLA INICIAL (BOTÓN) --- */}
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

            {/* --- VIDEO --- */}
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

            {/* --- ESCENARIO: SOBRE Y CARTA --- */}
            <div style={styles.container}>
                <div style={{
                    ...styles.wrapper,
                    // Al final (paso 3), hacemos zoom y bajamos el sobre para centrar la carta en pantalla
                    transform: animationStep === 3 ? 'translateY(20vh) scale(1.3)' : 'translateY(0) scale(1)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    <div style={{
                        ...styles.card,
                        // Paso 2: La carta sube saliendo del sobre
                        transform: animationStep >= 2 ? 'translateY(-85%)' : 'translateY(0)',
                        // SEGURIDAD: Opacidad 0 si está cerrado. Así garantizamos que NO se vea.
                        opacity: animationStep >= 1 ? 1 : 0, 
                        transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease'
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

                    {/* --- SOBRE --- */}
                    <div style={styles.envelopeBody}>
                        
                        {/* Interior Oscuro */}
                        <div style={styles.innerPocket}></div>

                        {/* TAPA INFERIOR (Bolsillo) */}
                        <div style={styles.bottomFlap}></div>

                        {/* LATERALES */}
                        <div style={{...styles.sideFlap, left: 0, clipPath: 'polygon(0 0, 0% 100%, 100% 50%)', background: 'linear-gradient(90deg, #e6dac3 0%, #d6c5a8 100%)' }}></div>
                        <div style={{...styles.sideFlap, right: 0, clipPath: 'polygon(100% 0, 0% 50%, 100% 100%)', background: 'linear-gradient(-90deg, #e6dac3 0%, #d6c5a8 100%)' }}></div>

                        {/* TAPA SUPERIOR (La que se abre) */}
                        <div style={{
                            ...styles.topFlap,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 50, 
                            transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.1s linear 0.4s'
                        }}>
                             <div style={styles.topFlapInner}></div>
                        </div>

                        {/* SELLO (Botón de Abrir) */}
                        <div onClick={animationStep === 0 ? startEnvelopeAnimation : undefined}
                             style={{
                                ...styles.waxSeal,
                                opacity: animationStep === 0 ? 1 : 0,
                                transform: animationStep === 0 ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(1.5)',
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

const styles = {
    container: {
        width: '100vw', height: '100vh', backgroundColor: '#1a1a1a',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
    },
    wrapper: {
        position: 'relative',
        width: '340px',  
        height: '230px', 
        perspective: '1000px',
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
    },
    
    // CARTA
    card: {
        position: 'absolute',
        // Centrada y ligeramente más pequeña que el sobre para caber
        top: '5%', left: '2.5%', 
        width: '95%', height: '90%', 
        zIndex: 2, // Detrás de las tapas (z=10, 50)
        backgroundColor: '#fffcf5',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        borderRadius: '4px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    },
    cardContent: {
        width: '100%', height: '100%',
        padding: '10px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly',
        border: '1px solid #d4af37', margin: '5px',
        width: 'calc(100% - 10px)', height: 'calc(100% - 10px)',
    },
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '9px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: '2rem', color: '#222', margin: '0', lineHeight: 1 },
    divider: { width: '30px', height: '1px', backgroundColor: '#d4af37', margin: '5px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '1rem', fontWeight: '600', color: '#333', letterSpacing: '1px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '8px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '12px', fontStyle: 'italic', color: '#666', textAlign: 'center', maxWidth: '90%' },
    button: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '8px 20px', fontSize: '9px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', marginTop: '5px' },

    // SOBRE
    envelopeBody: { width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' },
    innerPocket: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#2a2520', borderRadius: '4px' },

    // TAPA INFERIOR (SOLAPAMIENTO CORREGIDO: Sube hasta el 55% para tapar bien)
    bottomFlap: {
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', zIndex: 10,
        clipPath: 'polygon(0 100%, 50% 45%, 100% 100%)', // El pico llega al 45% desde arriba (55% de altura visual)
        background: 'linear-gradient(to top, #d1c0a5 0%, #e6dac3 100%)', borderRadius: '0 0 4px 4px',
    },
    // LATERALES
    sideFlap: { position: 'absolute', top: 0, width: '50%', height: '100%', zIndex: 11 },
    
    // TAPA SUPERIOR (SOLAPAMIENTO CORREGIDO: Baja hasta el 55% para solapar con la inferior)
    topFlap: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        transformOrigin: 'top', zIndex: 50,
        clipPath: 'polygon(0 0, 50% 55%, 100% 0)', // El pico baja hasta el 55%
        background: 'linear-gradient(to bottom, #f2eadd 0%, #e6dac3 100%)',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
    },
    topFlapInner: { width: '100%', height: '100%', backgroundColor: '#f5f0e6' },

    // SELLO
    waxSeal: {
        position: 'absolute', top: '50%', left: '50%', width: '70px', height: '70px', zIndex: 60,
        cursor: 'pointer', transition: 'all 0.5s ease', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
    },
    sealContent: {
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #d94646, #a61e1e, #6e0a0a)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: 'inset 0 0 0 3px rgba(100, 0, 0, 0.2), 0 0 0 2px #8a1c1c',
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive', color: '#4a0505', fontSize: '22px', fontWeight: 'bold',
        textShadow: '0 1px 1px rgba(255,255,255,0.2)', transform: 'rotate(-10deg)',
    }
};
