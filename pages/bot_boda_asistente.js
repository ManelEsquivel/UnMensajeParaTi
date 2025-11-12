import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";

export default function BotBodaAsistente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [buttonBounce, setButtonBounce] = useState(false);
  const lastMessageRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setButtonBounce(true);
    setTimeout(() => setButtonBounce(false), 300); // Rebote breve

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main style={styles.main}>
        <h1 style={styles.title}>Asistente de Boda</h1>

        <div style={styles.chatBox}>
          {messages.map((msg, i) => (
            <div
              key={i}
              ref={i === messages.length - 1 ? lastMessageRef : null}
              style={{
                ...styles.bubble,
                ...(msg.role === "user" ? styles.userBubble : styles.assistantBubble),
                ...styles.fadeIn,
              }}
            >
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div ref={lastMessageRef} style={{ ...styles.bubble, ...styles.assistantBubble, ...styles.fadeIn }}>
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
          <button
            onClick={sendMessage}
            style={{
              ...styles.button,
              ...(buttonBounce ? styles.buttonBounce : {}),
            }}
          >
            ➤
          </button>
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
    padding: "10px",
    minHeight: "100vh",
  },
  title: {
    color: "#333",
    marginBottom: "10px",
    fontSize: "20px",
  },
  chatBox: {
    width: "100%",
    maxWidth: "500px",
    height: "70vh",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "10px",
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
    opacity: 0,
    animation: "fadeIn 0.5s forwards",
  },
  fadeIn: {
    animation: "fadeIn 0.5s forwards",
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
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "10px",
    background: "#fff",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    marginLeft: "10px",
    padding: "12px 16px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px",
    transition: "transform 0.3s ease",
  },
  buttonBounce: {
    transform: "scale(1.2)",
  },
};
