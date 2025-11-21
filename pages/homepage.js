import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Homepage() {
    const router = useRouter();
    
    // --- ESTADOS PARA EL EFECTO TELÓN ---
    const [opacity, setOpacity] = useState(1); // Empieza opaca (Negro total)
    const [showCurtain, setShowCurtain] = useState(true);
    // ------------------------------------

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 1. Limpieza y configuración de color base (para quitar bordes negros en móvil)
        document.documentElement.removeAttribute('style');
        document.body.removeAttribute('style');
        
        // Forzamos el color de fondo del body para que coincida con el degradado
        document.documentElement.style.backgroundColor = "#fdfbfb";
        document.body.style.backgroundColor = "#fdfbfb";

        // 2. SECUENCIA "CINE" (Telón negro a transparente)
        setTimeout(() => {
            setOpacity(0); // Empieza a desvanecerse la lona negra
            setIsVisible(true); // Activa la animación del contenido subiendo
        }, 500);

        // 3. Quitamos la lona del DOM cuando termine la animación
        setTimeout(() => {
            setShowCurtain(false);
        }, 2000);

    }, []);

    const navigateTo = (path) => {
        router.push(path);
    };

    return (
        <>
            <Head>
                <title>Boda Manel & Carla</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                {/* Esto define el color de la barra del navegador en móviles (Adiós negro) */}
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
                    
                    {/* ENCABEZADO */}
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
                            {/* CORRECCIÓN: Agrupamos texto en un div para que no se rompa el layout */}
                            <div style={styles.textContainer}>
                                <h3 style={styles.cardTitle}>Asistente Virtual</h3>
                                <p style={styles.cardText}>Pregunta dudas, horarios y detalles.</p>
                            </div>
                            <span style={styles.arrow}>➔</span>
                        </div>

                        {/* TARJETA 2: FOTOS */}
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

                        {/* TARJETA 3: JUEGO */}
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
        padding: '20px',
        paddingBottom: '60px', // Aumentado para que el footer no se corte en móviles
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
        marginBottom: '40px',
        marginTop: '20px',
    },
    title: {
        fontSize: '2.5rem',
        color: '#2d3748',
        fontFamily: '"Times New Roman", serif',
        margin: '0 0 10px 0',
        letterSpacing: '1px',
        lineHeight: '1.2', // Mejor espaciado si el título salta de línea
    },
    date: {
        fontSize: '1.1rem',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
    },
    divider: {
        width: '60px',
        height: '3px',
        backgroundColor: '#d6bcfa',
        margin: '20px auto',
        borderRadius: '2px',
    },
    welcome: {
        color: '#4a5568',
        fontSize: '1rem',
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center', // Alinea verticalmente al centro
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
    },
    // Estilos del icono
    iconBg: {
        width: '60px',
        height: '60px',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '15px', // Reducido un poco para dar espacio al texto
        flexShrink: 0, // Evita que el icono se aplaste
    },
    emoji: {
        fontSize: '30px',
    },
    // NUEVO CONTENEDOR PARA EL TEXTO
    textContainer: {
        flex: 1, // Ocupa todo el espacio disponible en el medio
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0, // Truco de flexbox para evitar desbordamientos de texto
        paddingRight: '10px',
    },
    cardTitle: {
        margin: '0 0 4px 0',
        fontSize: '1.1rem', // Ligeramente ajustado para móviles
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
        fontSize: '1.5rem',
        fontWeight: 'bold',
        flexShrink: 0, 
    },
    footer: {
        marginTop: '40px',
        color: '#a0aec0',
        fontSize: '0.8rem',
        textAlign: 'center',
        paddingBottom: '20px', // Margen extra de seguridad
    }
};
