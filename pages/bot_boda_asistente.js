// pages/quizboda.js (Versión con FIX de Estilos Globales)

import React from 'react';
import Head from 'next/head';

// ⚠️ IMPORTANTE: PEGA AQUÍ EL ENLACE REAL DE TU GOOGLE FORM
const GOOGLE_FORM_URL = "PEGA_AQUÍ_TU_ENLACE_REAL_DE_GOOGLE_FORMS";

const QuizBodaPage = () => {

    // --- FIX: Aplicar Estilos del BODY al montar el componente ---
    React.useEffect(() => {
        // Estilos del Body (Fondo, Fuente, Color Neón, Sombra de texto)
        document.body.style.fontFamily = "'VT323', monospace";
        document.body.style.backgroundColor = "#000033"; 
        document.body.style.backgroundImage = `
            repeating-linear-gradient(0deg, rgba(0,255,0,.05), rgba(0,255,0,.05) 1px, transparent 1px, transparent 2px),
            linear-gradient(to bottom, #000033 0%, #1a0044 100%)
        `;
        document.body.style.color = "#00ff99";
        document.body.style.textShadow = "0 0 5px #00ff99";
        document.body.style.display = "flex";
        document.body.style.justifyContent = "center";
        document.body.style.alignItems = "center";
        document.body.style.minHeight = "100vh";
        document.body.style.margin = "0";
        document.body.style.textAlign = "center";
        document.body.style.padding = "20px";
    }, []); 
    // -------------------------------------------------------------

    // --- Función para manejar el clic del botón ---
    const handleClick = () => {
        // Redirige a Google Forms en una nueva pestaña
        window.open(GOOGLE_FORM_URL, '_blank');
    };

    return (
        <>
            <Head>
                <title>Manel & Carla: Misión Quiz Iniciada 🕹️</title>
                {/* Cargamos las fuentes de Videojuego */}
                <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
            </Head>
            
            <style jsx>{`
                /* Estilos Específicos de la Tarjeta (No necesitan el FIX) */
                .quiz-card {
                    background-color: rgba(0, 0, 0, 0.85);
                    padding: 40px;
                    border-radius: 0;
                    box-shadow: 0 0 20px #ff00ff, 0 0 10px #00ff99;
                    max-width: 600px;
                    width: 100%;
                    border: 3px solid #ff00ff;
                }
                
                h1 {
                    font-family: 'Press Start 2P', cursive;
                    color: #00ff99;
                    font-size: 1.5em;
                    margin-bottom: 20px;
                    line-height: 1.5;
                    text-shadow: 0 0 8px #00ff99;
                }
                
                .subtitle, .instructions {
                    font-family: 'VT323', monospace;
                    font-size: 1.8em;
                    color: #ffffff;
                    margin-bottom: 15px;
                    text-shadow: none;
                }
                
                .emoji {
                    font-size: 3em;
                    margin-bottom: 20px;
                    display: block;
                    filter: drop-shadow(0 0 5px #ff00ff);
                }
                
                /* Estilo del Botón CTA */
                .cta-button {
                    background-color: #ff00ff;
                    color: #000000;
                    padding: 10px 30px;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 1.3em;
                    font-weight: 700;
                    transition: all 0.1s linear;
                    box-shadow: 0 5px 0 0 #00ff99;
                    border: 2px solid #00ff99;
                    cursor: pointer;
                    font-family: 'Press Start 2P', cursive;
                }

                .cta-button:hover {
                    background-color: #00ff99;
                    color: #000000;
                    box-shadow: 0 5px 0 0 #ff00ff;
                    transform: translateY(-1px); 
                }

                .cta-button:active {
                    box-shadow: 0 2px 0 0 #00ff99;
                    transform: translateY(3px); 
                }
            `}</style>

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
