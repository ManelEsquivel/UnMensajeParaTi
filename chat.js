// chat.js
let conversationHistory = [
  { role: "system", content: "Eres un asistente para una boda. Responde con claridad y amabilidad." }
];

const faq = {
  "¿dónde es la ceremonia?": "La ceremonia será en la Iglesia San Pedro, a las 12:00.",
  "¿dónde es el banquete?": "El banquete será en el Restaurante El Jardín, a las 14:00.",
  "¿hay transporte?": "Sí, habrá autobuses desde la iglesia al restaurante.",
  "¿cómo confirmar asistencia?": "Puedes confirmar asistencia en la sección 'Confirmar' o haciendo clic aquí: /confirmacion.html",
  "¿hay alojamiento?": "Sí, hemos reservado habitaciones en el Hotel Central. Contacta con nosotros para más detalles."
};

async function sendMessageToAI(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage, history: conversationHistory })
  });

  const data = await response.json();
  const aiReply = data.reply;

  conversationHistory.push({ role: "assistant", content: aiReply });
  return aiReply;
}

async function handleUserMessage(userMessage) {
  const normalized = userMessage.toLowerCase().trim();

  if (faq[normalized]) {
    return faq[normalized];
  }

  try {
    return await sendMessageToAI(userMessage);
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    return "Lo siento, hubo un problema al procesar tu pregunta. Intenta de nuevo.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const chatBox = document.getElementById("chat-box");

  sendBtn.addEventListener("click", async () => {
    const userMessage = input.value;
    if (!userMessage) return;

    const userBubble = document.createElement("div");
    userBubble.className = "bubble user";
    userBubble.textContent = userMessage;
    chatBox.appendChild(userBubble);

    input.value = "";

    const reply = await handleUserMessage(userMessage);

    const botBubble = document.createElement("div");
    botBubble.className = "bubble bot";
    botBubble.textContent = reply;
    chatBox.appendChild(botBubble);

    chatBox.scrollTop = chatBox.scrollHeight;
  });
});

