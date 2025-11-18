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
  // Estado para la transición de la Lona Negra
  const [opacity, setOpacity] = useState(1); // Empieza opaca (Negro total)
  const [showCurtain, setShowCurtain] = useState(true);
  
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME_MESSAGE_HTML }]);
  const [input, setInput] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState("40px");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    // 1. Limpieza de estilos de la Intro (Anti-iPhone)
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
    
    // 2. Forzamos base blanca
    document.documentElement.style.backgroundColor = "#ffffff";
    document.body.style.backgroundColor = "#ffffff";
    document.documentElement.style.colorScheme = "light";

    // 3. SECUENCIA "CINE":
    // Esperamos 500ms con la pantalla negra para dar estabilidad
    setTimeout(() => {
      setOpacity(0); // Empieza a desvanecerse la lona
    }, 500);

    // 4. Quitamos la lona del DOM cuando termine la animación (1.5s + 0.5s margen)
    setTimeout(() => {
      setShowCurtain(false);
    }, 2000);

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        <style>{`
          :root { color-scheme: light; }
          html, body {
            background-color: #ffffff !important;
            margin: 0; padding: 0; height: 100%; overflow: hidden; /* Body bloqueado */
          }
        `}</style>
      </Head>

      {/* --- 1. LA LONA NEGRA --- 
          Cubre TODO. Es independiente del contenido.
          Empieza visible (opacity 1) y se va (opacity 0).
      */}
      {showCurtain && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'black', zIndex: 99999,
          opacity: opacity, 
          transition: 'opacity 1.5s ease-in-out', 
          pointerEvents: 'none'
        }}></div>
      )}

      {/* --- 2. CONTENEDOR BLANCO SÓLIDO --- 
          IMPORTANTE: Este div SIEMPRE es Opacity 1. Nunca se vuelve transparente.
          Está DEBAJO de la lona negra. Cuando la lona se va, esto es lo que se ve.
      */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#ffffff', // Blanco Sólido
        zIndex: 1,
        overflowY: 'auto',          // Scroll aquí dentro
        WebkitOverflowScrolling: 'touch',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        // Pequeño efecto de entrada en el CONTENIDO, no en el fondo
        transform: opacity < 0.5 ? 'scale(1)' : 'scale(0.98)', 
        transition: 'transform 1.5s ease-out'
      }}>

        <div style={{ width: "100%", maxWidth: "400px", padding: "20px", boxSizing: "border-box" }}>
            
            <h1 style={{ textAlign: "center", marginTop: "0" }}>Asistente de Boda 💍</h1>
            
            <div ref={chatBoxRef} style={{
                height: "350px", 
                overflowY: "auto",
                border: "1px solid #ccc", borderRadius: "10px", padding: "10px",
                backgroundColor: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                marginBottom: "20px"
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", margin: "10px 0" }}>
                  <div style={{
                      display: "inline-block", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc",
                      backgroundColor: msg.role === "user" ? "#d1e7dd" : "#cce5ff", maxWidth: "80%", wordWrap: "break-word",
                  }} dangerouslySetInnerHTML={{ __html: msg.content }} />
                </div>
              ))}
              {isTyping && <p style={{ textAlign: 'left', color: '#666' }}>Escribiendo...</p>} 
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
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
