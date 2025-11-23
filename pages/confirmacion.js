import React, { useState } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // 0: Cerrado
    // 1: Abriendo Solapa
    // 2: Sacando Carta
    // 3: Lectura (Zoom final / Desplazamiento)
    const [animationStep, setAnimationStep] = useState(0);

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
            </Head>

            <div style={styles.container}>
                
                <div style={{
                    ...styles.wrapper,
                    // Al paso 3, movemos todo el sobre hacia abajo para que la carta se vea mejor
                    transform: animationStep === 3 ? 'translateY(40vh)' : 'translateY(0)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    <div style={{
                        ...styles.card,
                        // La carta sale hacia arriba (eje Y negativo)
                        transform: animationStep >= 2 ? 'translateY(-60%)' : 'translateY(0)',
                        opacity: animationStep >= 2 ? 1 : 0,
                        zIndex: animationStep >= 2 ? 20 : 1,
                        transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease'
                    }}>
                        {/* CONTENIDO DE LA CARTA:
                           Aquí aplicamos una rotación de 90 grados si quieres que la gente gire el móvil,
                           O simplemente diseñamos en vertical. 
                           Basado en tu petición "carta en horizontal", he forzado un diseño vertical 
                           que llena la pantalla, pero manteniendo la estética clásica.
                        */}
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

                    {/* --- SOBRE (FULL SCREEN) --- */}
                    <div style={styles.envelope}>
                        
                        {/* Interior del sobre (Fondo oscuro tras la carta) */}
                        <div style={styles.envelopeInner}></div>
                        
                        {/* Solapas Laterales (Izquierda y Derecha) */}
                        <div style={styles.flapLeft}></div>
                        <div style={styles.flapRight}></div>
                        
                        {/* Solapa Inferior (Cubre la parte baja hasta el centro) */}
                        <div style={styles.flapBottom}></div>

                        {/* Solapa Superior (El triángulo que baja y se abre) */}
                        <div style={{
                            ...styles.flapTop,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 50, 
                            transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s linear 0.4s'
                        }}></div>

                        {/* Sello (Centrado verticalmente) */}
                        <div onClick={animationStep === 0 ? startAnimation : undefined}
                             style={{
                                ...styles.waxSeal,
                                opacity: animationStep === 0 ? 1 : 0,
                                transform: animationStep === 0 ? 'scale(1)' : 'scale(1.5)',
                                pointerEvents: animationStep === 0 ? 'auto' : 'none',
                            }}>
                            <div style={styles.sealInner}>
                                <span style={styles.sealText}>Abrir</span>
                            </div>
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
        alignItems: 'flex-end', // Alineamos abajo para gestionar la salida de la carta
        overflow: 'hidden',
        position: 'relative',
    },
    wrapper: {
        position: 'relative',
        width: '100%',  // Ocupa todo el ancho
        height: '100%', // Ocupa todo el alto
        maxWidth: '600px', // Límite para que no se vea gigante en PC, pero lleno en móvil
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
        height: '85%', // La carta es casi tan alta como la pantalla
        backgroundColor: '#fff',
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
        justifyContent: 'space-around', // Distribuye el espacio verticalmente
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

    // --- SOBRE FULL SCREEN ---
    envelope: {
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none', // Permite hacer clic en el sello, pero ignora el resto para efectos visuales
    },
    envelopeInner: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#d1d1d1', // Color del interior oscuro
    },
    
    // LATERALES: Cubren todo el alto
    flapLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderTop: '50vh solid transparent',
        borderBottom: '50vh solid transparent',
        borderLeft: '55vw solid #f4f4f4', // Cubre un poco más de la mitad
        zIndex: 11,
    },
    flapRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderTop: '50vh solid transparent',
        borderBottom: '50vh solid transparent',
        borderRight: '55vw solid #f4f4f4',
        zIndex: 11,
    },
    
    // ABAJO: Triángulo grande
    flapBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        borderLeft: '50vw solid transparent',
        borderRight: '50vw solid transparent',
        borderBottom: '55vh solid #ededed', // Sube hasta un poco más de la mitad
        zIndex: 12,
    },
    
    // ARRIBA: El triángulo que se mueve
    flapTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderLeft: '50vw solid transparent',
        borderRight: '50vw solid transparent',
        borderTop: '55vh solid #ffffff', // Baja hasta un poco más de la mitad
        transformOrigin: 'top',
        zIndex: 50,
        filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.15))'
    },

    // --- SELLO ---
    waxSeal: {
        position: 'absolute',
        // Centrado perfecto
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)', // Ajuste fino de centrado
        marginTop: '25px', // Ajuste visual para que caiga justo en la unión de las solapas
        marginLeft: '-40px', 
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 30% 30%, #ffd700, #d4af37, #8b6914)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 60,
        cursor: 'pointer',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        pointerEvents: 'auto',
    },
    sealInner: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '2px solid rgba(138, 110, 40, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive',
        fontSize: '24px',
        color: '#5c4008',
        fontWeight: '600',
        transform: 'rotate(-5deg)',
    }
};
