
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";

export default function BotBodaAsistente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const lastMessageRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: messages }),
    });

    const data = await res.json();
    setIsTyping(false);
    const botMessage = { role: "assistant", content: data.reply };
    setMessages(prev => [...prev, botMessage]);
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <>
      <Head>
        <title>Asistente de Boda</title>
        <meta name="description" content="Asistente virtual para la boda de Manel y Carla" />
      </Head>

      <main style={styles.main}>
        <h1 style={styles.title}>Asistente de Boda</h1>

        <div style={styles.chatBox}>
          {messages.map((msg, i) => (
            <div
              key={i}
              ref={i === messages.length - 1 ? lastMessageRef : null}
              style={{ ...styles.bubble, ...(msg.role === "user" ? styles.userBubble : styles.assistantBubble) }}
            >
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div ref={lastMessageRef} style={{ ...styles.bubble, ...styles.assistantBubble }}>
              <span style={styles.typing}>Escribiendo</span>
            </div>
          )}
        </div>

        <div style={styles.controls}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe tu pregunta..."
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.button}>➤</button>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    minHeight: "100vh",
  },
  title: {
    color: "#333",
    marginBottom: "15px",
    fontSize: "24px",
  },
  chatBox: {
    width: "100%",
    maxWidth: "450px",
    height: "500px",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  bubble: {
    padding: "10px 14px",
    margin: "6px",
    borderRadius: "18px",
    maxWidth: "80%",
    wordWrap: "break-word",
    fontSize: "15px",
    lineHeight: "1.4",
    transition: "background 0.3s ease",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#007bff",
    color: "#fff",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    background: "#e9ecef",
    color: "#333",
  },
  typing: {
    display: "inline-block",
    animation: "dots 1s steps(3, end) infinite",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    marginTop: "12px",
    width: "100%",
    maxWidth: "450px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    marginLeft: "10px",
    padding: "10px 15px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};


