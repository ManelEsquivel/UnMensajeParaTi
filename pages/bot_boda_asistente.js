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
    // 1. LIMPIEZA Y BLOQUEO
    // Bloqueamos el scroll del body real para que no se vea el fondo negro nunca
    document.documentElement.style.setProperty('background-color', '#ffffff', 'important');
    document.body.style.setProperty('background-color', '#ffffff', 'important');
    document.body.style.overflow = "hidden"; // <--- EL TRUCO MAESTRO (Bloquea el rebote negro)
    
    // Forzamos modo claro
    document.documentElement.style.colorScheme = "light";

    setTimeout(() => { setIsPageLoaded(true); }, 100);

    return () => {
      // Al salir, desbloqueamos el scroll por si acaso
      document.body.style.overflow = "";
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; }
  }, [messages, isTyping]);

  const sendMessage = async () => {
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

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textAreaRef.current;
    el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 100) + "px"; setTextAreaHeight(el.style.height);
  };

  return (
    <>
      <Head>
        <title>Asistente de Boda</title>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="color-scheme" content="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        <style>{`
          :root { color-scheme: light; }
          /* Bloqueamos el scroll nativo del navegador */
          html, body {
            background-color: #ffffff !important;
            height: 100%;
            overflow: hidden; /* IMPORTANTE */
            margin: 0; padding: 0;
          }
          #__next {
            height: 100%;
            background-color: #ffffff !important;
          }
        `}</style>
      </Head>

      {/* CORTINA NEGRA */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'black', zIndex: 9999, opacity: isPageLoaded ? 0 : 1, 
        transition: 'opacity 1.5s ease-in-out', pointerEvents: 'none' 
      }}></div>

      {/* CONTENEDOR DE SCROLL "FALSO" 
          Este div ocupa toda la pantalla y es el que tiene el scroll (overflow-y: auto).
          Al ser blanco y ocupar el 100%, el rebote elástico se hace sobre ESTE div, no sobre el body negro.
      */}
      <div style={{ 
        position: 'fixed', // Fijo para cubrir todo
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'white', 
        overflowY: 'auto',        // Aquí es donde ocurre el scroll ahora
        WebkitOverflowScrolling: 'touch', // Scroll suave en iOS
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* CONTENIDO REAL (Igual que antes, pero dentro del scroll falso) */}
        <div style={{ 
          width: "100%", maxWidth: "400px", padding: "20px", boxSizing: "border-box",
          display: "flex", flexDirection: "column", minHeight: "100%" // Para que ocupe altura
        }}>
            
            <h1 style={{textAlign: 'center', marginTop: '0'}}>Asistente de Boda 💍</h1>
            
            <div ref={chatBoxRef} style={{
                width: "100%", height: "380px", overflowY: "auto", border: "1px solid #ccc", borderRadius: "10px",
                padding: "10px", backgroundColor: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: "20px",
                boxSizing: "border-box"
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

            <div style={{ width: "100%", display: "flex", flexDirection: "column", paddingBottom: "20px" }}>
              <textarea ref={textAreaRef} value={input} onChange={handleInputChange} 
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Escribe tu mensaje..."
                style={{
                  resize: "none", height: textAreaHeight, maxHeight: "100px", padding: "10px 12px", borderRadius: "10px",
                  border: "1px solid #ccc", outline: "none", fontSize: "16px", lineHeight: "1.4", transition: "all 0.2s ease",
                  background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1) inset", marginBottom: "10px", width: '100%', boxSizing: 'border-box'
                }}
              />
              <button onClick={sendMessage} style={{
                  padding: "12px 20px", borderRadius: "12px", border: "1px solid #007bff", backgroundColor: "#007bff",
                  color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s ease, background-color 0.3s ease", width: '100%'
                }}>Enviar</button>
            </div>
        </div>

      </div>
    </>
  );
}
