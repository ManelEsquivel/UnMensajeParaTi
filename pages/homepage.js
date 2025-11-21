import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Homepage() {
    const router = useRouter();
    
    // --- ESTADOS PARA EL EFECTO TELÓN ---
    const [opacity, setOpacity] = useState(1);
    const [showCurtain, setShowCurtain] = useState(true);
    // ------------------------------------

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        document.documentElement.removeAttribute('style');
        document.body.removeAttribute('style');
        
        document.documentElement.style.backgroundColor = "#fdfbfb";
        document.body.style.backgroundColor = "#fdfbfb";

        setTimeout(() => {
            setOpacity(0); 
            setIsVisible(true); 
        }, 500);

        setTimeout(() => {
            setShowCurtain(false);
        }, 2000);

    }, []);

    const navigateTo = (path) => {
        router.push(path);
    };

    // Función para abrir enlaces externos
    const openExternalLink = (url) => {
        window.open(url, '_blank');
    };

    return (
        <>
            <Head>
                <title>Boda Manel & Carla</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                <meta name="theme-color" content="#fdfbfb" />
            </Head>

            {/* --- 1. LA LONA NEGRA (EFECTO TELÓN) --- */}
            {showCurtain && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'black', zIndex: 99999,
                    opacity: opacity,
                    transition: 'opacity 1.5s ease-in-out',
                    pointerEvents: 'none'
                }}></div>
            )}

            <div style={styles.container}>
                <div style={{
                    ...styles.content, 
                    opacity: isVisible ? 1 : 0, 
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
                }}>
                    
                    {/* ENCABEZADO (Márgenes reducidos) */}
                    <header style={styles.header}>
                        <h1 style={styles.title}>Manel & Carla</h1>
                        <p style={styles.date}>31 de Octubre de 2026</p>
                        <div style={styles.divider}></div>
                        <p style={styles.welcome}>¡Bienvenidos a nuestra boda!</p>
                    </header>

                    {/* MENÚ DE OPCIONES */}
                    <div style={styles.grid}>
                        
                        {/* TARJETA 1: ASISTENTE */}
                        <div style={styles.card} onClick={() => navigateTo('/bot_boda_asistente')}>
                            <div style={{...styles.iconBg, background: '#e3f2fd'}}>
                                <span style={styles.emoji}>🤖</span>
                            </div>
                            <div style={styles.textContainer}>
                                <h3 style={styles.cardTitle}>Asistente Virtual</h3>
                                <p style={styles.cardText}>Pregunta tus dudas, horarios y detalles.</p>
                            </div>
                            <span style={styles.arrow}>➔</span>
                        </div>

                        {/* TARJETA 2: WEB DE LA BODA */}
                        <div style={styles.card} onClick={() => openExternalLink('https://www.bodas.net/web/manel-y-carla/bienvenidos-1')}>
                            <div style={{...styles.iconBg, background: '#f3e5f5'}}>
                                <span style={styles.emoji}>💒</span>
                            </div>
                            <div style={styles.textContainer}>
                                <h3 style={styles.cardTitle}>Web de la Boda</h3>
                                <p style={styles.cardText}>Info oficial, mapa, confirma tu asistencia.</p>
                            </div>
                            <span style={styles.arrow}>➔</span>
                        </div>
                        
                        {/* 🌟 TARJETA 3: DJ (NUEVA) 🌟 */}
                        <div style={styles.card} onClick={() => navigateTo('/dj')}>
                            <div style={{...styles.iconBg, background: '#ffe0b2'}}> {/* Naranja suave */}
                                <span style={styles.emoji}>🎵</span>
                            </div>
                            <div style={styles.textContainer}>
                                <h3 style={styles.cardTitle}>Añade tu canción</h3>
                                <p style={styles.cardText}>Pide tu temazo para la playlist colaborativa.</p>
                            </div>
                            <span style={styles.arrow}>➔</span>
                        </div>

                        {/* TARJETA 4: FOTOS */}
                        <div style={styles.card} onClick={() => navigateTo('/imagenes_boda')}>
                            <div style={{...styles.iconBg, background: '#fce4ec'}}>
                                <span style={styles.emoji}>📸</span>
                            </div>
                            <div style={styles.textContainer}>
                                <h3 style={styles.cardTitle}>Álbum de Fotos</h3>
                                <p style={styles.cardText}>Sube tus recuerdos y mira la galería.</p>
                            </div>
                            <span style={styles.arrow}>➔</span>
                        </div>

                        {/* TARJETA 5: JUEGO */}
                        <div style={styles.card} onClick={() => navigateTo('/game')}>
                            <div style={{...styles.iconBg, background: '#fff3e0'}}>
                                <span style={styles.emoji}>🎮</span>
                            </div>
                            <div style={styles.textContainer}>
                                <h3 style={styles.cardTitle}>El Quiz</h3>
                                <p style={styles.cardText}>¿Cuánto sabes sobre nosotros?</p>
                            </div>
                            <span style={styles.arrow}>➔</span>
                        </div>

                    </div>

                    <footer style={styles.footer}>
                        <p>Hecho con ❤️ para vosotros</p>
                    </footer>
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', 
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        padding: '15px', 
        paddingBottom: '40px', 
        boxSizing: 'border-box',
    },
    content: {
        width: '100%',
        maxWidth: '500px',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    header: {
        textAlign: 'center',
        marginBottom: '15px', // 👈 AJUSTE: Reducido de 25px a 15px
        marginTop: '5px',    // 👈 AJUSTE: Reducido de 10px a 5px
    },
    title: {
        fontSize: '2.2rem',
        color: '#2d3748',
        fontFamily: '"Times New Roman", serif',
        margin: '0 0 5px 0',
        letterSpacing: '1px',
        lineHeight: '1.2',
    },
    date: {
        fontSize: '1rem',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
    },
    divider: {
        width: '50px',
        height: '3px',
        backgroundColor: '#d6bcfa',
        margin: '15px auto',
        borderRadius: '2px',
    },
    welcome: {
        color: '#4a5568',
        fontSize: '0.95rem',
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
    },
    iconBg: {
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '15px', 
        flexShrink: 0, 
    },
    emoji: {
        fontSize: '24px',
    },
    textContainer: {
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0, 
        paddingRight: '10px',
    },
    cardTitle: {
        margin: '0 0 2px 0',
        fontSize: '1.1rem', 
        color: '#2d3748',
        fontWeight: 'bold',
        lineHeight: '1.2',
    },
    cardText: {
        margin: 0,
        fontSize: '0.85rem',
        color: '#718096',
        lineHeight: '1.3',
    },
    arrow: {
        marginLeft: 'auto', 
        color: '#cbd5e0',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        flexShrink: 0, 
    },
    footer: {
        marginTop: '15px', // 👈 AJUSTE: Reducido de 30px a 15px
        color: '#a0aec0',
        fontSize: '0.75rem',
        textAlign: 'center',
        paddingBottom: '10px',
    }
};

}
