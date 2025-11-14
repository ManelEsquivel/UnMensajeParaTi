// pages/quizboda.js - Estilo Original del HTML

import React from 'react';
import Head from 'next/head';

// ⚠️ IMPORTANTE: PEGA AQUÍ EL ENLACE REAL DE TU GOOGLE FORM
const GOOGLE_FORM_URL = "URL_DE_GOOGLE_FORM"; // Reemplaza esta línea con tu URL real

const QuizBodaPage = () => {

    return (
        <>
            <Head>
                <title>¡El Gran Quiz de Manel y Carla! 💍</title>
                {/* Carga de Fuentes */}
                <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@400;700&display=swap" rel="stylesheet" />
                
                {/* Estilos Globales: Fondo y Centrado */}
                <style jsx global>{`
                    body {
                        font-family: 'Poppins', sans-serif !important;
                        background-color: #fce4ec; /* Fondo Rosa muy claro */
                        background-image: linear-gradient(135deg, #fce4ec 0%, #fff3e0 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        text-align: center;
                        padding: 20px;
                    }
                    body > div {
                        display: contents; /* Necesario para el centrado */
                    }
                `}</style>
                
                {/* Estilos de la Tarjeta (Extraídos del CSS de tu HTML) */}
                <style jsx>{`
                    .quiz-card {
                        background-color: #ffffff;
                        padding: 45px 30px;
                        border-radius: 20px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                        max-width: 550px;
                        width: 100%;
                        border: 5px solid #ff69b4;
                        animation: pulse 2s infinite;
                    }

                    h1 {
                        font-family: 'Pacifico', cursive;
                        color: #d1495b; 
                        font-size: 2.8em;
                        margin-bottom: 5px;
                        line-height: 1.1;
                    }

                    .subtitle {
                        font-size: 1.2em;
                        color: #4a4a4a;
                        margin-bottom: 30px;
                        font-weight: 700;
                    }

                    .emoji {
                        font-size: 3em;
                        margin-bottom: 20px;
                        display: block;
                    }
                    
                    .instructions {
                        color: #6a6a6a;
                        margin-bottom: 40px;
                        font-size: 1.1em;
                    }

                    /* Estilo del Botón CTA */
                    .cta-button {
                        display: inline-block;
                        background-color: #ff69b4;
                        color: white;
                        padding: 15px 35px;
                        text-decoration: none;
                        border-radius: 50px;
                        font-size: 1.3em;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 10px rgba(255, 105, 180, 0.4);
                        border: 2px solid #e91e63;
                    }

                    .cta-button:hover {
                        background-color: #e91e63;
                        transform: scale(1.05) translateY(-2px);
                    }
                    
                    @keyframes pulse {
                        0% { border-color: #ff69b4; }
                        50% { border-color: #e91e63; }
                        100% { border-color: #ff69b4; }
                    }
                `}</style>
            </Head>

            {/* Estructura HTML convertida a JSX */}
            <div className="quiz-card">
                {/* Los atributos class se cambian a className en JSX */}
                <span className="emoji">💖✨</span>
                
                <h1>¡Bienvenido/a al QUIZ de Manel y Carla!</h1>
                <p className="subtitle">Pon a prueba cuánto sabes de nuestra historia.</p>
                
                <p className="instructions">¡Solo 3 preguntas! Si aciertas, entrarás en el sorteo de un detalle especial de nuestra parte. ¡Mucha suerte!</p>
                
                {/* El botón ahora es un enlace <a/> normal que usa la URL definida */}
                <a 
                    href={GOOGLE_FORM_URL} 
                    target="_blank" 
                    className="cta-button"
                    rel="noopener noreferrer" /* Buena práctica para enlaces externos con target="_blank" */
                >
                    EMPIEZA TU TEST
                </a>
            </div>
        </>
    );
};

export default QuizBodaPage;
