import React, { useState } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    
    // --- ESTADOS ---
    // 0: Cerrado | 1: Abriendo Solapa | 2: Sacando Carta | 3: Zoom Lectura
    const [animationStep, setAnimationStep] = useState(0);

    // --- METADATOS PARA WHATSAPP (ICONO) ---
    const pageTitle = "Invitación de Boda - Manel & Carla";
    const pageDescription = "Estás invitado a nuestra boda. Toca para abrir el sobre.";
    
    // IMPORTANTE: Asegúrate de que el archivo 'invitacion.jpg' esté en la carpeta /public
    // La URL debe ser absoluta (con https://...) para que WhatsApp la detecte.
    const pageImage = "https://bodamanelcarla.vercel.app/invitacion.jpg"; 

    // =========================================================
    // ANIMACIÓN DEL SOBRE
    // =========================================================
    const startEnvelopeAnimation = (e) => {
        if(e) e.stopPropagation();
        
        setAnimationStep(1); // 1. Abre tapa
        setTimeout(() => setAnimationStep(2), 1000);  // 2. Saca carta (espera 1s)
        setTimeout(() => setAnimationStep(3), 2200); // 3. Zoom final
    };

    const handleConfirm = () => {
        window.open('https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3', '_blank');
    };

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                
                {/* --- OPEN GRAPH (WHATSAPP) --- */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:image:secure_url" content={pageImage} />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />

                {/* FUENTES Y ESTILOS */}
                <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@200;400&family=Great+Vibes&display=swap" rel="stylesheet" />
                <style>{`
                    html, body { margin: 0; padding: 0; background-color: #1a1a1a; overflow: hidden; height: 100%; }
                    
                    .vintage-paper {
                        background-color: #d8c8b0;
                        background-image: 
                            url("https://www.transparenttextures.com/patterns/aged-paper.png"),
                            radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%);
                        box-shadow: inset 0 0 30px rgba(78, 59, 40, 0.6); 
                    }
                    .torn-edge { filter: url(#wavy); }

                    @keyframes pulse-seal {
                        0% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); }
                        50% { transform: translate(-50%, -50%) scale(1.05); filter: drop-shadow(0 6px 8px rgba(0,0,0,0.4)); }
                        100% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); }
                    }
                `}</style>
            </Head>

            {/* --- FILTRO SVG PARA BORDES IRREGULARES --- */}
            <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0">
                <defs>
                    <filter id="wavy">
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
                    </filter>
                </defs>
            </svg>

            {/* --- ESCENARIO --- */}
            <div style={styles.container}>
                <div style={{
                    ...styles.wrapper,
                    transform: animationStep === 3 ? 'translateY(30vh) scale(1.1)' : 'translateY(5vh) scale(1)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    <div style={{
                        ...styles.card,
                        transform: animationStep >= 2 ? 'translateY(-75%)' : 'translateY(0)',
                        opacity: animationStep >= 2 ? 1 : 0, 
                        zIndex: animationStep >= 2 ? 20 : 1, 
                        transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease 0.2s'
                    }}>
                        <div style={styles.cardContent}>
                            <p style={styles.topText}>¡NOS CASAMOS!</p>
                            <h1 style={styles.names}>Manel & Carla</h1>
                            <div style={styles.divider}></div>
                            <div style={styles.bodyTextContainer}>
                                <p style={styles.bodyText}>Nos haría mucha ilusión que nos acompañaras en este día tan especial para nosotros.</p>
                                <p style={styles.bodyText}>Queremos celebrar nuestro amor contigo y que seas parte de este momento único.</p>
                            </div>
                            <p style={styles.footerText}>¡Te esperamos!</p>
                            <button onClick={handleConfirm} style={{
                                ...styles.button, 
                                opacity: animationStep === 3 ? 1 : 0, 
                                pointerEvents: animationStep === 3 ? 'auto' : 'none', 
                                transition: 'opacity 1s ease 1s'
                            }}>Confirmar Asistencia</button>
                        </div>
                    </div>

                    {/* --- SOBRE VINTAGE --- */}
                    <div style={styles.envelope}>
                        <div style={{...styles.layer, backgroundColor: '#2a221b'}}></div>
                        
                        <div className="vintage-paper torn-edge" style={{...styles.layer, ...styles.flapLeft}}></div>
                        <div className="vintage-paper torn-edge" style={{...styles.layer, ...styles.flapRight}}></div>
                        
                        <div className="vintage-paper torn-edge" style={{...styles.layer, ...styles.flapBottom}}>
                             <div style={styles.flapTextContainer}>
                                <span style={styles.flapNames}>Manel & Carla</span>
                            </div>
                        </div>
                        
                        <div className="vintage-paper torn-edge" style={{
                            ...styles.layer, ...styles.flapTop,
                            transform: animationStep >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: animationStep >= 1 ? 1 : 50, 
                            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s linear 0.5s'
                        }}>
                             <div style={{width:'100%', height:'100%', backgroundColor: 'rgba(0,0,0,0.05)'}}></div>
                        </div>
                    </div>

                    {/* --- SELLO --- */}
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
        width: '100vw', height: '100dvh', 
        backgroundColor: '#111',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
        background: 'radial-gradient(circle at center, #2c2c2c 0%, #050505 100%)'
    },
    wrapper: {
        position: 'relative',
        width: '340px',  
        height: '460px', 
        perspective: '1200px', 
        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))',
    },

    // --- CARTA ---
    card: {
        position: 'absolute',
        top: '10px', left: '15px', right: '15px', bottom: '10px',
        backgroundColor: '#fffcf5',
        borderRadius: '2px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
        pointerEvents: 'auto'
    },
    cardContent: {
        width: 'calc(100% - 20px)', height: 'calc(100% - 20px)',
        padding: '20px 5px', 
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #d4af37', textAlign: 'center'
    },
    topText: { fontFamily: '"Montserrat", sans-serif', fontSize: '11px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', marginBottom: '5px' },
    
    names: { 
        fontFamily: '"Great Vibes", cursive', fontSize: '2.2rem', color: '#222', 
        margin: '10px 0', lineHeight: 1, whiteSpace: 'nowrap' 
    },
    
    divider: { width: '40px', height: '1px', backgroundColor: '#d4af37', margin: '15px 0' },
    bodyTextContainer: { width: '90%', marginBottom: '15px' },
    bodyText: { fontFamily: '"Cormorant Garamond", serif', fontSize: '15px', color: '#444', lineHeight: '1.4', margin: '8px 0' },
    footerText: { fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '10px 0' },
    button: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '12px 30px', fontSize: '11px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', marginTop: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },

    // --- ENVELOPE ---
    envelope: { width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', pointerEvents: 'none' },
    layer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },

    flapLeft: { clipPath: 'polygon(0 0, 0% 100%, 55% 55%)', zIndex: 10, filter: 'drop-shadow(2px 0 5px rgba(0,0,0,0.3))' },
    flapRight: { clipPath: 'polygon(100% 0, 100% 100%, 45% 55%)', zIndex: 10, filter: 'drop-shadow(-2px 0 5px rgba(0,0,0,0.3))' },
    
    flapBottom: {
        zIndex: 11,
        clipPath: 'polygon(0 100%, 50% 45%, 100% 100%)',
        filter: 'drop-shadow(0 -5px 10px rgba(0,0,0,0.4))',
    },
    
    flapTextContainer: { position: 'absolute', bottom: '15%', width: '100%', textAlign: 'center', zIndex: 12 },
    flapNames: {
        fontFamily: '"Great Vibes", cursive', fontSize: '2rem', color: '#4e3b28', 
        textShadow: '0 1px 1px rgba(255,255,255,0.3)', opacity: 0.9, whiteSpace: 'nowrap'
    },
    
    flapTop: {
        zIndex: 50, transformOrigin: 'top',
        clipPath: 'polygon(0 0, 50% 50%, 100% 0)',
        filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))',
    },

    waxSeal: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90px', height: '90px', zIndex: 9999, cursor: 'pointer', 
        transition: 'all 0.5s ease', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
        pointerEvents: 'auto', display: 'block', 
    },
    sealContent: {
        width: '80px', height: '80px', borderRadius: '50%', margin: '5px', 
        background: 'radial-gradient(circle at 35% 35%, #c62828, #8e0000, #4a0000)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: 'inset 0 0 0 5px rgba(0,0,0,0.2), 0 0 0 2px #5e0000', border: '1px solid rgba(255,255,255,0.1)'
    },
    sealText: {
        fontFamily: '"Great Vibes", cursive', color: '#3b0000', fontSize: '22px', fontWeight: 'bold',
        textShadow: '0 1px 0 rgba(255,255,255,0.2)', transform: 'rotate(-10deg)',
    }
};
