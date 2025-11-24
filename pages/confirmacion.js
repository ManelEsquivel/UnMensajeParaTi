import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    
    // --- ESTADOS ---
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // 0: Cerrado | 1: Abriendo Solapa | 2: Sacando Carta | 3: Lectura (Abajo y Zoom)
    const [animationStep, setAnimationStep] = useState(0);

    // --- METADATOS ---
    const pageTitle = "Invitación de Boda - Manel & Carla";
    const pageDescription = "Estás invitado a nuestra boda. Toca para abrir el sobre.";
    const pageImage = "https://bodamanelcarla.vercel.app/confirmacion.jpg"; 

    // --- DATOS DEL EVENTO ---
    const eventData = {
        title: "Boda Manel & Carla",
        location: "Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona",
        description: "¡Nos encantaría que nos acompañaras en nuestro gran día! Confirma aquí: https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3",
        date: "20261031T120000",
        durationHours: 10
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // --- LÓGICA CALENDARIO (.ICS) ---
    const formatICSDate = (dateString, isEnd = false) => {
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6)) - 1;
        const day = parseInt(dateString.substring(6, 8));
        const hour = parseInt(dateString.substring(9, 11));
        const minute = parseInt(dateString.substring(11, 13));
        const second = parseInt(dateString.substring(13, 15));

        let date = new Date(year, month, day, hour, minute, second);
        if (isEnd) date.setHours(date.getHours() + eventData.durationHours);

        const pad = (num) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    };

    const downloadICalFile = () => {
        const startDate = eventData.date;
        const endDate = formatICSDate(startDate, true);
        const stamp = formatICSDate(new Date().toISOString().replace(/[-:.]/g, '').substring(0, 15));
        const uid = Date.now().toString() + "@manel-carla-boda.com";

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Manel & Carla//Invitacion//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${stamp}`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${endDate}`,
            `SUMMARY:${eventData.title}`,
            `DESCRIPTION:${eventData.description}`,
            `LOCATION:${eventData.location}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Boda_Manel_Carla.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- MANEJADORES ---
    const startEnvelopeAnimation = (e) => {
        if(e) e.stopPropagation();
        setAnimationStep(1); 
        setTimeout(() => setAnimationStep(2), 1000); 
        setTimeout(() => setAnimationStep(3), 2200); 
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleFinalConfirm = () => {
        window.open('https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3', '_blank');
        setShowModal(false);
    };

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:image:secure_url" content={pageImage} />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />

                <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@200;400&family=Great+Vibes&display=swap" rel="stylesheet" />
                <style>{`
                    html, body { margin: 0; padding: 0; background-color: #f7f3ed; overflow: hidden; height: 100%; }
                    
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

                    .modal-overlay {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background-color: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
                        z-index: 9999;
                        display: flex; justify-content: center; align-items: center;
                        opacity: 0; visibility: hidden; transition: opacity 0.4s ease, visibility 0.4s;
                    }
                    .modal-overlay.active { opacity: 1; visibility: visible; }
                    
                    .modal-content {
                        background-color: #fffcf5;
                        width: 85%; max-width: 350px;
                        padding: 30px 20px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #d4af37;
                        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                        transform: scale(0.8) translateY(20px);
                        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .modal-overlay.active .modal-content { transform: scale(1) translateY(0); }

                    .btn-modal-cal {
                        display: block; width: 100%; padding: 12px; margin-bottom: 10px;
                        background: white; border: 1px solid #d4af37; color: #4e3b28;
                        font-family: 'Montserrat', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
                        cursor: pointer; border-radius: 4px;
                    }
                    .btn-modal-conf {
                        display: block; width: 100%; padding: 12px;
                        background: #222; border: none; color: white;
                        font-family: 'Montserrat', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
                        cursor: pointer; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    }
                `}</style>
            </Head>

            <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0">
                <defs>
                    <filter id="wavy">
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
                    </filter>
                </defs>
            </svg>

            {/* --- CONTENEDOR PRINCIPAL --- */}
            <div style={{
                ...styles.container,
                opacity: isPageLoaded ? 1 : 0, 
                transition: 'opacity 1.5s ease-in-out'
            }}>
                
                <div style={{
                    ...styles.wrapper,
                    // === CAMBIO CLAVE ===
                    // translateY(75vh): Bajamos mucho más el sobre para que la tarjeta llegue "hasta el final".
                    // scale(1.25): Mantenemos el zoom que se ve bien.
                    transform: animationStep === 3 ? 'translateY(75vh) scale(1.25)' : 'translateY(5vh) scale(1)',
                    transition: 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>

                    {/* --- CARTA --- */}
                    <div style={{
                        ...styles.card,
                        transform: animationStep >= 2 ? 'translateY(-100%)' : 'translateY(0)',
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
                            
                            <button onClick={handleOpenModal} style={{
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

            {/* --- MODAL --- */}
            <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={(e) => e.target.className.includes('overlay') && setShowModal(false)}>
                <div className="modal-content">
                    <h2 style={{ fontFamily: '"Great Vibes", cursive', fontSize: '2.2rem', color: '#d4af37', margin: '0 0 15px 0' }}>
                        ¡Qué ilusión!
                    </h2>
                    <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem', color: '#555', marginBottom: '25px', lineHeight: '1.4' }}>
                        Gracias por querer acompañarnos. Antes de confirmar, te recomendamos guardar la fecha en tu calendario para no olvidarte.
                    </p>
                    
                    <button className="btn-modal-cal" onClick={downloadICalFile}>
                        📅 Guardar fecha (31/10)
                    </button>
                    
                    <button className="btn-modal-conf" onClick={handleFinalConfirm}>
                        Continuar a Confirmación ➔
                    </button>
                </div>
            </div>
        </>
    );
}

// --- ESTILOS ---
const styles = {
    container: {
        width: '100vw', height: '100dvh', 
        backgroundColor: '#f7f3ed', 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
        background: 'radial-gradient(circle at center, #fbf7f2 0%, #f7f3ed 100%)' 
    },
    wrapper: {
        position: 'relative', width: '340px', height: '460px', perspective: '1200px', 
        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))', 
    },
    card: {
        position: 'absolute', top: '10px', left: '15px', right: '15px', bottom: '10px',
        backgroundColor: '#fffcf5', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`, pointerEvents: 'auto'
    },
    cardContent: {
        width: 'calc(100% - 20px)', height: 'calc(100% - 20px)', padding: '20px 5px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #d4af37', textAlign: 'center'
    },
    topText: { fontFamily: '"Montserrat", sans-serif', fontSize: '11px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', marginBottom: '5px' },
    names: { fontFamily: '"Great Vibes", cursive', fontSize: '2.2rem', color: '#222', margin: '10px 0', lineHeight: 1, whiteSpace: 'nowrap' },
    divider: { width: '40px', height: '1px', backgroundColor: '#d4af37', margin: '15px 0' },
    bodyTextContainer: { width: '90%', marginBottom: '15px' },
    bodyText: { fontFamily: '"Cormorant Garamond", serif', fontSize: '15px', color: '#444', lineHeight: '1.4', margin: '8px 0' },
    footerText: { fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '10px 0' },
    button: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '12px 30px', fontSize: '11px', fontFamily: '"Montserrat", sans-serif', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', marginTop: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    envelope: { width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', pointerEvents: 'none' },
    layer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },
    flapLeft: { clipPath: 'polygon(0 0, 0% 100%, 55% 55%)', zIndex: 10, filter: 'drop-shadow(2px 0 5px rgba(0,0,0,0.2))' },
    flapRight: { clipPath: 'polygon(100% 0, 100% 100%, 45% 55%)', zIndex: 10, filter: 'drop-shadow(-2px 0 5px rgba(0,0,0,0.2))' },
    flapBottom: { zIndex: 11, clipPath: 'polygon(0 100%, 50% 45%, 100% 100%)', filter: 'drop-shadow(0 -5px 10px rgba(0,0,0,0.3))' },
    flapTextContainer: { position: 'absolute', bottom: '15%', width: '100%', textAlign: 'center', zIndex: 12 },
    flapNames: { fontFamily: '"Great Vibes", cursive', fontSize: '2rem', color: '#4e3b28', textShadow: '0 1px 1px rgba(255,255,255,0.3)', opacity: 0.9, whiteSpace: 'nowrap' },
    flapTop: { zIndex: 50, transformOrigin: 'top', clipPath: 'polygon(0 0, 50% 50%, 100% 0)', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))' },
    waxSeal: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90px', height: '90px', zIndex: 9999, cursor: 'pointer', transition: 'all 0.5s ease', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))', pointerEvents: 'auto', display: 'block' },
    sealContent: { width: '80px', height: '80px', borderRadius: '50%', margin: '5px', background: 'radial-gradient(circle at 35% 35%, #c62828, #8e0000, #4a0000)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 0 0 5px rgba(0,0,0,0.2), 0 0 0 2px #5e0000', border: '1px solid rgba(255,255,255,0.1)' },
    sealText: { fontFamily: '"Great Vibes", cursive', color: '#3b0000', fontSize: '22px', fontWeight: 'bold', textShadow: '0 1px 0 rgba(255,255,255,0.2)', transform: 'rotate(-10deg)' }
};
