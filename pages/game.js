import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// *******************************************************************
// ⚠️ TUS IDENTIFICADORES REALES (ACTUALIZADOS) ⚠️
// *******************************************************************
const BASE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfd6X0a5VGjQW_y7e3IYqTh64HLrh1yA6CWJEGJZu4HxENr3Q/formResponse";

const ENTRY_NAME = "entry.1745994476"; 
const ENTRY_Q1 = "entry.1000057";      
const ENTRY_Q2 = "entry.1509074265";   
const ENTRY_Q3 = "entry.551001831";    
const ENTRY_Q4 = "entry.1989972928";   
const ENTRY_Q5 = "entry.694289165";
// --- NUEVOS CAMPOS AÑADIDOS ---
const ENTRY_Q6 = "entry.1714762635"; // Respuesta en tu enlace: Esplugues
const ENTRY_Q7 = "entry.2146638638"; // Respuesta en tu enlace: Nueva York
const ENTRY_Q8 = "entry.691847615";  // Respuesta en tu enlace: Tossa de Mar
const ENTRY_Q9 = "entry.1700364237"; // Respuesta en tu enlace: ABaC

const QUIZ_COMPLETED_KEY = 'manel_carla_quiz_completed'; 

// --- ESTRUCTURA DE PREGUNTAS ---
// ⚠️ IMPORTANTE: He añadido las preguntas nuevas abajo. 
// Debes editar el 'label' y las 'options' de la 6 a la 9.
const ALL_QUESTIONS = [
    { id: 'q1', entry: ENTRY_Q1, label: '1. ¿De quién fue la idea de tener animales en casa?', options: ['Manel', 'Carla'] },
    { id: 'q2', entry: ENTRY_Q2, label: '2. ¿Cómo se llaman los michis de Manel y Carla?', options: ['Wasabi y Abby', 'Sky y Wasabi', 'Mia y Sombra', 'Mochi y Abby'] },
    { id: 'q3', entry: ENTRY_Q3, label: '3. ¿En qué Provincia/Ciudad se comprometieron?', options: ['Roma/Fontana di trevi', 'París/ Torre eiffel', 'Girona /Cadaques', 'Menorca /Cala turqueta'] },
    { id: 'q4', entry: ENTRY_Q4, label: '4. ¿Dónde fue el primer bautizo de buceo de Carla?', options: ['Tossa de Mar', 'Cadaques', 'Illes Medes', 'Palamos'] },
    { id: 'q5', entry: ENTRY_Q5, label: '5. Número de tatuajes Entre Carla y Manel', options: ['6', '7', '8', '10'] },
    // --- NUEVAS PREGUNTAS (EDITAR TEXTOS) ---
    { id: 'q6', entry: ENTRY_Q6, label: '6. ¿En que equipo de baloncesto jugó Carla?', options: ['Esplugues', 'Hospitalet', 'Sant Just', 'Cornellà'] },
    { id: 'q7', entry: ENTRY_Q7, label: '7. ¿Cuál es el destino de viaje que más han repetido?', options: ['Roma', 'Nueva York', 'París', 'Menorca'] },
    { id: 'q8', entry: ENTRY_Q8, label: '8. ¿Cuál es el lugar de la Costa Brava que mas han visitado para veranear?', options: ['Tossa de Mar', 'Cadaqués', "S'Agaró", "Platja d'Aro"] },
    { id: 'q9', entry: ENTRY_Q9, label: '9. ¿En qué restaurante cenaron el mismo día de la pedida de mano?', options: ['ABaC', 'Viena', 'Celler de Can Roca', 'Sushi Buffet'] },
];

const entryMap = {
    guestName: ENTRY_NAME,
    // Mapeamos dinámicamente las preguntas
    ...ALL_QUESTIONS.reduce((acc, q) => ({...acc, [q.id]: q.entry}), {})
};

// *******************************************************************

const QuizBodaPage = () => {
    // Definimos pasos clave basados en la cantidad de preguntas
    const TOTAL_QUESTIONS = ALL_QUESTIONS.length;
    const STEP_WELCOME = 0;
    const STEP_NAME = 1;
    const STEP_FIRST_QUESTION = 2;
    // El último paso de pregunta es: STEP_FIRST_QUESTION + TOTAL_QUESTIONS - 1
    const STEP_SUBMIT = STEP_FIRST_QUESTION + TOTAL_QUESTIONS; 
    const STEP_SUCCESS = STEP_SUBMIT + 1;

    const [currentStep, setCurrentStep] = useState(0); 
    
    // Estado inicial dinámico para todas las preguntas
    const initialAnswers = { guestName: '' };
    ALL_QUESTIONS.forEach(q => initialAnswers[q.id] = '');
    
    const [answers, setAnswers] = useState(initialAnswers);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false); 

    const currentQuestionIndex = currentStep - STEP_FIRST_QUESTION; 
    const currentQuestion = ALL_QUESTIONS[currentQuestionIndex];

    useEffect(() => {
        // --- SOLUCIÓN DEFINITIVA PARA EL FONDO ---
        document.documentElement.removeAttribute('style');
        document.body.removeAttribute('style');

        const purpleColor = '#23074d';
        document.documentElement.style.setProperty('background-color', purpleColor, 'important');
        document.body.style.setProperty('background-color', purpleColor, 'important');
        document.body.style.setProperty('background-image', 'linear-gradient(135deg, #23074d, #440a5b)', 'important');
        document.body.style.setProperty('min-height', '100vh', 'important');
        // -----------------------------------------

        if (typeof window !== 'undefined' && localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true') {
            setIsCompleted(true);
            setCurrentStep(STEP_SUCCESS); 
            const storedName = localStorage.getItem('manel_carla_quiz_name') || '';
            setAnswers(prev => ({ ...prev, guestName: storedName }));
        }
    }, []);

    const handleAnswerSelect = (value, questionId) => {
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);
        
        // Si estamos en la última pregunta, enviamos
        if (currentQuestionIndex === TOTAL_QUESTIONS - 1) {
            handleSubmit(newAnswers); 
        } else {
            setCurrentStep(prev => prev + 1); 
        }
    };
    
    const handleNameChange = (e) => {
        const name = e.target.value;
        setAnswers(prev => ({ ...prev, guestName: name }));
        localStorage.setItem('manel_carla_quiz_name', name);
    };

    const handleSubmit = (finalAnswers) => { 
        setIsSubmitting(true);
        setCurrentStep(STEP_SUBMIT); 
        
        let submissionUrl = `${BASE_FORM_URL}?`;
        submissionUrl += `&${entryMap.guestName}=${encodeURIComponent(finalAnswers.guestName)}`; 
        
        // Añadimos dinámicamente todas las respuestas de las preguntas al URL
        ALL_QUESTIONS.forEach(q => {
             submissionUrl += `&${q.entry}=${encodeURIComponent(finalAnswers[q.id])}`;
        });

        submissionUrl += `&submit=Submit`; 
        submissionUrl = submissionUrl.replace('?&', '?'); // Limpieza
        
        window.open(submissionUrl, '_blank');

        localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
        setIsCompleted(true);
        
        setTimeout(() => { 
             setIsSubmitting(false);
             setCurrentStep(STEP_SUCCESS); 
        }, 2000); 
    };

    const renderStep = () => {
        if (isCompleted || currentStep === STEP_SUCCESS) {
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

        // Lógica de renderizado por pasos
        if (currentStep === STEP_WELCOME) {
            return (
                <div className="step-content welcome-screen">
                    <h1>💍 ¡Bienvenido/a al Gran Quiz de Manel y Carla!</h1>
                    <p>Pon a prueba cuánto sabes sobre nosotros. Entre todas las personas que participen, <strong>quienes consigan el mayor número de aciertos recibirán un regalo exclusivo el día de la boda</strong>.</p>
                    <p>¡Demuestra tu conocimiento y mucha suerte! 🎁✨</p>
                    <button className="button" onClick={() => setCurrentStep(STEP_NAME)} disabled={isSubmitting}>
                        ¡EMPEZAR A JUGAR!
                    </button>
                </div>
            );
        }

        if (currentStep === STEP_NAME) {
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
                    <button className="button next-button" onClick={() => setCurrentStep(STEP_FIRST_QUESTION)} disabled={answers.guestName.trim().length < 3 || isSubmitting}>
                        SIGUIENTE PREGUNTA »
                    </button>
                </div>
            );
        }

        // Rango de pasos donde se muestran preguntas
        if (currentStep >= STEP_FIRST_QUESTION && currentStep < STEP_SUBMIT) {
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
        }

        if (currentStep === STEP_SUBMIT) {
            return (
                <div className="step-content submit-screen">
                    <h2>¡Enviando tus Respuestas!</h2>
                    <div className="spinner"></div>
                    <p>No cierres la página, estamos registrando tu participación...</p>
                </div>
            );
        }
        
        return null;
    };

    // Cálculo del progreso
    const progressPercentage = currentStep >= STEP_NAME 
        ? Math.min(((currentStep) / (TOTAL_QUESTIONS + 1)) * 100, 100) 
        : 0;

    return (
        <>
            <Head>
                <title>El Gran Quiz de Manel y Carla 💍</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                <meta name="theme-color" content="#23074d" />
            </Head>

            <div className="container">
                <div className="card">
                    {renderStep()}
                    {/* Barra de progreso: visible desde el nombre hasta la última pregunta */}
                    {(currentStep >= STEP_NAME && currentStep < STEP_SUBMIT) && (
                        <div className="progress-bar-container">
                             <div className="progress-bar" style={{ width: `${progressPercentage}%` }} ></div>
                            <p className="progress-text">Paso {currentStep} de {TOTAL_QUESTIONS + 1}</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lato:wght@400;700&display=swap');

                html, body, #__next {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    min-height: 100vh;
                    background-color: #23074d !important;
                    background: linear-gradient(135deg, #23074d, #440a5b) !important;
                    color: #fff;
                    font-family: 'Lato', sans-serif;
                    overflow-x: hidden;
                }

                .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .card {
                    background: #1f2937;
                    color: #fff;
                    padding: 2rem;
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
                    width: 100%; 
                    max-width: 300px;
                }

                @keyframes pulse-gold { 0% { transform: scale(1);} 50% { transform: scale(1.05);} 100% { transform: scale(1);} }
                .button:active { transform: scale(0.95); }

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

                .next-button {
                    background: #f3f4f6; 
                    color: #1f2937; 
                    border: none;
                    box-shadow: none;
                    animation: none;
                    font-family: 'Lato', sans-serif;
                }

                .options-grid { 
                    display: grid; 
                    grid-template-columns: 1fr; 
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

                .spinner { border:4px solid #f3f3f3; border-top:4px solid #ffcc00; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin:20px auto; }
                @keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }

                .progress-bar-container { margin-top: 20px; width: 100%; background: #374151; height: 8px; border-radius: 4px; position: relative; }
                .progress-bar { height: 100%; background: #d4af37; border-radius: 4px; transition: width 0.3s ease; }
                .progress-text { font-size: 0.8rem; color: #9ca3af; margin-top: 5px; }

            `}</style>
        </>
    );
};

export default QuizBodaPage;
