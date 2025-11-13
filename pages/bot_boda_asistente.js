import { useState, useRef, useEffect } from "react";
import Head from "next/head";

export default function BotBodaAsistente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState("40px");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 🔴 ELIMINAMOS LA FUNCIÓN formatMessage. 
  // Ahora el backend se encarga de generar el HTML limpio.

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTextAreaHeight("40px");
    setIsTyping(true);

    // Nota: Es mejor pasar un historial simple, no el estado completo de React
    const history = messages.map(msg => ({ role: msg.role, content: msg.content }));

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: history }),
    });

    const data = await res.json();
    const fullReply = data.reply;
    setIsTyping(false);

    let currentText = "";
    const botMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, botMessage]);

    // 🔴 NOTA: La animación de "escritura" lenta carácter por carácter NO funciona bien con HTML.
    // Para resolver el problema de los enlaces rápidamente, cargaremos el mensaje completo de golpe.
    // Si quieres la animación, debes investigar cómo animar mensajes que contienen HTML.
    
    // Mostramos el mensaje completo (HTML) de golpe:
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: "assistant", content: fullReply };
      return updated;
    });
    
    // Eliminamos el bucle de escritura lenta
    /* for (let i = 0; i < fullReply.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      currentText += fullReply[i];
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: currentText };
        return updated;
      });
    } 
    */
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
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h1>Asistente de Boda 💍</h1>
        <div
          ref={chatBoxRef}
          style={{
            maxWidth: "400px",
            height: "300px",
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
                // 🟢 CAMBIO CLAVE: Usamos el contenido HTML directo sin el formateador.
                dangerouslySetInnerHTML={{ __html: msg.content }} 
              />
            </div>
          ))}
          {isTyping && <p>Escribiendo...</p>}
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
              fontSize: "14px",
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




