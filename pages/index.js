// pages/index.js
import Head from "next/head";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const overlay = document.querySelector(".overlay");
      if (overlay) overlay.classList.add("fade-out");

      const flash = document.createElement("div");
      flash.className = "light-flash";
      document.body.appendChild(flash);

      setTimeout(() => {
        window.location.href = "https://manelesquivel.github.io/UnMensajeParaTi/SavetheDate.html";
      }, 2000);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Un Mensaje para ti</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>

      <style jsx>{`
        body {
          margin: 0;
          padding: 0;
          font-family: "Georgia", serif;
          background: url("https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80")
            no-repeat center center fixed;
          background-size: cover;
          color: #3e2f1c;
          overflow: hidden;
        }

        .overlay {
          background-color: rgba(245, 235, 220, 0.85);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 2s ease-in;
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
          animation: flash 2s ease-in forwards;
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

      <div className="overlay">
        <div className="message-box">
          <h1>Tenemos algo muy importante que contarte</h1>
          <p>
            Hemos pensado en ti para que guardes una fecha muy especial, porque te
            consideramos una parte importante de nuestra historia.
          </p>
        </div>
      </div>
    </>
  );
}

