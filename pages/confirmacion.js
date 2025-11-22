import React, { useState } from 'react';
import Head from 'next/head';

export default function InvitationEnvelope() {
    const [isOpen, setIsOpen] = useState(false);

    // Función para confirmar (botón final)
    const handleConfirm = () => {
        window.open('https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3', '_blank');
    };

    return (
        <>
            <Head>
                <title>Invitación Manel & Carla</title>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet" />
            </Head>

            <div style={styles.container}>
                
                {/* ÁREA DEL SOBRE */}
                <div style={styles.envelopeWrapper}>
                    
                    {/* 1. LA CARTA (INVITACIÓN) 
                        Nota: Está detrás de las solapas inferiores, pero subirá con z-index al abrirse 
                    */}
                    <div style={{
                        ...styles.card,
                        transform: isOpen ? 'translateY(-120px)' : 'translateY(0)',
                        zIndex: isOpen ? 5 : 1, // Al subir, se pone por delante del sobre
                        transition: 'transform 0.8s ease-in-out 0.4s, z-index 0s linear 0.4s' // Delay para que espere a que se abra el sobre
                    }}>
                        <div style={styles.cardBorder}>
                            <p style={styles.cardHeader}>NUESTRA BODA</p>
                            <h1 style={styles.names}>Manel & Carla</h1>
                            <div style={styles.divider}></div>
                            <p style={styles.date}>21 · 10 · 2026</p>
                            <p style={styles.location}>Masia Mas Llombart, BCN</p>
                            
                            <button onClick={handleConfirm} style={styles.button}>
                                Confirmar Asistencia
                            </button>
                        </div>
                    </div>

                    {/* 2. EL SOBRE (ESTRUCTURA) */}
                    <div style={styles.envelopeBody}>
                        
                        {/* Fondo del sobre (Interior) */}
                        <div style={styles.envelopeInner}></div>

                        {/* Solapa Izquierda */}
                        <div style={styles.flapLeft}></div>
                        
                        {/* Solapa Derecha */}
                        <div style={styles.flapRight}></div>

                        {/* Solapa Inferior (Bolsillo) */}
                        <div style={styles.flapBottom}></div>

                        {/* 3. SOLAPA SUPERIOR (LA QUE SE ABRE) */}
                        <div style={{
                            ...styles.flapTop,
                            transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            zIndex: isOpen ? 1 : 4, // Baja de nivel al abrirse para que la carta salga por encima
                            transition: 'transform 0.6s ease-in-out, z-index 0.2s linear 0.3s'
                        }}></div>

                        {/* 4. EL SELLO DE LACRE */}
                        <div 
                            onClick={() => setIsOpen(true)}
                            style={{
                                ...styles.waxSeal,
                                opacity: isOpen ? 0 : 1,
                                transform: isOpen ? 'scale(0.5)' : 'scale(1)',
                                pointerEvents: isOpen ? 'none' : 'auto',
                            }}
                        >
                            <span style={styles.sealText}>M&C</span>
                        </div>
                        
                        {/* Texto de ayuda si está cerrado */}
                        {!isOpen && (
                            <div style={styles.clickHint}>Toca el sello para abrir</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// --- ESTILOS CSS EN JS (Sin librerías) ---
const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f0eb', // Color de fondo de la web (beige suave)
        fontFamily: '"Montserrat", sans-serif',
        overflow: 'hidden',
        padding: '20px',
    },
    envelopeWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '350px',
        height: '250px', // Altura del sobre cerrado
        marginTop: '100px', // Espacio para que la carta suba
    },
    // --- CARTA ---
    card: {
        position: 'absolute',
        top: '5px',
        left: '5%',
        width: '90%',
        height: '400px', // La carta es más alta que el sobre
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        // La animación se maneja inline en el componente
    },
    cardBorder: {
        width: '100%',
        height: '100%',
        border: '1px solid #d4af37', // Borde dorado fino
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
    },
    cardHeader: {
        fontSize: '10px',
        letterSpacing: '3px',
        color: '#8a8a8a',
        marginBottom: '10px',
        textTransform: 'uppercase',
    },
    names: {
        fontFamily: '"Playfair Display", serif',
        fontSize: '32px',
        color: '#2c2c2c',
        margin: '5px 0',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    divider: {
        width: '30px',
        height: '1px',
        backgroundColor: '#d4af37',
        margin: '15px 0',
    },
    date: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#b18579',
        letterSpacing: '1px',
        marginBottom: '5px',
    },
    location: {
        fontSize: '12px',
        color: '#8a8a8a',
        marginBottom: '25px',
    },
    button: {
        backgroundColor: '#b18579', // Color terracota
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(177, 133, 121, 0.4)',
        transition: 'background 0.3s',
    },

    // --- EL SOBRE ---
    envelopeBody: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        perspective: '1000px', // Necesario para el efecto 3D de la solapa
        zIndex: 2,
    },
    envelopeInner: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#e6dfd3', // Color oscuro del interior
        borderRadius: '5px',
    },
    // Triángulos CSS para las solapas
    flapLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderTop: '125px solid transparent', // Mitad de la altura
        borderBottom: '125px solid transparent',
        borderLeft: '175px solid #f2ece4', // Mitad del ancho, color sobre
        zIndex: 3,
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius: '5px',
    },
    flapRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderTop: '125px solid transparent',
        borderBottom: '125px solid transparent',
        borderRight: '175px solid #f2ece4', // Color sobre
        zIndex: 3,
        borderTopRightRadius: '5px',
        borderBottomRightRadius: '5px',
    },
    flapBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        borderLeft: '175px solid transparent', // Mitad ancho
        borderRight: '175px solid transparent',
        borderBottom: '125px solid #e8e0d5', // Un poco más oscuro para dar profundidad
        zIndex: 3,
        borderBottomLeftRadius: '5px',
        borderBottomRightRadius: '5px',
    },
    // Solapa Superior (Animada)
    flapTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderLeft: '175px solid transparent',
        borderRight: '175px solid transparent',
        borderTop: '135px solid #f2ece4', // Color sobre
        transformOrigin: 'top', // Gira desde arriba
        zIndex: 4,
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        // Transition se define inline arriba
    },
    // --- SELLO ---
    waxSeal: {
        position: 'absolute',
        top: '40%', // Centrado verticalmente respecto a la solapa superior
        left: '50%',
        marginLeft: '-30px', // Mitad del ancho para centrar
        width: '60px',
        height: '60px',
        background: 'radial-gradient(circle at 30% 30%, #ffd700, #b8860b)', // Dorado simulado
        borderRadius: '50%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 0 10px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 6,
        cursor: 'pointer',
        border: '2px solid #daa520',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
    },
    sealText: {
        color: '#8b6914',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 'bold',
        fontSize: '18px',
        fontStyle: 'italic',
    },
    clickHint: {
        position: 'absolute',
        bottom: '-40px',
        width: '100%',
        textAlign: 'center',
        color: '#b18579',
        fontSize: '12px',
        letterSpacing: '1px',
        animation: 'bounce 2s infinite',
    }
};
