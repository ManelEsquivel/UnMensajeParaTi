// pages/api/chat.js 
import { marked } from "marked"; 
import { obtenerRespuestaBoda } from '../../utils/bodaBrain'; 

export default async function handler(req, res) {
  // 1. Verificaciones de seguridad
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" }); 
  }
  
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "No se recibió ningún mensaje." });
  }

  try {
    // 2. LLAMAMOS AL CEREBRO COMPARTIDO 🧠
    // Usamos 'let' en lugar de 'const' porque quizás necesitemos cambiar el valor
    let aiReplyRaw = await obtenerRespuestaBoda(message);

    // --- 📍 TRUCO PARA LA WEB: MANEJO DE UBICACIÓN ---
    // Si el cerebro devuelve la bandera secreta "__UBICACION__" (que usa WhatsApp para el mapa nativo),
    // aquí en la web la sustituimos por un texto con enlace a Google Maps.
    if (aiReplyRaw === "__UBICACION__") {
      aiReplyRaw = `La boda se celebrará en **Masia Mas Llombart**.
      
📍 Sant Fost de Campsentelles, Barcelona.

[🗺️ Ver ubicación exacta en Google Maps](https://www.google.com/maps/search/?api=1&query=Masia+Mas+Llombart)`;
    }

    // 3. ADAPTACIÓN PARA LA WEB (Markdown -> HTML) 🎨
    marked.use({
      renderer: {
        link(href, title, text) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
      }
    });

    const aiReplyHTML = marked.parse(aiReplyRaw);

    // 4. Enviamos la respuesta
    return res.status(200).json({ reply: aiReplyHTML });

  } catch (error) {
    console.error("Error en el chat web:", error);
    return res.status(500).json({ reply: "Hubo un error procesando tu mensaje." });
  }
}
