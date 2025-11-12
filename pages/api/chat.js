// pages/api/chat.js
// pages/api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "No se recibió ningún mensaje." });
  }

  // ✅ Variables para la información de la boda
  const weddingInfo = {
    date: "31 de octubre de 2026",
    time: "12:00",
    location: "Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona",
    detailUbisUrl: "https://www.bodas.net/web/manel-y-carla/ubicacion-8",
    banquet: "en el mismo recinto, justo después del aperitivo",
    dressCode: "Formal, colores claros recomendados",
    transport: "Habrá parking gratuito y servicio de taxi disponible",
    accommodation: "Hoteles cercanos: Hotel Miramar y Hotel Sant Fost"
  };

  // ✅ Prompt dinámico
  const systemPrompt = `Eres un asistente de boda amable y servicial. Responde en español, de forma clara y breve.
  La boda será el ${weddingInfo.date} a las ${weddingInfo.time} en ${weddingInfo.location}.
  Más detalles de ubicación: ${weddingInfo.detailUbisUrl}.
  El banquete será ${weddingInfo.banquet}.
  Código de vestimenta: ${weddingInfo.dressCode}.
  Transporte: ${weddingInfo.transport}.
  Alojamiento: ${weddingInfo.accommodation}.
  Si alguien pregunta por la hora, el lugar, el banquete, la vestimenta, transporte o alojamiento, responde con estos datos.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // ✅ Modelo económico
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiReply = data?.choices?.[0]?.message?.content || "No tengo una respuesta en este momento.";
    res.status(200).json({ reply: aiReply });

  } catch (error) {
    res.status(500).json({ reply: "Error interno del servidor. Intenta más tarde." });
  }
}
