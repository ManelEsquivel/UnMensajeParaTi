// pages/index.js
import Head from "next/head";
import { useEffect } from "react";
// Se elimina la importación del módulo CSS que causa el error.
// import styles from '../styles/Home.module.css'; 

export default function Home() {
  useEffect(() => {
    // Lógica original de redirección
    const timer = setTimeout(() => {
      const overlay = document.querySelector(".overlay");
      if (overlay) overlay.classList.add("fade-out");

      const flash = document.createElement("div");
      flash.className = "light-flash";
      document.body.appendChild(flash);

      setTimeout(() => {
        // Redirección a la URL
        window.location.href = "https://manelesquivel.github.io/UnMensajeParaTi/SavetheDate.html";
      }, 2000);
    }, 7000); // Mantenemos 11 segundos para el inicio del FADE OUT (el punto final)

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Un Mensaje para Ti</title>
        <meta name="description" content="Un mensaje especial para ti — Manel & Carla" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>

      <main>
        <div class="overlay">
          <div class="message-box">
            <h1>Tenemos algo muy importante que contarte</h1>
            <p>
              Hemos pensado en ti para que guardes una fecha muy especial, porque te
              consideramos una parte importante de nuestra historia.
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          font-family: "Georgia", serif;
          /* --- CORRECCIÓN FINAL: Usando la extensión exacta .JPG --- */
          background: url("/manel-carla-propuesta.JPG") /* RUTA CORREGIDA CON .JPG */
            no-repeat center center fixed;
          background-size: cover;
          color: #3e2f1c;
          height: 100%;
          overflow: hidden;
          /* Aseguramos que la opacidad del body sea 1 al inicio */
          opacity: 1; 
        }

        .overlay {
          /* El overlay debe ser invisible al inicio para que solo se vea el fondo */
          background-color: rgba(245, 235, 220, 0.9); 
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          
          /* --- MODIFICACIÓN CLAVE PARA RETRASO DEL TEXTO (PASO 2) --- */
          animation: fadeIn 2s ease-in forwards; /* Añadimos forwards para que se quede visible */
          animation-delay: 2s; /* RETRASO DE 2 SEGUNDOS antes de que empiece el fadeIn */
          opacity: 0; /* Lo hacemos invisible por defecto antes de que empiece la animación */
          /* --- FIN MODIFICACIÓN CLAVE --- */
        }

        .message-box {
          background-color: #f7f1e8;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          z-index: 2;
        }

        h1 {
          font-size: 28px;
          margin-bottom: 20px;
        }

        p {
          font-size: 18px;
        }

        .fade-out {
          animation: fadeOut 2s ease-in forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .light-flash {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0) 70%
          );
          animation: flash 4s ease-in forwards;
          z-index: 1;
        }

        @keyframes flash {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
