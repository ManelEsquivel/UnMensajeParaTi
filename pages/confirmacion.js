import React, { useState } from 'react';
import Head from 'next/head';

export default function InvitationGatefold() {
    // 0: Cerrado (Puertas cerradas)
    // 1: Abriendo (Puertas giran hacia los lados)
    // 2: Zoom/Enfoque en la carta
    const [animationStep, setAnimationStep] = useState(0);

    const startAnimation = () => {
        setAnimationStep(1);
        setTimeout(() => setAnimationStep(2), 1000); 
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
            </Head>

            <div style={styles.container}>
                
                {/* WRAPPER con perspectiva para el efecto 3D de las puertas */}
                <div style={styles.wrapper}>

                    {/* --- CARTA (FONDO) --- */}
                    {/* Está quieta detrás de las puertas, solo hacemos un ligero zoom al final */}
                    <div style={{
                        ...styles.card,
                        transform: animationStep === 2 ? 'scale(1)' : 'scale(0.95)',
                        opacity: animationStep >= 1 ? 1 : 0, // Se revela al abrir
                        transition: 'transform 1s ease 0.5s, opacity 0.5s ease'
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
                                opacity: animationStep === 2 ? 1 : 0,
                                pointerEvents: animationStep === 2 ? 'auto' : 'none', 
                                transition: 'opacity 1s ease 1s'
                            }}>
                                Confirmar Asistencia
                            </button>
                        </div>
                    </div>

                    {/* --- PUERTA IZQUIERDA --- */}
                    <div style={{
                        ...styles.door,
                        left: 0,
                        transformOrigin: 'left center', // Gira sobre el borde izquierdo (bisagra)
                        transform: animationStep >= 1 ? 'rotateY(-160deg)' : 'rotateY(0deg)',
                        borderRight: '1px solid #e0e0e0', // Línea sutil de unión
                    }}></div>

                    {/* --- PUERTA DERECHA --- */}
                    <div style={{
                        ...styles.door,
                        right: 0,
                        transformOrigin: 'right center', // Gira sobre el borde derecho
                        transform: animationStep >= 1 ? 'rotateY(160deg)' : 'rotateY(0deg)',
                        borderLeft: '1px solid #e0e0e0',
                    }}></div>

                    {/* --- SELLO (Justo en el centro, uniendo las puertas) --- */}
                    <div onClick={animationStep === 0 ? startAnimation : undefined}
                         style={{
                            ...styles.waxSeal,
                            opacity: animationStep === 0 ? 1 : 0,
                            transform: animationStep === 0 ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(1.5)',
                            pointerEvents: animationStep === 0 ? 'auto' : 'none',
                        }}>
                        <div style={styles.sealInner}>
                            <span style={styles.sealText}>Abrir</span>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                body { margin: 0; padding: 0; background-color: #222; overflow: hidden; }
            `}</style>
        </>
    );
}

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#2c2c2c', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    wrapper: {
        position: 'relative',
        width: '100%',
        height: '100%',
        perspective: '1500px', // Crucial para el efecto 3D de abrir puertas
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // --- CARTA ---
    card: {
        position: 'absolute',
        width: '90%', // Casi todo el ancho
        height: '90%', // Casi todo el alto
        backgroundColor: '#fff',
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
        boxShadow: '0 0 30px rgba(0,0,0,0.5)', // Sombra para dar profundidad tras las puertas
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        zIndex: 10, 
    },
    cardContent: {
        width: '100%',
        height: '100%',
        border: '1px solid #c5b358',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        textAlign: 'center',
        padding: '10px',
    },
    saveTheDate: { fontFamily: '"Montserrat", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#888', textTransform: 'uppercase', margin: 0 },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: 'clamp(45px, 6vh, 65px)', color: '#333', margin: '10px 0', lineHeight: 1.1 },
    divider: { width: '40px', height: '1px', backgroundColor: '#c5b358', margin: '10px 0' },
    date: { fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: '600', color: '#333', letterSpacing: '1px', marginTop: '5px' },
    location: { fontFamily: '"Montserrat", sans-serif', fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' },
    quote: { fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontStyle: 'italic', color: '#666', lineHeight: '1.4', marginBottom: '5px', maxWidth: '80%' },
    button: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '15px 30px', fontSize: '12px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },

    // --- PUERTAS DEL SOBRE (Gatefold) ---
    door: {
        position: 'absolute',
        top: 0,
        width: '50%', // Cada puerta ocupa la mitad exacta
        height: '100%',
        backgroundColor: '#f4f4f4', // Color del sobre
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`, // Textura papel
        zIndex: 50,
        transition: 'transform 1.8s cubic-bezier(0.25, 1, 0.5, 1)', // Animación suave
        backfaceVisibility: 'hidden', // Para que se vea bien al rotar
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)', // Sombra interior sutil
    },

    // --- SELLO ---
    waxSeal: {
        position: 'absolute',
        top: '50%', 
        left: '50%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 30% 30%, #ffd700, #d4af37, #8b6914)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)', // Sombra fuerte
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 60,
        cursor: 'pointer',
        transition: 'all 0.4s ease',
    },
    sealInner: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '1px solid rgba(138, 110, 40, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive',
        fontSize: '22px',
        color: '#5c4008',
        fontWeight: '400',
        transform: 'rotate(-5deg)',
    }
};
