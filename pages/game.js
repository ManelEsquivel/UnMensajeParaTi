import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// *******************************************************************
// ⚠️ TUS IDENTIFICADORES REALES (NO CAMBIAN) ⚠️
// *******************************************************************
const BASE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfd6X0a5VGjQW_y7e3IYqTh64HLrh1yA6CWJEGJZu4HxENr3Q/formResponse";

const ENTRY_NAME = "entry.1745994476"; 
const ENTRY_Q1 = "entry.1000057";      
const ENTRY_Q2 = "entry.1509074265";   
const ENTRY_Q3 = "entry.551001831";    
const ENTRY_Q4 = "entry.1989972928";   
const ENTRY_Q5 = "entry.694289165";    

const QUIZ_COMPLETED_KEY = 'manel_carla_quiz_completed'; 

// --- ESTRUCTURA DE PREGUNTAS ---
const ALL_QUESTIONS = [
    { id: 'q1', entry: ENTRY_Q1, label: '1. ¿De quién fue la idea de tener animales en casa?', options: ['Manel', 'Carla'] },
    { id: 'q2', entry: ENTRY_Q2, label: '2. ¿Cómo se llaman los michis de Manel y Carla?', options: ['Wasabi y Abby', 'Sky y Wasabi', 'Mia y Sombra', 'Mochi y Abby'] },
    { id: 'q3', entry: ENTRY_Q3, label: '3. ¿En qué Provincia/Ciudad se comprometieron?', options: ['Roma/Fontana di trevi', 'París/ Torre eiffel', 'Girona /Cadaques', 'Menorca /Cala turqueta'] },
    { id: 'q4', entry: ENTRY_Q4, label: '4. ¿Dónde fue el primer bautizo de buceo de Carla?', options: ['Tossa de Mar', 'Cadaques', 'Illes Medes', 'Palamos'] },
    { id: 'q5', entry: ENTRY_Q5, label: '5. Número de tatuajes Entre Carla y Manel', options: ['6', '7', '8', '10'] },
];

// Mapeo de IDs
const entryMap = {
    guestName: ENTRY_NAME,
    q1: ENTRY_Q1,
    q2: ENTRY_Q2,
    q3: ENTRY_Q3,
    q4: ENTRY_Q4,
    q5: ENTRY_Q5,
};

// *******************************************************************


const QuizBodaPage = () => {
    // currentStep: 0 (Bienvenida), 1 (Nombre), 2-6 (Preguntas), 7 (Enviando), 8 (Finalizado)
    const [currentStep, setCurrentStep] = useState(0); 
    const [answers, setAnswers] = useState({
        guestName: '', 
        q1: '', q2: '', q3: '', q4: '', q5: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false); 

    const currentQuestionIndex = currentStep - 2; 
    const currentQuestion = ALL_QUESTIONS[currentQuestionIndex];

    useEffect(() => {
        // LIMPIEZA DE ESTILOS ANTERIORES (Homepage/Bot)
        document.documentElement.removeAttribute('style');
        document.body.removeAttribute('style');

        if (typeof window !== 'undefined' && localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true') {
            setIsCompleted(true);
            setCurrentStep(8); 
            const storedName = localStorage.getItem('manel_carla_quiz_name') || '';
            setAnswers(prev => ({ ...prev, guestName: storedName }));
        }
    }, []);

    // Maneja la selección de respuesta
    const handleAnswerSelect = (value, questionId) => {
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex === 4) {
            handleSubmit(newAnswers); 
        } else {
            setCurrentStep(prev => prev + 1); 
        }
    };
    
    // Maneja el input de nombre
    const handleNameChange = (e) => {
        const name = e.target.value;
        setAnswers(prev => ({ ...prev, guestName: name }));
        localStorage.setItem('manel_carla_quiz_name', name);
    };


    // --- Lógica de Envío ---
    const handleSubmit = (finalAnswers) => { 
        setIsSubmitting(true);
        setCurrentStep(7); 
        
        let submissionUrl = `${BASE_FORM_URL}?`;
        submissionUrl += `&${entryMap.guestName}=${encodeURIComponent(finalAnswers.guestName)}`; 
        submissionUrl += `&${entryMap.q1}=${encodeURIComponent(finalAnswers.q1)}`;
        submissionUrl += `&${entryMap.q2}=${encodeURIComponent(finalAnswers.q2)}`;
        submissionUrl += `&${entryMap.q3}=${encodeURIComponent(finalAnswers.q3)}`;
        submissionUrl += `&${entryMap.q4}=${encodeURIComponent(finalAnswers.q4)}`;
        submissionUrl += `&${entryMap.q5}=${encodeURIComponent(finalAnswers.q5)}`;
        submissionUrl += `&submit=Submit`; 

        submissionUrl = submissionUrl.replace('?&', '?');

        window.open(submissionUrl, '_blank');

        localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
        setIsCompleted(true);
        
        setTimeout(() => { 
             setIsSubmitting(false);
             setCurrentStep(8); 
        }, 2000); 
    };
    
    
    // --- Renderizado de Vistas ---

    const renderStep = () => {
        // PANTALLA FINAL
        if (isCompleted || currentStep === 8) {
             return (
                 <div className="step-content success-screen">
                    <h2>¡Respuestas Enviadas con Éxito! 🎉</h2>
                    <p>¡Vuestro conocimiento sobre los novios ha sido registrado, <strong>{answers.guestName || 'invitado/a'}</strong>!</p>
                    <p>Vuestras respuestas han sido validadas. Si habéis acertado las preguntas o sois de las personas con mayor acierto, <strong>¡tendréis un Detalle Especial!</strong></p>
                    <p>¡Gracias por jugar y nos vemos muy pronto en la boda!</p>
                    <p style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '1.2rem', color: '#f0e1c9' }}>Con cariño, Manel y Carla.</p>
                </div>
             );
        }

        switch (currentStep) {
            
            // STEP 0: BIENVENIDA
            case 0:
                return (
                    <div className="step-content welcome-screen">
                        <h1>💍 ¡Bienvenido/a al Gran Quiz de Manel y Carla!</h1>
                        <p>Pon a prueba cuánto sabes sobre nosotros. Entre todas las personas que participen, <strong>quienes consigan el mayor número de aciertos recibirán un regalo exclusivo el día de la boda</strong>.</p>
                        <p>¡Demuestra tu conocimiento y mucha suerte! 🎁✨</p>
                        <button 
                            className="button" 
                            onClick={() => setCurrentStep(1)}
                            disabled={isSubmitting}
                        >
                            ¡EMPEZAR A JUGAR!
                        </button>
                    </div>
                );
            
            // STEP 1: NOMBRE
            case 1:
                 return (
                    <div className="step-content name-screen">
                        <h2>Tu Identificación</h2>
                        <label htmlFor="guestName">Nombre y Apellido (Necesario para identificarte si ganas 🎉)</label>
                        <br></br>
                        <input
                            type="text"
                            id="guestName"
                            name="guestName"
                            value={answers.guestName}
                            onChange={handleNameChange}
                            required
                            placeholder="Escribe aquí..."
                        />
                        <button 
                            className="button next-button" 
                            onClick={() => setCurrentStep(2)}
                            disabled={answers.guestName.trim().length < 3 || isSubmitting}
                        >
                            SIGUIENTE PREGUNTA »
                        </button>
                    </div>
                );

            // STEPS 2-6: PREGUNTAS
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                return (
                    <div className="step-content question-screen">
                        <h2>{currentQuestion.label}</h2>
                        <div className="options-grid">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    className="option-button" 
                                    onClick={() => handleAnswerSelect(option, currentQuestion.id)}
                                    disabled={isSubmitting}
                                >
                                    <span className="option-text">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            
            // STEP 7: SPINNER
            case 7:
                return (
                    <div className="step-content submit-screen">
                        <h2>¡Enviando tus Respuestas!</h2>
                        <div className="spinner"></div>
                        <p>No cierres la página, estamos registrando tu participación...</p>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <>
            <Head>
                <title>El Gran Quiz de Manel y Carla 💍</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                {/* CAMBIO IMPORTANTE: Color de la barra del navegador MORADO OSCURO */}
                <meta name="theme-color" content="#23074d" />
            </Head>

            <div className="container">
                <div className="card">
                    {renderStep()}
                    
                    {(currentStep >= 1 && currentStep <= 6) && (
                        <div className="progress-bar-container">
                             <div 
                                className="progress-bar" 
                                style={{ width: `${(currentStep / 6) * 100}%` }} 
                            ></div>
                            <p className="progress-text">Paso {currentStep} de 6</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- ESTILOS GLOBALES UNIFICADOS --- */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lato:wght@400;700&display=swap');

                /* RESET TOTAL PARA EVITAR FONDO BLANCO */
                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #23074d, #440a5b) !important; /* Fondo forzado */
                    color: #fff;
                    font-family: 'Lato', sans-serif;
                    overflow-x: hidden;
                }

                /* CONTENEDOR PRINCIPAL */
                .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 20px;
                    box-sizing: border-box;
                }

                /* TARJETA DEL JUEGO */
                .card {
                    background: #1f2937;
                    color: #fff;
                    padding: 2rem; /* Reducido un poco para móviles */
                    border-radius: 16px;
                    border: 2px solid #a88a53;
                    box-shadow: 0 0 25px rgba(168,138,83,0.3);
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                    animation: fadeIn 0.8s ease-in-out;
                    position: relative;
                    z-index: 10;
                }

                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }

                h1, h2 { 
                    font-family: 'Cinzel', serif; 
                    color: #f0e1c9; 
                    text-shadow: 0 0 10px rgba(240,225,201,0.3); 
                    margin-top: 0;
                }
                
                p { line-height: 1.6; }

                /* BOTÓN PRINCIPAL (EMPEZAR) */
                .button {
                    display: inline-block;
                    padding: 1rem 2rem;
                    margin-top: 20px;
                    background: linear-gradient(145deg, #d4af37, #b8860b);
                    color: #1f2937;
                    border: none;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 1.2rem;
                    cursor: pointer;
                    box-shadow: 0 4px 0 #8c690a;
                    text-transform: uppercase;
                    font-family: 'Cinzel', serif;
                    animation: pulse-gold 1.5s infinite;
                    width: 100%; /* Ancho completo en móvil */
                    max-width: 300px;
                }

                @keyframes pulse-gold { 0% { transform: scale(1);} 50% { transform: scale(1.05);} 100% { transform: scale(1);} }
                .button:active { transform: scale(0.95); }

                /* INPUT TEXTO */
                input[type="text"] {
                    width: 100%;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #a88a53;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 1.1rem;
                    margin: 15px 0;
                    box-sizing: border-box;
                }

                /* BOTÓN SIGUIENTE (PASO 1) */
                .next-button {
                    background: #f3f4f6; 
                    color: #1f2937; 
                    border: none;
                    box-shadow: none;
                    animation: none;
                    font-family: 'Lato', sans-serif;
                }

                /* BOTONES DE RESPUESTA (OPCIONES) */
                .options-grid { 
                    display: grid; 
                    grid-template-columns: 1fr; /* Una columna en móvil por defecto */
                    gap: 15px; 
                    margin-top: 20px;
                }
                @media (min-width: 500px) {
                    .options-grid { grid-template-columns: 1fr 1fr; }
                }

                .option-button { 
                    min-height: 70px; 
                    padding: 1rem; 
                    background: #374151; 
                    color: #f0e1c9; 
                    border: 1px solid rgba(168, 138, 83, 0.3);
                    border-radius: 12px; 
                    font-size: 1rem; 
                    font-weight: 700; 
                    cursor: pointer;
                    transition: all 0.2s ease; 
                    position: relative; 
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .option-button:active { transform: scale(0.98); background: #4b5563; }

                /* SPINNER */
                .spinner { border:4px solid #f3f3f3; border-top:4px solid #ffcc00; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin:20px auto; }
                @keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }

                /* BARRA PROGRESO */
                .progress-bar-container { margin-top: 20px; width: 100%; background: #374151; height: 8px; border-radius: 4px; position: relative; }
                .progress-bar { height: 100%; background: #d4af37; border-radius: 4px; transition: width 0.3s ease; }
                .progress-text { font-size: 0.8rem; color: #9ca3af; margin-top: 5px; }

            `}</style>
        </>
    );
};

export default QuizBodaPage;
