// pages/quizboda.jsx - ESTILO VIDEOJUEGO RETRO

import React from 'react';
import Head from 'next/head';

// ⚠️ IMPORTANTE: PEGA AQUÍ EL ENLACE REAL DE TU GOOGLE FORM
const GOOGLE_FORM_URL = "PEGA_AQUÍ_TU_ENLACE_REAL_DE_GOOGLE_FORMS";

const QuizBodaPage = () => {

    // --- Función para manejar el clic del botón ---
    const handleClick = () => {
        // Redirige a Google Forms en una nueva pestaña
        window.open(GOOGLE_FORM_URL, '_blank');
    };

    return (
        <>
            <Head>
                <title>Manel & Carla: Misión Quiz 🕹️</title>
                {/* Fuentes de Videojuego: Press Start 2P (Título) y VT323 (Cuerpo) */}
                <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
                
                {/* 2. Estilos CSS Clásicos con Tema Retro */}
                <style jsx global>{`
                    /* Estilos aplicados al body (Fondo Oscuro tipo Arcade) */
                    body {
                        font-family: 'VT323', monospace !important; 
                        background-color: #000033; /* Azul oscuro casi negro */
                        background-image: 
                            repeating-linear-gradient(0deg, rgba(0,255,0,.05), rgba(0,255,0,.05) 1px, transparent 1px, transparent 2px), /* Simulación de líneas de CRT */
                            linear-gradient(to bottom, #000033 0%, #1a0044 100%); 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        text-align: center;
                        padding: 20px;
                        color: #00ff99; /* Texto verde neón por defecto */
                        text-shadow: 0 0 5px #00ff99;
                    }
                    body > div {
                        display: contents; 
                    }
                `}</style>
                <style jsx>{`
                    /* 3. Estilos Específicos de la Tarjeta (Componente) */
                    .quiz-card {
                        background-color: rgba(0, 0, 0, 0.85); /* Caja semitransparente oscura */
                        padding: 40px;
                        border-radius: 0; /* Bordes cuadrados */
                        box-shadow: 0 0 20px #ff00ff, 0 0 10px #00ff99; /* Luces de neón */
                        max-width: 600px;
                        width: 100%;
                        border: 3px solid #ff00ff; /* Borde magenta neón */
                        animation: none; /* Quitamos la animación 'pulse' anterior */
                    }
                    
                    h1 {
                        font-family: 'Press Start 2P', cursive; /* Fuente principal del videojuego */
                        color: #00ff99; /* Verde Neón */
                        font-size: 1.5em; /* Reducimos el tamaño para la fuente pixelada */
                        margin-bottom: 20px;
                        line-height: 1.5;
                        text-shadow: 0 0 8px #00ff99;
                    }
                    
                    .subtitle, .instructions {
                        font-family: 'VT323', monospace; /* Fuente de texto de consola */
                        font-size: 1.8em; /* Hacemos el texto de consola más grande */
                        color: #ffffff;
                        margin-bottom: 15px;
                        text-shadow: none;
                    }
                    
                    .emoji {
                        font-size: 3em;
                        margin-bottom: 20px;
                        display: block;
                        /* Aplicamos un filtro para que el emoji se integre mejor con los colores neón */
                        filter: drop-shadow(0 0 5px #ff00ff); 
                    }
                    
                    /* Estilo del Botón CTA */
                    .cta-button {
                        background-color: #ff00ff; /* Magenta Neón */
                        color: #000000; /* Texto negro para contraste */
                        padding: 10px 30px;
                        text-decoration: none;
                        border-radius: 4px; /* Bordes ligeros */
                        font-size: 1.3em;
                        font-weight: 700;
                        transition: all 0.1s linear;
                        box-shadow: 0 5px 0 0 #00ff99; /* Sombra sólida para efecto botón presionado */
                        border: 2px solid #00ff99;
                        cursor: pointer;
                        font-family: 'Press Start 2P', cursive;
                    }

                    .cta-button:hover {
                        background-color: #00ff99; /* Invertir colores al pasar el ratón */
                        color: #000000;
                        box-shadow: 0 5px 0 0 #ff00ff;
                        transform: translateY(-1px); 
                    }

                    .cta-button:active {
                        box-shadow: 0 2px 0 0 #00ff99; /* Simular que el botón se presiona */
                        transform: translateY(3px); 
                    }
                `}</style>
            </Head>

            <div className="quiz-card">
                <span className="emoji">👾💖</span>
                
                <h1>MANEL & CARLA: MISIÓN QUIZ INICIADA</h1>
                <p className="subtitle">Cargando Nivel 1...</p>
                
                <p className="instructions">¡Inserte 1 Crédito para Jugar! Si logra la Puntuación Perfecta, se desbloqueará un Nivel de Premio Especial (PREMIO) a su nombre. ¡LISTO/A JUGADOR/A UNO!</p>
                
                <button 
                    className="cta-button"
                    onClick={handleClick}
                >
                    START GAME
                </button>
            </div>
        </>
    );
};

export default QuizBodaPage;
