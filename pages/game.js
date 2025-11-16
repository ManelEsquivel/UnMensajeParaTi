import React, { useState } from 'react';
import Head from 'next/head';

// *******************************************************************
// ⚠️ 1. TUS IDENTIFICADORES REALES (CONFIRMADOS) ⚠️
// *******************************************************************
const BASE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfd6X0a5VGjQW_y7e3IYqTh64HLrh1yA6CWJEGJZu4HxENr3Q/formResponse";

const ENTRY_NAME = "entry.1745994476"; 
const ENTRY_Q1 = "entry.1000057";      
const ENTRY_Q2 = "entry.1509074265";   
const ENTRY_Q3 = "entry.551001831";    
const ENTRY_Q4 = "entry.1989972928";   
const ENTRY_Q5 = "entry.694289165";    
// *******************************************************************


const QuizBodaPage = () => {
  // Inicializamos el estado para el nombre y 5 preguntas
  const [answers, setAnswers] = useState({
    guestName: '', 
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verificación: Aseguramos que el nombre y todas las preguntas estén respondidas
    const allAnswered = Object.values(answers).every(val => val.trim() !== '');
    
    if (allAnswered) {
      
      // 🎯 CLAVE: Construimos la URL de envío con todos los campos
      const submissionUrl = `${BASE_FORM_URL}`
        + `?${ENTRY_NAME}=${encodeURIComponent(answers.guestName)}` 
        + `&${ENTRY_Q1}=${encodeURIComponent(answers.q1)}`
        + `&${ENTRY_Q2}=${encodeURIComponent(answers.q2)}`
        + `&${ENTRY_Q3}=${encodeURIComponent(answers.q3)}`
        + `&${ENTRY_Q4}=${encodeURIComponent(answers.q4)}`
        + `&${ENTRY_Q5}=${encodeURIComponent(answers.q5)}`;


      // Abre una nueva pestaña/ventana con la URL de envío para registrar la respuesta
      window.open(submissionUrl, '_blank');
      
      setSubmitted(true);
    } else {
      alert("¡Por favor, completa tu nombre y responde todas las preguntas para enviar el QUIZ!");
    }
  };
  
  // --- ESTRUCTURA DE PREGUNTAS (con opciones) ---
  const questions = [
    { 
        id: 'q1', 
        entry: ENTRY_Q1, 
        label: '1. ¿De quién fue la idea de tener animales en casa?', 
        type: 'select', 
        options: ['Manel', 'Carla'],
        placeholder: 'Selecciona el culpable...'
    },
    { 
        id: 'q2', 
        entry: ENTRY_Q2, 
        label: '2. ¿Cómo se llaman los michis de Manel y Carla?', 
        type: 'select', 
        options: ['Wasabi y Abby', 'Sky y Wasabi', 'Mia y Sombra', 'Mochi y Abby'],
        placeholder: 'Selecciona la respuesta correcta...'
    },
    { 
        id: 'q3', 
        entry: ENTRY_Q3, 
        label: '3. ¿En qué Provincia/Ciudad se comprometieron?', 
        type: 'select', 
        options: ['Roma/Fontana di trevi', 'París/ Torre eiffel', 'Girona /Cadaques', 'Menorca /Cala turqueta'],
        placeholder: 'Selecciona el lugar...'
    },
    { 
        id: 'q4', 
        entry: ENTRY_Q4, 
        label: '4. ¿Dónde fue el primer bautizo de buceo de Carla?', 
        type: 'select', 
        options: ['Tossa de Mar', 'Cadaques', 'Illes Medes', 'Palamos'],
        placeholder: 'Selecciona el destino...'
    },
    { 
        id: 'q5', 
        entry: ENTRY_Q5, 
        label: '5. Número de tatuajes Entre Carla y Manel', 
        type: 'select', 
        options: ['6', '7', '8', '10'], 
        placeholder: 'Selecciona el número...'
    },
  ];

  // Componente que renderiza un input o un selector
  const QuestionInput = ({ q, answers, handleChange }) => {
    if (q.type === 'select') {
        return (
            <select
                id={q.id}
                name={q.id}
                value={answers[q.id]}
                onChange={handleChange}
                required
            >
                {/* Opción deshabilitada por defecto */}
                <option value="" disabled>{q.placeholder}</option> 
                {q.options.map((option, index) => (
                    // El valor enviado es el texto de la opción (crucial para Google Forms)
                    <option key={index} value={option}>{option}</option>
                ))}
            </select>
        );
    } 
    
    // Este caso no se usa aquí, pero se mantiene como buena práctica
    return (
        <input
            type={q.type}
            id={q.id}
            name={q.id}
            value={answers[q.id]}
            onChange={handleChange}
            required
        />
    );
  };


  return (
    <>
      <Head>
        <title>El Gran Quiz de Manel y Carla 💍</title>
        <meta name="description" content="Pon a prueba cuánto sabes de nuestra historia" />
      </Head>

      <div className="container">
        <div className="card">
          <h1>💖 ¡El Gran QUIZ de Manel y Carla!</h1>
          <p>Pon a prueba cuánto sabes de nuestra historia. Si aciertas, entrarás en el sorteo de un detalle especial. ¡Mucha suerte!</p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="quiz-form">
              
              {/* CAMPO DE NOMBRE Y APELLIDO (Texto Plano) */}
              <div className="question-group">
                <label htmlFor="guestName">Tu Nombre y Apellido (Necesario para el sorteo)</label>
                <input
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={answers.guestName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* RESTO DE PREGUNTAS (Selectores) */}
              {questions.map((q) => (
                <div key={q.id} className="question-group">
                  <label htmlFor={q.id}>{q.label}</label>
                  <QuestionInput q={q} answers={answers} handleChange={handleChange} />
                </div>
              ))}
              
              <button type="submit" className="button">
                ENVIAR RESPUESTAS AL SORTEO
              </button>
            </form>
          ) : (
            <div className="success-message">
              <h2>¡Respuestas Enviadas! 🎉</h2>
              <p>Tu participación ha sido registrada con éxito en el formulario de los novios. ¡Gracias por jugar!</p>
            </div>
          )}

        </div>
      </div>

      {/* --- ESTILOS --- */}
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #2b2e4a, #4e5a7d); 
          font-family: 'Press Start 2P', 'Segoe UI', Tahoma, sans-serif;
          padding: 20px;
        }

        .card {
          background: #3a3f5b; 
          color: #fff;
          padding: 2rem;
          border-radius: 12px;
          border: 4px solid #f9c74f; 
          box-shadow: 0 0 20px rgba(249, 199, 79, 0.7); 
          text-align: center;
          max-width: 600px;
          width: 100%;
          animation: glow 1.5s infinite alternate;
        }

        @keyframes glow {
          from { box-shadow: 0 0 10px #f9c74f; }
          to { box-shadow: 0 0 20px #f9c74f, 0 0 30px #f9c74f; }
        }

        h1 {
          color: #f9c74f; 
          margin-bottom: 1rem;
          font-size: 1.8rem;
          text-shadow: 0 0 5px #f9c74f;
        }

        p {
          color: #e0e0e0;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }
        
        .quiz-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
            text-align: left;
        }
        
        .question-group {
            margin-bottom: 10px;
        }
        
        label {
            display: block;
            color: #4df0ff; 
            font-size: 0.8rem;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input, select { /* Ahora afecta a input y select */
            width: 100%;
            padding: 10px;
            background: #1e2133; 
            border: 2px solid #00c4ff; 
            color: #fff;
            border-radius: 4px;
            font-size: 1rem;
            box-sizing: border-box;
            -webkit-appearance: none; /* Estilos para select en webkit */
            -moz-appearance: none;    /* Estilos para select en mozilla */
            appearance: none;         /* Estándar para select */
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="%23fff" d="M10 4L6 8L2 4z"/></svg>'); /* Icono de flecha SVG blanco */
            background-repeat: no-repeat;
            background-position: right 10px center;
            padding-right: 30px; /* Espacio para la flecha */
        }
        
        select option {
            background-color: #3a3f5b; /* Fondo oscuro para las opciones del selector */
            color: #fff;
        }


        .button {
          display: inline-block;
          padding: 1rem 1.5rem;
          margin-top: 15px;
          background-color: #f9c74f; 
          color: #2b2e4a;
          border: none;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.1s ease;
          box-shadow: 0 4px 0 #e4b646; 
        }

        .button:hover {
          background-color: #e4b646;
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #cc9b3d;
        }
        
        .success-message h2 {
            color: #70e000; 
            text-shadow: 0 0 5px #70e000;
        }
      `}</style>
    </>
  );
};

export default QuizBodaPage;
