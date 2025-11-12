// pages/api/chat.js
export default async function handler(req, res) {
  // Comprobación de la variable en logs
  console.log("¿OPENAI_API_KEY existe?", !!process.env.OPENAI_API_KEY);

  // Permitir peticiones locales y desde Vercel
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "No se recibió ningún mensaje." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un asistente de boda amable y servicial. Responde en español, de forma clara y breve." },
          ...(history || []),
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Error HTTP de OpenAI:", errText);
      return res.status(response.status).json({ reply: `Error OpenAI: ${errText}` });
    }

    const data = await response.json();
    const aiReply = data?.choices?.[0]?.message?.content || "No tengo una respuesta en este momento.";
    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error("💥 Error interno del backend:", error);
    res.status(500).json({ reply: "Error interno del servidor. Intenta más tarde." });
  }
}
