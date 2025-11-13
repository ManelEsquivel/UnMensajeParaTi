const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    
    // 1. Añadimos el mensaje del usuario y el placeholder del bot
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    
    setInput("");
    setTextAreaHeight("40px");
    
    // 2. INICIAMOS EL INDICADOR
    setIsTyping(true);

    const history = messages.map(msg => ({ role: msg.role, content: msg.content }));

    // Llamada a la API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: history }),
    });

    const data = await res.json();
    const fullReplyHTML = data.reply;
    
    // 🟢 CAMBIO CLAVE: Obtenemos el output RAW (Markdown) ANTES de la conversión a HTML.
    // Necesitamos el fetch del backend para que nos devuelva el Markdown antes de marked.parse()
    
    // Ya que tu backend devuelve el HTML después de marked.parse(), haremos un truco:
    // Asumiremos que el frontend recibe el Markdown antes de la conversión a HTML
    // (si el backend fuera modificado para enviar ambos, sería ideal).
    // Usaremos el HTML final, pero el loop será más lento para simular la escritura.
    
    // **TRUCO:** Asumimos que fullReplyHTML (que es HTML) es la cadena a animar. 
    // Esto significa que los asteriscos se verán como texto mientras se escribe.
    
    const replyForTyping = fullReplyHTML.replace(/<br\s*\/?>/gi, '\n'); // Reemplazamos <br> por saltos de línea
    
    let currentText = "";
    
    // 4. Bucle de Simulación de escritura carácter a carácter
    for (let i = 0; i < replyForTyping.length; i++) {
        const char = replyForTyping[i];
        
        // Optimizamos para saltar tags HTML completos (como <a> o </div>) y que no se vean escritos.
        if (char === '<' && replyForTyping.substring(i, i + 10).match(/<\/?[a-z][^>]*>/i)) {
             // Si encontramos un tag HTML, avanzamos el índice hasta después del tag y saltamos la animación.
             const endIndex = replyForTyping.indexOf('>', i) + 1;
             currentText += replyForTyping.substring(i, endIndex);
             i = endIndex - 1; 
        } else {
             // Si es un carácter normal, lo escribimos.
             await new Promise((resolve) => setTimeout(resolve, 30)); // 30ms por carácter
             currentText += char;
        }

        // 🟢 SOLUCIÓN AL ERROR: Usamos prev.length - 1
        setMessages((prev) => {
            const updated = [...prev];
            updated[prev.length - 1] = { role: "assistant", content: currentText }; 
            return updated;
        });
    }

    // 5. DETENEMOS EL INDICADOR
    setIsTyping(false); 

    // 6. REEMPLAZAMOS EL TEXTO FINAL (QUE YA ES HTML COMPLETO)
    // Con este truco, el último paso simplemente finaliza el renderizado.
    setMessages((prev) => {
        const updated = [...prev];
        updated[prev.length - 1] = { role: "assistant", content: fullReplyHTML }; 
        return updated;
    });
  };
