import { useState, useRef, useEffect } from "react";
import Head from "next/head"; 

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
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME_MESSAGE_HTML }]);
  const [input, setInput] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState("40px");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    // 1. RESETEO AGRESIVO DE COLOR PARA IPHONE
    // Importante: Pintamos html y body de blanco inmediatamente
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.minHeight = "100vh";
    document.documentElement.style.backgroundColor = "#ffffff";

    setTimeout(() => { setIsPageLoaded(true); }, 100);

    // Aseguramos que al desmontar no dejemos estilos raros
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, []);

  // ... (resto de lógica de chat igual que tenías, omitida para brevedad, pon aquí tu sendMessage y useEffect del scroll) ...
  // Asegúrate de copiar las funciones sendMessage, handleInputChange y el useEffect de scroll de tu archivo anterior
  // Pego aquí lo esencial para que funcione el renderizado:
  
  useEffect(() => {
    if (chatBoxRef.current) { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; }
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textAreaRef.current;
    el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 100) + "px"; setTextAreaHeight(el.style.height);
  };
  
  const sendMessage = async () => { /* ... TU LÓGICA DE ENVIAR MENSAJE AQUÍ ... */ 
    // (Copia tu función sendMessage tal cual la tenías en el último paso)
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput(""); setTextAreaHeight("40px"); setIsTyping(true);
    const history = messages.slice(1).map(msg => ({ role: msg.role, content: msg.content }));
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: input, history: history }), });
    const data = await res.json();
    const fullReplyHTML = data.reply;
    const replyForTyping = fullReplyHTML.replace(/<br\s*\/?>/gi, '\n');
    let currentText = "";
    for (let i = 0; i < replyForTyping.length; i++) {
        const char = replyForTyping[i];
        if (char === '<' && replyForTyping.substring(i, i + 10).match(/<\/?[a-z][^>]*>/i)) {
             const endIndex = replyForTyping.indexOf('>', i) + 1; currentText += replyForTyping.substring(i, endIndex); i = endIndex - 1; 
        } else { await new Promise((resolve) => setTimeout(resolve, 30)); currentText += char; }
        setMessages((prev) => { const updated = [...prev]; updated[prev.length - 1] = { role: "assistant", content: currentText }; return updated; });
    }
    setIsTyping(false); 
    setMessages((prev) => { const updated = [...prev]; updated[prev.length - 1] = { role: "assistant", content: fullReplyHTML }; return updated; });
  };

  return (
    <>
      <Head>
        <title>Asistente de Boda</title>
        {/* ESTO ES LO QUE ARREGLA EL IPHONE BLANCO: */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        <style>{`
          html, body, #__next {
            background-color: #ffffff !important;
            margin: 0; padding: 0;
            min-height: 100vh;
            width: 100%;
          }
        `}</style>
      </Head>

      {/* CORTINA NEGRA QUE DESAPARECE */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'black', zIndex: 9999, opacity: isPageLoaded ? 0 : 1, 
        transition: 'opacity 1.5s ease-in-out', pointerEvents: 'none' 
      }}></div>

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{ 
        textAlign: "center", backgroundColor: "white", minHeight: "100vh", width: "100%",
        margin: "0", padding: "20px", boxSizing: "border-box", overflowX: "hidden"
      }}>
        <h1>Asistente de Boda 💍</h1>
        <div ref={chatBoxRef} style={{
            maxWidth: "400px", height: "380px", overflowY: "auto", border: "1px solid #ccc", borderRadius: "10px",
            padding: "10px", backgroundColor: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", margin: "0 auto 20px auto", 
          }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", margin: "10px 0" }}>
              <div style={{
                  display: "inline-block", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc",
                  backgroundColor: msg.role === "user" ? "#d1e7dd" : "#cce5ff", maxWidth: "80%", wordWrap: "break-word",
                }} dangerouslySetInnerHTML={{ __html: msg.content }} />
            </div>
          ))}
          {isTyping && <p style={{ textAlign: 'left' }}>...</p>} 
        </div>

        <div style={{ maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", paddingBottom: "20px" }}>
          <textarea ref={textAreaRef} value={input} onChange={handleInputChange} 
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Escribe tu mensaje..."
            style={{
              resize: "none", height: textAreaHeight, maxHeight: "100px", padding: "10px 12px", borderRadius: "10px",
              border: "1px solid #ccc", outline: "none", fontSize: "16px", lineHeight: "1.4", transition: "all 0.2s ease",
              background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1) inset", marginBottom: "10px",
            }}
          />
          <button onClick={sendMessage} style={{
              padding: "12px 20px", borderRadius: "12px", border: "1px solid #007bff", backgroundColor: "#007bff",
              color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "transform 0.2s ease, background-color 0.3s ease",
            }}>Enviar</button>
        </div>
      </div>
    </>
  );
}
