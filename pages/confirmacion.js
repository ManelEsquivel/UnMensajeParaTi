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
    // 0: Cerrado (Sobre visible, carta oculta)
    // 1: Abriendo (Solapa sube)
    // 2: Carta saliendo
    // 3: Zoom final para leer
    const [animationStep, setAnimationStep] = useState(0);

    // ---------------------------------------------------------
    // 1. LÓGICA DE YOUTUBE (SILENCIO + CORTE 2s ANTES)
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
        setTimeout(() => setShowVideo(false), 1500);
    };

    // ---------------------------------------------------------
    // 2. ANIMACIÓN DEL SOBRE
    // ---------------------------------------------------------
    const startEnvelopeAnimation = () => {
        setAnimationStep(1); // 1. Abre tapa
        setTimeout(() => setAnimationStep(2), 600);  // 2. La carta empieza a salir
        setTimeout(() => setAnimationStep(3), 1600); // 3. Zoom final
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
                    
                    /* Animación del botón inicial */
                    @keyframes pulse-btn {
                        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                        70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                    }
                `}</style>
            </Head>

            {/* --- PANTALLA INICIO --- */}
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

            {/* --- ESCENARIO (SOBRE Y CARTA) --- */}
            <div style={styles.container}>
                <div style={{
                    ...styles.wrapper,
                    // En el paso 3 (lectura), bajamos el sobre y hacemos zoom para ver bien la carta
                    transform: animationStep === 3 ? 'translateY(20vh) scale(1.3)' : 'translateY(0) scale(1)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    {/* Z-Index: 2. Está DETRÁS de las solapas (z=10) inicialmente. 
                        IMPORTANTE: La carta mide 90% del sobre para caber dentro. */}
                    <div style={{
                        ...styles.card,
                        // Paso 2: La carta sube. Paso 3: Sube un poco más para centrarse.
                        transform: animationStep >= 2 ? 'translateY(-85%)' : 'translateY(0)',
                        // La opacidad ayuda a que no se vea ningún borde raro antes de tiempo
                        opacity: 1, 
                        transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <div style={styles.cardContent}>
                            <p style={styles.saveTheDate}>NOS CASAMOS</p>
                            <h1 style={styles.names}>Manel & Carla</h1>
                            <div style={styles.divider}></div>
                            <p style={styles.date}>21 · OCTUBRE · 2026</p>
                            <p style={styles.location}>MASIA MAS LLOMBART</p>
                            
                            <button onClick={handleConfirm} style={{
                                ...styles.button, 
                                // El botón solo es interactuable al final
                                opacity: animationStep === 3 ? 1 : 0, 
                                pointerEvents: animationStep === 3 ? 'auto' : 'none', 
                                transition: 'opacity 1s ease 1s'
                            }}>
                                Confirmar Asistencia
                            </button>
                        </div>
                    </div>

                    {/* --- CUERPO DEL SOBRE --- */}
                    <div style={styles.envelopeBody}>
                        
                        {/* Interior del bolsillo (Oscuro) */}
                        <div style={styles.innerPocket}></div>

                        {/* Solapa Inferior (Bolsillo) - Z=10 (Tapa la carta) */}
                        <div style={styles.bottomFlap}></div>

                        {/* Solapas Laterales - Z=11 */}
                        <div style={{...styles.sideFlap, left: 0, clipPath: 'polygon(0 0, 0% 100%, 100% 50%)', background: 'linear-gradient(90deg, #e6dac3 0%, #d6c5a8 100%)' }}></div>
                        <div style={{...styles.sideFlap, right: 0, clipPath: 'polygon(100% 0, 0% 50%, 100% 100%)', background: 'linear-gradient(-90deg, #e6dac3 0%, #d6c5a8 100%)' }}></div>

                        {/* Solapa Superior (Tapa móvil) - Z=20 */}
                        <div style={{
                            ...styles.topFlap,
                            // Se abre rotando 180 grados
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            // Baja z-index al abrirse para quedar detrás de la carta si fuera necesario, pero visualmente queda arriba
                            zIndex: animationStep >= 1 ? 1 : 20, 
                            transition: 'transform 0.8s ease-in-out, z-index 0.1s linear 0.4s'
                        }}>
                             <div style={styles.topFlapInner}></div>
                        </div>

                        {/* Sello - Z=50 */}
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

// --- ESTILOS ---
const styles = {
    container: {
        width: '100vw', height: '100vh', backgroundColor: '#1a1a1a',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
    },
    wrapper: {
        position: 'relative',
        width: '340px',  // Ancho típico de invitación apaisada
        height: '230px', // Alto del sobre
        perspective: '1000px',
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
    },

    // --- CARTA ---
    // CLAVE: Width 95% y Height 90% aseguran que quepa DENTRO del sobre inicialmente.
    card: {
        position: 'absolute',
        top: '5%', left: '2.5%', // Centrado dentro del sobre
        width: '95%', height: '90%', 
        zIndex: 2, // IMPORTANTE: Menor que las solapas (10)
        backgroundColor: '#fffcf5',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        borderRadius: '4px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    },
    cardContent: {
        width: '100%', height: '100%',
        padding: '15px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        border: '1px solid #d4af37', margin: '5px',
        width: 'calc(100% - 10px)', height: 'calc(100% - 10px)',
    },
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '9px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: '2rem', color: '#222', margin: '0', lineHeight: 1 },
    divider: { width: '30px', height: '1px', backgroundColor: '#d4af37', margin: '5px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '1rem', fontWeight: '600', color: '#333', letterSpacing: '1px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '8px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase' },
    button: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '8px 20px', fontSize: '9px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', marginTop: '5px' },

    // --- SOBRE ---
    envelopeBody: { width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' },
    innerPocket: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#2a2520', borderRadius: '4px' },

    // SOLAPAS
    bottomFlap: {
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', zIndex: 10, // Tapa la carta (z=2)
        clipPath: 'polygon(0 100%, 50% 60%, 100% 100%)', // Forma de bolsillo
        background: 'linear-gradient(to top, #d1c0a5 0%, #e6dac3 100%)', borderRadius: '0 0 4px 4px',
    },
    sideFlap: { position: 'absolute', top: 0, width: '50%', height: '100%', zIndex: 11 },
    topFlap: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        transformOrigin: 'top', zIndex: 20, // Tapa todo
        clipPath: 'polygon(0 0, 50% 50%, 100% 0)', // Triángulo superior
        background: 'linear-gradient(to bottom, #f2eadd 0%, #e6dac3 100%)',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
    },
    topFlapInner: { width: '100%', height: '100%', backgroundColor: '#f5f0e6' },

    // SELLO
    waxSeal: {
        position: 'absolute', top: '50%', left: '50%', width: '70px', height: '70px', zIndex: 50,
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
