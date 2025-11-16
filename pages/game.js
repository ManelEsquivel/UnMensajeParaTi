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

// Mapeo de IDs (Incluyendo el nombre)
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
        if (typeof window !== 'undefined' && localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true') {
            setIsCompleted(true);
            setCurrentStep(8); 
            const storedName = localStorage.getItem('manel_carla_quiz_name') || '';
            setAnswers(prev => ({ ...prev, guestName: storedName }));
        }
    }, []);

    // Maneja la selección de respuesta para las preguntas (Steps 2-6)
    const handleAnswerSelect = (value, questionId) => {
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);

        // Si es la última pregunta (índice 4), vamos a la pantalla de envío
        if (currentQuestionIndex === 4) {
            handleSubmit(newAnswers); // Enviar inmediatamente
        } else {
            setCurrentStep(prev => prev + 1); // Siguiente pregunta
        }
    };
    
    // Maneja el input de texto (Name) (Step 1)
    const handleNameChange = (e) => {
        const name = e.target.value;
        setAnswers(prev => ({ ...prev, guestName: name }));
        localStorage.setItem('manel_carla_quiz_name', name);
    };


    // --- Lógica de Envío (Método GET / window.open) ---
    const handleSubmit = (finalAnswers) => { 
        setIsSubmitting(true);
        setCurrentStep(7); // Muestra la pantalla "Enviando"
        
        // 1. Construir la URL de Envío (GET Request)
        let submissionUrl = `${BASE_FORM_URL}?`;
        submissionUrl += `&${entryMap.guestName}=${encodeURIComponent(finalAnswers.guestName)}`; 
        submissionUrl += `&${entryMap.q1}=${encodeURIComponent(finalAnswers.q1)}`;
        submissionUrl += `&${entryMap.q2}=${encodeURIComponent(finalAnswers.q2)}`;
        submissionUrl += `&${entryMap.q3}=${encodeURIComponent(finalAnswers.q3)}`;
        submissionUrl += `&${entryMap.q4}=${encodeURIComponent(finalAnswers.q4)}`;
        submissionUrl += `&${entryMap.q5}=${encodeURIComponent(finalAnswers.q5)}`;
        submissionUrl += `&submit=Submit`; 

        submissionUrl = submissionUrl.replace('?&', '?');

        // 2. Abrir la URL en una nueva pestaña (El método que funcionó)
        window.open(submissionUrl, '_blank');

        // 3. Transición local garantizada
        localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
        setIsCompleted(true);
        
        // Esperar 2 segundos y forzar la transición a la pantalla final
        setTimeout(() => { 
             setIsSubmitting(false);
             setCurrentStep(8); // Muestra el mensaje final
        }, 2000); 
    };
    
    
    // --- Renderizado de Vistas ---

    const renderStep = () => {
        // Pantalla de bloqueo/éxito (STEP 8)
        if (isCompleted || currentStep === 8) {
             return (
                 <div className="step-content success-screen">
                    {/* Mensaje de éxito personalizado */}
                    <h2>¡Respuestas Enviadas con Éxito! 🎉</h2>
                    <p>¡Vuestro conocimiento sobre Manel y Carla ha sido registrado, **{answers.guestName || 'invitado/a'}**!</p>
                    <p>Vuestras respuestas han sido validadas. Si habéis acertado las preguntas o sois de las personas con mayor acierto, **¡tendréis un Detalle Especial!**</p>
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
                        <p>Pon a prueba cuánto sabes de nuestra historia. Si aciertas, entrarás en el sorteo de un detalle especial de nuestra parte.</p>
                        <button 
                            className="button" 
                            onClick={() => setCurrentStep(1)}
                            disabled={isSubmitting}
                        >
                            ¡EMPEZAR A JUGAR!
                        </button>
                    </div>
                );
            
            // STEP 1: NOMBRE Y APELLIDO 
            case 1:
                 return (
                    <div className="step-content name-screen">
                        <h2>Tu Identificación</h2>
                        <label htmlFor="guestName">Nombre y Apellido (Necesario para el sorteo)</label>
                        <input
                            type="text"
                            id="guestName"
                            name="guestName"
                            value={answers.guestName}
                            onChange={handleNameChange}
                            required
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
            
            // STEP 7: ENVIANDO RESPUESTAS
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
                <meta name="description" content="Pon a prueba cuánto sabes de nuestra historia" />
            </Head>

            <div className="container">
                <div className="card">
                    {renderStep()}
                    
                    {/* Indicador de progreso (Steps 1-6) */}
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

            {/* --- 🎯 ESTILOS DE VIDEOJUEGO MODERNO/FANTASÍA --- */}
            <style jsx global>{`
                 /* Importamos fuentes épicas y legibles */
                 @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lato:wght@400;700&display=swap'); 
            `}</style>
            <style jsx global>{`
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lato:wght@400;700&display=swap');

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #23074d, #440a5b);
  font-family: 'Lato', sans-serif;
  padding: 20px;
}
.card {
  background: #1f2937;
  color: #fff;
  padding: 3rem;
  border-radius: 16px;
  border: 2px solid #a88a53;
  box-shadow: 0 0 25px rgba(168,138,83,0.3);
  text-align: center;
  max-width: 700px;
  width: 100%;
  animation: fadeIn 0.8s ease-in-out;
}
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }

h1, h2 { font-family: 'Cinzel', serif; color: #f0e1c9; text-shadow: 0 0 10px rgba(240,225,201,0.3); }
.button {
  display: inline-block;
  padding: 1.5rem 3.5rem;
  background: linear-gradient(145deg, #d4af37, #b8860b);
  color: #1f2937;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 0 #8c690a;
  text-transform: uppercase;
  font-family: 'Cinzel', serif;
  animation: pulse-gold 1.5s infinite;
}
@keyframes pulse-gold { 0% { transform: scale(1);} 50% { transform: scale(1.08);} 100% { transform: scale(1);} }
.button:hover { transform: scale(1.1); box-shadow: 0 8px 0 #8c690a; }
.button:active { animation: clickBounce 0.3s; }
@keyframes clickBounce { 0%{transform:scale(1);}50%{transform:scale(0.9);}100%{transform:scale(1);} }

.next-button { width: 100%; font-size: 1.3rem; padding: 1rem; margin-top: 10px; background: linear-gradient(145deg,#a88a53,#8c690a); position:relative; overflow:hidden; }
.next-button::before { content:''; position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(100deg,transparent,rgba(255,255,255,0.3),transparent); transform:skewX(-30deg); animation:shine 3s infinite linear; }
@keyframes shine { 0%{left:-100%;}100%{left:150%;} }

.option-button { min-height:90px; padding:1.8rem; background:#374151; color:#f0e1c9; border-radius:12px; font-size:1.3rem; font-weight:700; transition:all 0.3s ease; position:relative; overflow:hidden; }
.option-button:hover { background:#d4af37; color:#1f2937; transform:scale(1.05); box-shadow:0 6px 15px rgba(212,175,55,0.5); }
.option-button::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:radial-gradient(circle,rgba(255,255,255,0.4),transparent); animation:shine 2s infinite linear; }
.spinner { border:4px solid #f3f3f3; border-top:4px solid #ffcc00; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin:20px auto; }
@keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
`}</style>
        </>
    );
};

export default QuizBodaPage;
