import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- ESTADOS ---
    const playerRef = useRef(null);
    const timerRef = useRef(null);
    const [isStarted, setIsStarted] = useState(false);
    const [showVideo, setShowVideo] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    
    // 0: Cerrado | 1: Abriendo | 2: Sacando Carta | 3: Zoom Lectura
    const [animationStep, setAnimationStep] = useState(0);

    // =========================================================
    // 1. VIDEO INTRO (Lógica robusta igual que antes)
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
                    videoId: '7n-NFVzyGig', 
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
    // 2. ANIMACIÓN "PREMIUM"
    // =========================================================
    const startEnvelopeAnimation = () => {
        setAnimationStep(1); // Abre solapa
        setTimeout(() => setAnimationStep(2), 800);  // Carta sale
        setTimeout(() => setAnimationStep(3), 1800); // Zoom final
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
                    
                    /* Textura de papel para dar realismo */
                    .paper-texture {
                        background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
                    }
                    
                    @keyframes pulse-btn {
                        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                        70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
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
                    // Paso 3: Zoom In y bajar el sobre para que la carta llene la pantalla
                    transform: animationStep === 3 ? 'translateY(35vh) scale(1.3)' : 'translateY(0) scale(1)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA (Elegante y Limpia) --- */}
                    <div style={{
                        ...styles.card,
                        transform: animationStep >= 2 ? 'translateY(-75%)' : 'translateY(0)',
                        opacity: animationStep >= 1 ? 1 : 0, // Oculta hasta abrir
                        zIndex: animationStep >= 2 ? 20 : 1, // Sube de nivel al salir
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

                    {/* --- SOBRE PREMIUM (Con Sombras y Profundidad) --- */}
                    <div style={styles.envelope}>
                        
                        {/* 1. Fondo del Sobre (Respaldo) */}
                        <div style={{...styles.layer, ...styles.backFace}}></div>

                        {/* 2. Solapas Laterales (Con gradientes para simular curvatura) */}
                        <div style={{...styles.layer, ...styles.flapLeft}}></div>
                        <div style={{...styles.layer, ...styles.flapRight}}></div>

                        {/* 3. Solapa Inferior (Bolsillo principal con sombra superior) */}
                        <div style={{...styles.layer, ...styles.flapBottom}}></div>

                        {/* 4. Solapa Superior (Tapa con sombra realista) */}
                        <div style={{
                            ...styles.layer, ...styles.flapTop,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 50, 
                            transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s linear 0.4s'
                        }}>
                            {/* Interior de la tapa (se ve al abrir) */}
                            <div style={styles.flapTopInner}></div>
                        </div>

                        {/* 5. Sello Centrado (Con relieve) */}
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

// --- ESTILOS MEJORADOS ---
const styles = {
    container: {
        width: '100vw', height: '100vh', backgroundColor: '#111',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
        background: 'radial-gradient(circle at center, #2c2c2c 0%, #000000 100%)' // Vignette sutil
    },
    wrapper: {
        position: 'relative',
        width: '320px',  // Ancho realista
        height: '220px', // Alto realista
        perspective: '1200px', // Profundidad 3D mejorada
        filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))', // Sombra flotante del sobre entero
    },

    // --- CARTA ---
    card: {
        position: 'absolute',
        top: '5px', left: '10px', right: '10px',
        height: '95%', // Casi todo el alto para salir bien
        backgroundColor: '#fffcf5',
        borderRadius: '4px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        // Textura papel
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
    },
    cardContent: {
        width: '100%', height: '100%',
        padding: '15px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly',
        border: '1px solid #d4af37', margin: '5px',
        width: 'calc(100% - 10px)', height: 'calc(100% - 10px)',
    },
    // Tipografías
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '9px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: '2.2rem', color: '#222', margin: '0', lineHeight: 1 },
    divider: { width: '30px', height: '1px', backgroundColor: '#d4af37', margin: '5px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '1rem', fontWeight: '600', color: '#333', letterSpacing: '1px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '8px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '12px', fontStyle: 'italic', color: '#666', textAlign: 'center' },
    button: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '8px 20px', fontSize: '9px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', marginTop: '5px' },

    // --- ESTRUCTURA DEL SOBRE ---
    envelope: { width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' },
    
    // Clase base para las capas
    layer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },

    // 1. RESPALDO
    backFace: { backgroundColor: '#2a2520', borderRadius: '4px' }, // Interior oscuro elegante

    // 2. LATERALES (Con gradiente para dar volumen curvo)
    flapLeft: {
        clipPath: 'polygon(0 0, 0% 100%, 55% 50%)', // Triángulo lateral
        background: 'linear-gradient(90deg, #dccab1 0%, #ede3d3 100%)', // Sombra al borde
        zIndex: 10,
    },
    flapRight: {
        clipPath: 'polygon(100% 0, 100% 100%, 45% 50%)',
        background: 'linear-gradient(-90deg, #dccab1 0%, #ede3d3 100%)', // Sombra al borde
        zIndex: 10,
    },

    // 3. ABAJO (Bolsillo principal)
    flapBottom: {
        zIndex: 11,
        clipPath: 'polygon(0 100%, 50% 55%, 100% 100%)', // Triángulo sube hasta el 55%
        // Gradiente vertical: Más oscuro abajo (sombra) -> Claro arriba
        background: 'linear-gradient(to top, #cbb596 0%, #f0e7d8 100%)',
        // Sombra ficticia arriba para separar del fondo
        filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.1))',
    },

    // 4. ARRIBA (TAPA)
    flapTop: {
        zIndex: 20, transformOrigin: 'top',
        clipPath: 'polygon(0 0, 50% 55%, 100% 0)', // El pico baja hasta el 55% para solapar perfecto
        background: 'linear-gradient(to bottom, #f7f1e6 0%, #e6dac3 100%)', // Papel más claro arriba
        filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.15))', // Sombra realista sobre el resto
    },
    flapTopInner: { width: '100%', height: '100%', backgroundColor: '#fdfbf7' }, // Reverso de la tapa (papel limpio)

    // --- SELLO ---
    waxSeal: {
        position: 'absolute', top: '55%', left: '50%', // Justo en el pico (55%)
        width: '70px', height: '70px', zIndex: 60,
        cursor: 'pointer', transition: 'all 0.5s ease',
        filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))', // Sombra del sello
    },
    sealContent: {
        width: '100%', height: '100%', borderRadius: '50%',
        // Gradiente complejo para simular cera brillante
        background: 'radial-gradient(circle at 35% 35%, #e53935, #b71c1c, #7f0000)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        // Borde irregular simulado
        boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.1), 0 0 0 2px #8e0000', 
        border: '1px solid rgba(255,255,255,0.2)'
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive', color: '#520b0b', fontSize: '22px', fontWeight: 'bold',
        textShadow: '0 1px 0 rgba(255,255,255,0.3)', // Efecto grabado
        transform: 'rotate(-10deg)',
    }
};
