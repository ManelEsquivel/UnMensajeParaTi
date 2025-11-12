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

  const makeLinksClickable = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `${url}${url}</a>`;
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTextAreaHeight("40px");
    setIsTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: messages }),
    });

    const data = await res.json();
    const fullReply = data.reply;
    setIsTyping(false);

    // Efecto de escritura letra por letra
    let currentText = "";
    const botMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, botMessage]);

    for (let i = 0; i < fullReply.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25)); // velocidad escritura
      currentText += fullReply[i];
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: currentText };
        return updated;
      });
    }
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
      <div>
        <h1>Asistente de Boda 💍</h1>
        <div ref={chatBoxRef}>
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
                  backgroundColor: msg.role === "user" ? "#d1e7dd" : "#f8d7da",
                }}
                dangerouslySetInnerHTML={{ __html: makeLinksClickable(msg.content) }}
              />
            </div>
          ))}
          {isTyping && <p>Escribiendo...</p>}
        </div>

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
            flex: 1,
            resize: "none",
            height: textAreaHeight,
            maxHeight: "100px",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "none",
            outline: "none",
            fontSize: "14px",
            lineHeight: "1.4",
            transition: "all 0.2s ease",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1) inset",
          }}
        />
        <button
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={sendMessage}
        >
          Enviar
        </button>
      </div>
    </>
  );
}


