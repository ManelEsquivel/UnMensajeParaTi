import { useState, useRef, useEffect } from "react";
import Head from "next/head";

// 1. Mensaje de Bienvenida en HTML - ¡MÁS LARGO!
const WELCOME_MESSAGE_HTML = `
  <strong>¡Hola a todos! 👋 Soy tu asistente para la boda de Manel y Carla.</strong><br/><br/>
  Estoy aquí para resolver cualquier duda que tengáis.<br/>
  
  <strong>Ejemplos de preguntas:</strong>
  <ul>
    <li>&iquest;Qu&eacute; comida se va a servir?</li>
    <li>Quiero confirmar mi asistencia</li>
    <li>&iquest;Cu&aacute;l es el plan del d&iacute;a?</li>
    <li>&iquest;D&oacute;nde es la ceremonia?</li>
  </ul>
  <br/>
  <strong>¡Escribe tu pregunta abajo!</strong> Te responderé al instante. ¡Gracias por compartir este día con nosotros!
`;

export default function BotBodaAsistente() {
  // Estado para la transición de entrada (Fade In)
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // 2. Inicialización del estado 'messages' con el mensaje de bienvenida
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME_MESSAGE_HTML }
  ]);
  
  const [input, setInput] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState("40px");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const textAreaRef = useRef(null);

  // EFECTO DE ENTRADA SUAVE
  useEffect(() => {
    // Pequeño retardo para asegurar que el navegador pinte el negro primero
    setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    
    // 1. Añadimos el mensaje del usuario y el placeholder del bot (VACÍO)
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    
    setInput("");
    setTextAreaHeight("40px");
    
    // 2. INICIAMOS EL INDICADOR (Necesario para el useEffect del scroll)
    setIsTyping(true);

    // Para la llamada a la API, usamos todo el historial MENOS el mensaje de bienvenida
    const history = messages.slice(1).map(msg => ({ role: msg.role, content: msg.content }));

    // Llamada a la API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: history }),
    });

    const data = await res.json();
    const fullReplyHTML = data.reply;
    
    // 3. Simulación de escritura carácter a carácter
    const replyForTyping = fullReplyHTML.replace(/<br\s*\/?>/gi, '\n'); // Reemplazamos <br> por saltos de línea
    
    let currentText = "";
    
    for (let i = 0; i < replyForTyping.length; i++) {
        const char = replyForTyping[i];
        
        // Lógica para saltar tags HTML (como <a> o </div>) y que no se vean escritos.
        if (char === '<' && replyForTyping.substring(i, i + 10).match(/<\/?[a-z][^>]*>/i)) {
             // Si encontramos un tag HTML, avanzamos el índice hasta después del tag y añadimos todo el tag.
             const endIndex = replyForTyping.indexOf('>', i) + 1;
             currentText += replyForTyping.substring(i, endIndex);
             i = endIndex - 1; 
        } else {
             // Si es un carácter normal, lo escribimos con un delay.
             await new Promise((resolve) => setTimeout(resolve, 30)); // 30ms por carácter
             currentText += char;
        }

        // Actualizamos el último mensaje (el placeholder) con el texto animado
        setMessages((prev) => {
            const updated = [...prev];
            updated[prev.length - 1] = { role: "assistant", content: currentText }; 
            return updated;
        });
    }

    // 4. DETENEMOS EL INDICADOR
    setIsTyping(false); 

    // 5. REEMPLAZAMOS EL TEXTO TEMPORAL CON EL HTML COMPLETO FINAL
    setMessages((prev) => {
        const updated = [...prev];
        updated[prev.length - 1] = { role: "assistant", content: fullReplyHTML }; 
        return updated;
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textAreaRef.current;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
    setTextAreaHeight(el.style.height);
  };

  return (
    <>
      <Head>
        <title>Asistente de Boda</title>
      </Head>

      {/* --- CORTINA DE TRANSICIÓN (NEGRO -> TRANSPARENTE) --- */}
      <div style={{
        position: 'fixed',
        top: 0, 
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 9999, // Encima de todo
        opacity: isPageLoaded ? 0 : 1, // Si cargó, invisible. Si no, negro.
        transition: 'opacity 1.5s ease-in-out', // Misma duración que la salida del video
        pointerEvents: 'none' // Permite hacer clic a través de ella cuando desaparece
      }}></div>

      {/* CONTENEDOR PRINCIPAL (FONDO BLANCO) */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "20px",
        backgroundColor: "white", // Aseguramos el fondo blanco que pediste
        minHeight: "100vh" // Asegura que cubra toda la altura
      }}>
        <h1>Asistente de Boda 💍</h1>
        <div
          ref={chatBoxRef}
          style={{
            maxWidth: "400px",
            height: "380px", 
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            margin: "20px auto",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.role === "user" ? "right" : "left",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: msg.role === "user" ? "#d1e7dd" : "#cce5ff",
                  maxWidth: "80%",
                  wordWrap: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: msg.content }} 
              />
            </div>
          ))}
          {isTyping && <p style={{ textAlign: 'left' }}>...</p>} 
        </div>

        <div style={{ maxWidth: "400px", margin: "10px auto", display: "flex", flexDirection: "column" }}>
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Escribe tu mensaje..."
            style={{
              resize: "none",
              height: textAreaHeight,
              maxHeight: "100px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "16px", 
              lineHeight: "1.4",
              transition: "all 0.2s ease",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1) inset",
              marginBottom: "10px",
            }}
          />
          <button
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={sendMessage}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid #007bff",
              backgroundColor: "#007bff",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "transform 0.2s ease, background-color 0.3s ease",
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}
