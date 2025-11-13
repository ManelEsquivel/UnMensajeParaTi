const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTextAreaHeight("40px");
    
    // 1. INICIAMOS EL INDICADOR DE ESCRITURA
    setIsTyping(true);

    // 2. Creamos un mensaje placeholder que contendrá la respuesta final.
    const botMessageIndex = messages.length + 1;
    const botPlaceholder = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, botPlaceholder]);
    
    const history = messages.map(msg => ({ role: msg.role, content: msg.content }));

    // Llamada a la API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: history }),
    });

    const data = await res.json();
    const fullReplyHTML = data.reply;
    
    // 🟢 CÓDIGO CLAVE: Simulación de escritura carácter a carácter
    
    // 3. Obtenemos solo el texto sin HTML para la animación (esto es un truco simple)
    // Usamos una regex para limpiar tags, dejando solo el texto visible.
    const fullReplyText = fullReplyHTML.replace(/<[^>]+>/g, '');
    
    let currentText = "";
    const messageIndex = messages.length;

    for (let i = 0; i < fullReplyText.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 30)); // 30ms por carácter
        currentText += fullReplyText[i];
        
        // 4. Actualizamos el mensaje placeholder con el texto animado temporal
        setMessages((prev) => {
            const updated = [...prev];
            // Actualizamos la propiedad 'content' del último mensaje
            updated[messageIndex + 1] = { role: "assistant", content: currentText }; 
            return updated;
        });
    }

    // 5. DETENEMOS EL INDICADOR
    setIsTyping(false); 

    // 6. REEMPLAZAMOS EL TEXTO TEMPORAL CON EL HTML COMPLETO FINAL
    // Esto asegura que los enlaces funcionen y el formato se aplique de golpe al terminar.
    setMessages((prev) => {
        const updated = [...prev];
        updated[messageIndex + 1] = { role: "assistant", content: fullReplyHTML }; 
        return updated;
    });
  };
