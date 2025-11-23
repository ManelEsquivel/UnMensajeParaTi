import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // --- 1. ESTADOS DEL VIDEO (INTRO) ---
    const playerRef = useRef(null);
    const timerRef = useRef(null);
    const [isStarted, setIsStarted] = useState(false);     // Pantalla "Ver Invitación"
    const [showVideo, setShowVideo] = useState(true);      // Contenedor Video
    const [isFadingOut, setIsFadingOut] = useState(false); // Transición negro -> sobre

    // --- 2. ESTADOS DEL SOBRE (CONFIRMACIÓN) ---
    // 0: Cerrado
    // 1: Abriendo Solapa
    // 2: Sacando Carta
    // 3: Lectura (Zoom/Desplazamiento final)
    const [animationStep, setAnimationStep] = useState(0);

    // =========================================================
    // LÓGICA DE VIDEO (IGUAL QUE INTRO.JS + CORTE 2 SEGUNDOS)
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

    // Monitor para cortar 2 segundos antes
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
            playerRef.current.unMute(); // Activamos sonido
            playerRef.current.setVolume(100);
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
        // 1.5s de transición suave a negro transparente
        setTimeout(() => setShowVideo(false), 1500);
    };

    // =========================================================
    // LÓGICA DE ANIMACIÓN (DEL FICHERO ADJUNTO)
    // =========================================================
    const startAnimation = () => {
        setAnimationStep(1); // Abre tapa
        setTimeout(() => setAnimationStep(2), 800);  // Saca carta
        setTimeout(() => setAnimationStep(3), 1800); // Movimiento final (Zoom/Desplazamiento)
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

            {/* --- 1. BOTÓN DE INICIO (PANTALLA NEGRA) --- */}
            {!isStarted && (
                <div onClick={handleStart} style={{ 
                    position: 'fixed', zIndex: 3000, top: 0, left: 0, width: '100%', height: '100%', 
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

            {/* --- 2. VIDEO --- */}
            {showVideo && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    backgroundColor: 'black', zIndex: 2000, 
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

            {/* --- 3. SOBRE Y CARTA (LÓGICA DEL ADJUNTO + ESTILO BEIGE) --- */}
            <div style={styles.container}>
                
                <div style={{
                    ...styles.wrapper,
                    // LA MAGIA DEL ADJUNTO: Movemos el contenedor 40vh abajo al final.
                    // Como la carta subió, esto hace que la carta quede centrada en pantalla.
                    transform: animationStep === 3 ? 'translateY(40vh)' : 'translateY(0)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    <div style={{
                        ...styles.card,
                        // La carta sale hacia arriba (-60%)
                        transform: animationStep >= 2 ? 'translateY(-60%)' : 'translateY(0)',
                        // Opacidad 0 si está cerrado para evitar que se vea por rendijas
                        opacity: animationStep >= 1 ? 1 : 0,
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

                    {/* --- SOBRE (ESTILO FULL SCREEN DEL ADJUNTO) --- */}
                    <div style={styles.envelope}>
                        
                        {/* Interior */}
                        <div style={styles.envelopeInner}></div>
                        
                        {/* Laterales (Beige) */}
                        <div style={styles.flapLeft}></div>
                        <div style={styles.flapRight}></div>
                        
                        {/* Abajo (Beige Oscuro) */}
                        <div style={styles.flapBottom}></div>

                        {/* Tapa Superior (Beige Claro) - Se abre rotando */}
                        <div style={{
                            ...styles.flapTop,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 50, 
                            transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s linear 0.4s'
                        }}></div>

                        {/* Sello */}
                        <div onClick={animationStep === 0 ? startAnimation : undefined}
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
        width: '100vw', height: '100vh',
        backgroundColor: '#1a1a1a', // Fondo oscuro general
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        overflow: 'hidden', position: 'relative',
    },
    wrapper: {
        position: 'relative', width: '100%', height: '100%',
        maxWidth: '600px', margin: '0 auto',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', 
        perspective: '1500px',
    },
    
    // --- CARTA (Vertical y Elegante) ---
    card: {
        position: 'absolute', bottom: '0', width: '90%', height: '85%',
        backgroundColor: '#fffcf5', // Crema suave
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
        boxShadow: '0 -5px 25px rgba(0,0,0,0.2)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '20px', boxSizing: 'border-box', borderRadius: '4px 4px 0 0',
    },
    cardContent: {
        width: '100%', height: '100%',
        border: '1px solid #d4af37', // Borde Dorado
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
        textAlign: 'center', padding: '20px 10px',
    },
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: 'clamp(40px, 5vh, 60px)', color: '#222', margin: '10px 0', lineHeight: 1.1 },
    divider: { width: '40px', height: '1px', backgroundColor: '#d4af37', margin: '10px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: '600', color: '#333', letterSpacing: '1px', marginTop: '5px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontStyle: 'italic', color: '#666', lineHeight: '1.4', marginBottom: '5px', maxWidth: '80%' },
    button: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '15px 30px', fontSize: '12px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginTop: '20px' },

    // --- SOBRE (GEOMETRÍA DEL ADJUNTO + COLORES BEIGE) ---
    envelope: { position: 'relative', width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' },
    envelopeInner: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#2a2520' }, // Interior oscuro
    
    // Usamos CLIP-PATH para permitir degradados en la geometría Full Screen
    flapLeft: {
        position: 'absolute', top: 0, left: 0, width: '55%', height: '100%', // Ancho > 50% para solapar
        clipPath: 'polygon(0 0, 100% 50%, 0 100%)', // Triángulo izquierdo
        background: 'linear-gradient(90deg, #e6dac3 0%, #d6c5a8 100%)', zIndex: 11,
    },
    flapRight: {
        position: 'absolute', top: 0, right: 0, width: '55%', height: '100%',
        clipPath: 'polygon(100% 0, 0 50%, 100% 100%)', // Triángulo derecho
        background: 'linear-gradient(-90deg, #e6dac3 0%, #d6c5a8 100%)', zIndex: 11,
    },
    flapBottom: {
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '55%', // Alto > 50%
        clipPath: 'polygon(0 100%, 50% 0, 100% 100%)', // Triángulo inferior
        background: 'linear-gradient(to top, #d1c0a5 0%, #e6dac3 100%)', zIndex: 12,
    },
    flapTop: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '55%',
        clipPath: 'polygon(0 0, 50% 100%, 100% 0)', // Triángulo superior apuntando abajo
        background: 'linear-gradient(to bottom, #f2eadd 0%, #e6dac3 100%)', // Beige más claro
        transformOrigin: 'top', zIndex: 50,
        filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.15))'
    },

    // --- SELLO ROJO/GRANATE ---
    waxSeal: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        marginTop: '25px', marginLeft: '-40px', 
        width: '80px', height: '80px', zIndex: 60,
        cursor: 'pointer', transition: 'all 0.5s ease',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
    },
    sealContent: {
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #d94646, #a61e1e, #6e0a0a)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: 'inset 0 0 0 3px rgba(100, 0, 0, 0.2), 0 0 0 2px #8a1c1c',
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive', color: '#4a0505', fontSize: '24px', fontWeight: 'bold',
        textShadow: '0 1px 1px rgba(255,255,255,0.2)', transform: 'rotate(-10deg)',
    }
};
