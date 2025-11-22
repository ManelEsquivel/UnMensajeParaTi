import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    // ESTADOS DE LA SECUENCIA DE ANIMACIÓN:
    // 0: Cerrado (Sello visible)
    // 1: Abriendo Solapa (El sello desaparece, la solapa gira)
    // 2: Sacando Carta (La carta se desliza hacia arriba)
    // 3: Leyendo (Zoom final para ver el contenido)
    const [animationStep, setAnimationStep] = useState(0);

    const startAnimation = () => {
        // Paso 1: Abrir solapa
        setAnimationStep(1);

        // Paso 2: Esperar 800ms (tiempo que tarda la solapa) y sacar la carta
        setTimeout(() => {
            setAnimationStep(2);
        }, 800);

        // Paso 3: Esperar 1 segundo más y hacer el zoom final
        setTimeout(() => {
            setAnimationStep(3);
        }, 1800);
    };

    const handleConfirm = () => {
        window.open('https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3', '_blank');
    };

    return (
        <>
            <Head>
                <title>Invitación Manel & Carla</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Great+Vibes&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet" />
            </Head>

            <div style={styles.container}>
                
                {/* CONTENEDOR QUE HACE ZOOM AL FINAL */}
                <div style={{
                    ...styles.wrapper,
                    transform: animationStep === 3 ? 'scale(1.15) translateY(60px)' : 'scale(1)',
                    transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)' // Zoom suave y elegante
                }}>

                    {/* --- 1. LA CARTA (INVITACIÓN) --- */}
                    <div style={{
                        ...styles.card,
                        // LÓGICA DE MOVIMIENTO:
                        // Si es paso 0 o 1: Quieta abajo.
                        // Si es paso 2 o 3: Sube (TranslateY negativo).
                        transform: animationStep >= 2 ? 'translateY(-200px)' : 'translateY(0)',
                        // LÓGICA DE CAPAS (Z-INDEX):
                        // Al principio está dentro (index 2). Cuando empieza a subir (paso 2), se pone encima de todo (index 20).
                        zIndex: animationStep >= 2 ? 20 : 2,
                        opacity: animationStep >= 2 ? 1 : (animationStep === 1 ? 1 : 0), // Oculta al inicio para evitar glitches visuales
                        transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' // Efecto "rebote" suave al salir
                    }}>
                        <div style={styles.cardBorder}>
                            <p style={styles.subHeader}>NOS CASAMOS</p>
                            <h1 style={styles.names}>Manel & Carla</h1>
                            <div style={styles.divider}>
                                <span style={{fontSize:'20px'}}>❦</span>
                            </div>
                            <p style={styles.date}>21 · 10 · 2026</p>
                            <p style={styles.place}>Masia Mas Llombart, BCN</p>
                            
                            <p style={styles.verse}>
                                "El amor no hace girar al mundo.<br/>El amor es lo que hace que el viaje valga la pena."
                            </p>

                            {/* Botón interactivo solo al final */}
                            <button 
                                onClick={handleConfirm} 
                                style={{
                                    ...styles.confirmButton,
                                    opacity: animationStep === 3 ? 1 : 0,
                                    pointerEvents: animationStep === 3 ? 'auto' : 'none',
                                    transition: 'opacity 1s ease 1s' // Aparece lento al final
                                }}
                            >
                                Confirmar Asistencia
                            </button>
                        </div>
                    </div>

                    {/* --- 2. EL SOBRE --- */}
                    <div style={styles.envelope}>
                        
                        {/* Interior oscuro */}
                        <div style={styles.envelopeInner}></div>

                        {/* Solapas Laterales */}
                        <div style={styles.flapLeft}></div>
                        <div style={styles.flapRight}></div>

                        {/* Solapa Inferior (Bolsillo) */}
                        <div style={styles.flapBottom}></div>

                        {/* Solapa Superior (Animada) */}
                        <div style={{
                            ...styles.flapTop,
                            // Gira 180 grados si el paso es 1 o mayor
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            // Baja el z-index para que la carta pase por encima al salir
                            zIndex: animationStep >= 1 ? 1 : 10, 
                            transition: 'transform 0.8s ease-in-out, z-index 0.1s linear 0.4s'
                        }}></div>

                        {/* --- 3. SELLO DE CERA ROJA --- */}
                        <div 
                            onClick={animationStep === 0 ? startAnimation : undefined}
                            style={{
                                ...styles.waxSeal,
                                opacity: animationStep === 0 ? 1 : 0,
                                transform: animationStep === 0 ? 'scale(1)' : 'scale(1.2)',
                                pointerEvents: animationStep === 0 ? 'auto' : 'none',
                            }}
                        >
                            <span style={styles.sealText}>M&C</span>
                        </div>

                    </div>
                    
                    {/* Texto de ayuda pulsante */}
                    {animationStep === 0 && (
                        <div style={styles.hintText}>Toca el sello para abrir</div>
                    )}

                </div>
            </div>
            
            <style jsx global>{`
                body { margin: 0; padding: 0; background-color: #f2f0eb; }
                @keyframes pulse-shadow {
                    0% { box-shadow: 0 0 0 0 rgba(180, 0, 0, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(180, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(180, 0, 0, 0); }
                }
            `}</style>
        </>
    );
}

// --- ESTILOS CSS ---
const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f2f0eb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    wrapper: {
        position: 'relative',
        width: '340px', // Un poco más ancho para formato horizontal
        height: '230px', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        perspective: '1500px', // Perspectiva 3D esencial
    },
    
    // --- ESTILOS DE LA CARTA ---
    card: {
        position: 'absolute',
        bottom: '5px',
        width: '310px', // Casi el ancho del sobre
        height: '450px', // Muy alta para que quepa todo
        backgroundColor: '#fffcf5',
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`, // Textura sutil si carga, si no color crema
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // La animación se maneja en el inline style del componente
    },
    cardBorder: {
        width: '90%',
        height: '92%',
        border: '1px solid #cfaa5e', // Dorado mate
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Empezar desde arriba
        textAlign: 'center',
        padding: '25px 15px',
        boxSizing: 'border-box',
    },
    subHeader: {
        fontFamily: '"Montserrat", sans-serif',
        fontSize: '10px',
        letterSpacing: '4px',
        color: '#8a8a8a',
        marginBottom: '15px',
        marginTop: '10px',
        textTransform: 'uppercase',
    },
    names: {
        fontFamily: '"Great Vibes", cursive', // Fuente estilo caligrafía boda
        fontSize: '42px',
        color: '#2c2c2c',
        margin: '5px 0',
        lineHeight: '1.2',
    },
    divider: {
        color: '#cfaa5e',
        margin: '10px 0',
        opacity: 0.8,
    },
    date: {
        fontFamily: '"Cinzel", serif',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a1a1a',
        letterSpacing: '1px',
        marginBottom: '5px',
    },
    place: {
        fontFamily: '"Montserrat", sans-serif',
        fontSize: '12px',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '20px',
    },
    verse: {
        fontFamily: '"Montserrat", sans-serif',
        fontSize: '11px',
        color: '#777',
        fontStyle: 'italic',
        lineHeight: '1.6',
        marginBottom: 'auto', // Empuja el botón al fondo
        padding: '0 10px',
    },
    confirmButton: {
        backgroundColor: '#8b0000', // Rojo oscuro elegante
        color: '#fff',
        border: 'none',
        padding: '14px 28px',
        fontSize: '12px',
        fontFamily: '"Montserrat", sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontWeight: '600',
        cursor: 'pointer',
        borderRadius: '50px',
        boxShadow: '0 4px 15px rgba(139, 0, 0, 0.3)',
        marginBottom: '10px',
    },

    // --- ESTILOS DEL SOBRE ---
    envelope: {
        position: 'relative',
        width: '340px',
        height: '230px',
        zIndex: 5,
    },
    envelopeInner: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#3e3a38', // Interior oscuro
        borderRadius: '6px',
    },
    flapLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderTop: '115px solid transparent',
        borderBottom: '115px solid transparent',
        borderLeft: '180px solid #ece6d8', // Color papel
        zIndex: 6,
        borderTopLeftRadius: '6px',
        borderBottomLeftRadius: '6px',
    },
    flapRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderTop: '115px solid transparent',
        borderBottom: '115px solid transparent',
        borderRight: '180px solid #ece6d8',
        zIndex: 6,
        borderTopRightRadius: '6px',
        borderBottomRightRadius: '6px',
    },
    flapBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        borderLeft: '170px solid transparent',
        borderRight: '170px solid transparent',
        borderBottom: '130px solid #e3decb', // Un poco más oscuro
        zIndex: 7,
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
    },
    flapTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderLeft: '170px solid transparent',
        borderRight: '170px solid transparent',
        borderTop: '140px solid #ece6d8', // Color papel
        zIndex: 10,
        transformOrigin: 'top',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
    },

    // --- SELLO DE CERA ROJA REALISTA ---
    waxSeal: {
        position: 'absolute',
        top: '120px', // Ajustado al pico de la solapa
        left: '50%',
        marginLeft: '-35px',
        marginTop: '-35px',
        width: '70px',
        height: '70px',
        // Gradiente rojo profundo
        background: 'radial-gradient(circle at 30% 30%, #d32f2f, #8b0000)',
        borderRadius: '50%',
        // Sombras complejas para efecto 3D
        boxShadow: '0 5px 15px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.3), inset -2px -2px 5px rgba(0,0,0,0.5)',
        border: '4px solid #720e0e', // Borde irregular simulado
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        animation: 'pulse-shadow 2s infinite', // Animación definida en el CSS global
    },
    sealText: {
        color: '#520808',
        fontFamily: '"Cinzel", serif',
        fontSize: '22px',
        fontWeight: 'bold',
        textShadow: '0 1px 1px rgba(255,255,255,0.2)',
    },
    hintText: {
        position: 'absolute',
        bottom: '-50px',
        color: '#8b8b8b',
        fontFamily: '"Montserrat", sans-serif',
        fontSize: '11px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
    }
};
