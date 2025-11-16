import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// URL del formulario de Google Forms
const BASE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfd6X0a5VGjQW_y7e3IYqTh64HLrh1yA6CWJEGJZu4HxENr3Q/formResponse";

// Identificadores reales del formulario
const ENTRY_NAME = "entry.1745994476";
const ENTRY_Q1 = "entry.1000057";
const ENTRY_Q2 = "entry.1509074265";
const ENTRY_Q3 = "entry.551001831";
const ENTRY_Q4 = "entry.1989972928";
const ENTRY_Q5 = "entry.694289165";

const QUIZ_COMPLETED_KEY = 'manel_carla_quiz_completed';

const ALL_QUESTIONS = [
  { id: 'q1', entry: ENTRY_Q1, label: '1. ¿De quién fue la idea de tener animales en casa?', options: ['Manel', 'Carla'] },
  { id: 'q2', entry: ENTRY_Q2, label: '2. ¿Cómo se llaman los michis de Manel y Carla?', options: ['Wasabi y Abby', 'Sky y Wasabi', 'Mia y Sombra', 'Mochi y Abby'] },
  { id: 'q3', entry: ENTRY_Q3, label: '3. ¿En qué Provincia/Ciudad se comprometieron?', options: ['Roma/Fontana di trevi', 'París/ Torre eiffel', 'Girona /Cadaques', 'Menorca /Cala turqueta'] },
  { id: 'q4', entry: ENTRY_Q4, label: '4. ¿Dónde fue el primer bautizo de buceo de Carla?', options: ['Tossa de Mar', 'Cadaques', 'Illes Medes', 'Palamos'] },
  { id: 'q5', entry: ENTRY_Q5, label: '5. Número de tatuajes Entre Carla y Manel', options: ['6', '7', '8', '10'] },
];

const entryMap = {
  guestName: ENTRY_NAME,
  q1: ENTRY_Q1,
  q2: ENTRY_Q2,
  q3: ENTRY_Q3,
  q4: ENTRY_Q4,
  q5: ENTRY_Q5,
};

const QuizBodaPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ guestName: '', q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const optionLetters = ['A', 'B', 'C', 'D'];
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

  const handleAnswerSelect = (value, questionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setCurrentStep(prev => prev + 1);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setAnswers(prev => ({ ...prev, guestName: name }));
    localStorage.setItem('manel_carla_quiz_name', name);
  };

  // ✅ FUNCIÓN DE ENVÍO COMPLETA
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCurrentStep(7);

    const allAnswered = Object.values(answers).every(val => val.trim() !== '');
    if (!allAnswered) {
      alert("Error: Por favor, responde a todas las preguntas antes de enviar.");
      setIsSubmitting(false);
      setCurrentStep(6);
      return;
    }

    // Crear formulario oculto
    const tempForm = document.createElement('form');
    tempForm.action = BASE_FORM_URL;
    tempForm.method = 'POST';
    tempForm.target = 'google-iframe-target';
    tempForm.style.display = 'none';

    const data = {
      [entryMap.guestName]: answers.guestName,
      [entryMap.q1]: answers.q1,
      [entryMap.q2]: answers.q2,
      [entryMap.q3]: answers.q3,
      [entryMap.q4]: answers.q4,
      [entryMap.q5]: answers.q5,
      "fvv": "1",
      "fbzx": Date.now().toString(),
      "pageHistory": "0" // Ajustado para una sola página
    };

    for (const key in data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      tempForm.appendChild(input);
    }

    // Asegurar iframe
    let iframe = document.querySelector('iframe[name="google-iframe-target"]');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = 'google-iframe-target';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    document.body.appendChild(tempForm);
    console.log("Enviando datos a Google Forms:", data);
    tempForm.submit();
    document.body.removeChild(tempForm);

    localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
    setIsCompleted(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(8);
    }, 2000);
  };

  const renderStep = () => {
    if (isCompleted || currentStep === 8) {
      return (
        <div className="step-content success-screen">
          <h2>¡Respuestas Enviadas con Éxito! 🎉</h2>
          <p>¡Vuestro conocimiento sobre Manel y Carla ha sido registrado, <b>{answers.guestName || 'invitado/a'}</b>!</p>
          <p>Si has acertado las preguntas, ¡entrarás en el sorteo de un detalle especial!</p>
          <button className="button next-button" onClick={() => window.location.reload()}>
            Volver a la Invitación
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <div className="step-content welcome-screen">
            <h1>💍 ¡Bienvenido/a al Gran Quiz de Manel y Carla!</h1>
            <p>Pon a prueba cuánto sabes de nuestra historia. ¡Hay premio!</p>
            <button className="button" onClick={() => setCurrentStep(1)} disabled={isSubmitting}>
              ¡EMPEZAR A JUGAR!
            </button>
          </div>
        );

      case 1:
        return (
          <div className="step-content name-screen">
            <h2>Tu Identificación</h2>
            <label htmlFor="guestName">Nombre y Apellido</label>
            <input type="text" id="guestName" value={answers.guestName} onChange={handleNameChange} required />
            <button className="button next-button" onClick={() => setCurrentStep(2)} disabled={answers.guestName.trim().length < 3 || isSubmitting}>
              SIGUIENTE »
            </button>
          </div>
        );

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
                <button key={index} className={`option-button`} onClick={() => handleAnswerSelect(option, currentQuestion.id)} disabled={isSubmitting}>
                  <span className="option-letter">{optionLetters[index]}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="step-content submit-screen">
            <h2>¡Enviando tus Respuestas!</h2>
            <div className="spinner"></div>
            <p>Registrando tu participación...</p>
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
      </Head>

      <iframe name="google-iframe-target" style={{ display: 'none' }} />

      <div className="container">
        <div className="card">
          {currentStep === 6 && (
            <form onSubmit={handleSubmit} className="final-submit-form">
              <button type="submit" className="button final-submit-button" disabled={isSubmitting}>
                FINALIZAR Y ENVIAR »
              </button>
            </form>
          )}

          {renderStep()}
        </div>
      </div>
    </>
  );
};

export default QuizBodaPage;
