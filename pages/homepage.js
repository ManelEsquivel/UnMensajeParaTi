import React, { useEffect, useState } from 'react'; 
import Head from 'next/head'; 
import { useRouter } from 'next/router';

export default function Homepage() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Activar la animación de entrada al montar
        setIsVisible(true);
    }, []);

    const navigateTo = (path) => {
        router.push(path);
    };

    return (
        <div style={styles.container}>
            <Head>
                <title>Boda Manel & Carla</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div style={{...styles.content, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)'}}>
                
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
                        <h3 style={styles.cardTitle}>Asistente Virtual</h3>
                        <p style={styles.cardText}>Pregunta dudas, horarios y detalles.</p>
                        <span style={styles.arrow}>➔</span>
                    </div>

                    {/* TARJETA 2: FOTOS */}
                    <div style={styles.card} onClick={() => navigateTo('/imagenes_boda')}>
                        <div style={{...styles.iconBg, background: '#fce4ec'}}>
                            <span style={styles.emoji}>📸</span>
                        </div>
                        <h3 style={styles.cardTitle}>Álbum de Fotos</h3>
                        <p style={styles.cardText}>Sube tus recuerdos y mira la galería.</p>
                        <span style={styles.arrow}>➔</span>
                    </div>

                    {/* TARJETA 3: JUEGO */}
                    <div style={styles.card} onClick={() => navigateTo('/game')}>
                        <div style={{...styles.iconBg, background: '#fff3e0'}}>
                            <span style={styles.emoji}>🎮</span>
                        </div>
                        <h3 style={styles.cardTitle}>El Quiz</h3>
                        <p style={styles.cardText}>¿Cuánto sabes sobre nosotros?</p>
                        <span style={styles.arrow}>➔</span>
                    </div>

                </div>

                <footer style={styles.footer}>
                    <p>Hecho con ❤️ para vosotros</p>
                </footer>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', // Fondo sutil
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
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
        fontFamily: '"Times New Roman", serif', // Toque elegante para los nombres
        margin: '0 0 10px 0',
        letterSpacing: '1px',
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
        backgroundColor: '#d6bcfa', // Un toque de color lila/dorado
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
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
    },
    // Efecto hover simulado con estilos en línea (en CSS real usaríamos :hover)
    cardHover: {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
    },
    iconBg: {
        width: '60px',
        height: '60px',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '20px',
        flexShrink: 0,
    },
    emoji: {
        fontSize: '30px',
    },
    cardTitle: {
        margin: '0 0 5px 0',
        fontSize: '1.2rem',
        color: '#2d3748',
    },
    cardText: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#718096',
    },
    arrow: {
        marginLeft: 'auto', // Empuja la flecha a la derecha
        color: '#cbd5e0',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: '50px',
        color: '#a0aec0',
        fontSize: '0.8rem',
        textAlign: 'center',
    }
};
