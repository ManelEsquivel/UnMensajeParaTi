import { useState, useRef } from "react";
import Head from "next/head";

export default function BotBodaAsistente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: messages }),
    });

    const data = await res.json();
    const botMessage = { role: "assistant", content: data.reply };
    setMessages((prev) => [...prev, botMessage]);

    setTimeout(() => {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, 100);
  };

  return (
    <>
      <Head>
        <title>Asistente de Boda</title>
        <meta name="description" content="Asistente virtual para la boda de Manel y Carla" />
      </Head>

      <main
        style={{
          fontFamily: "'Segoe UI', Arial, sans-serif",
          background: "#f4f4f4",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: 0,
          padding: "20px",
          minHeight: "100vh",
        }}
      >
        <h1 style={{ color: "#333", marginBottom: "15px" }}>Asistente de Boda</h1>

        <div
          ref={chatBoxRef}
          id="chat-box"
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "450px",
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #ccc",
            padding: "15px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                margin: "6px",
                borderRadius: "18px",
                maxWidth: "80%",
                wordWrap: "break-word",
                fontSize: "14px",
                lineHeight: "1.4",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "#d1e7dd" : "#f8d7da",
                color: msg.role === "user" ? "#0f5132" : "#842029",
              }}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div
          id="controls"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "12px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe tu pregunta..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              marginLeft: "10px",
              padding: "10px 15px",
              border: "none",
              background: "#007bff",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Enviar
          </button>
        </div>
      </main>
    </>
  );
}
