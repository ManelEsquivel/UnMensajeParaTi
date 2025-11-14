import React from 'react';
import Head from 'next/head';

const GOOGLE_FORM_URL = "https://forms.gle/QAhfjGxzTGafDmpz5"; // Reemplaza con tu URL real

const QuizBodaPage = () => {
  return (
    <>
      <Head>
        <title>El Gran Quiz de Manel y Carla 💍</title>
        <meta name="description" content="Pon a prueba cuánto sabes de nuestra historia" />
      </Head>

      <div className="container">
        <div className="card">
          <h1>💖 ¡Bienvenido/a al QUIZ de Manel y Carla!</h1>
          <p>Pon a prueba cuánto sabes de nuestra historia.</p>
          <p>¡Solo 3 preguntas! Si aciertas, entrarás en el sorteo de un detalle especial de nuestra parte. ¡Mucha suerte!</p>
          <a href={GOOGLE_FORM_URL} className="button" target="_blank" rel="noopener noreferrer">
            EMPIEZA TU TEST
          </a>
        </div>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8e1f4, #fdf6f9);
          font-family: 'Segoe UI', Tahoma, sans-serif;
          padding: 20px;
        }

        .card {
          background: #fff;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
          animation: fadeIn 1s ease-in-out;
        }

        h1 {
          color: #e91e63;
          margin-bottom: 1rem;
        }

        p {
          color: #333;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background-color: #e91e63;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1rem;
          transition: background 0.3s ease;
        }

        .button:hover {
          background-color: #d81b60;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default QuizBodaPage;
