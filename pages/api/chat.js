// pages/api/chat.js 
import { marked } from "marked"; 
import { obtenerRespuestaBoda } from '../../utils/bodaBrain'; // 👈 AQUÍ ESTÁ EL TRUCO

export default async function handler(req, res) {
  // 1. Verificaciones de seguridad (igual que antes)
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" }); 
  }
  
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "No se recibió ningún mensaje." });
  }

  try {
    // 2. LLAMAMOS AL CEREBRO COMPARTIDO 🧠
    // En lugar de calcular invitados aquí, se lo pedimos a bodaBrain.
    // Esto nos devuelve el texto en Markdown (negritas con **, etc.)
    const aiReplyRaw = await obtenerRespuestaBoda(message);

    // 3. ADAPTACIÓN PARA LA WEB (Markdown -> HTML) 🎨
    // Como la web necesita HTML para verse bonita, usamos 'marked' aquí.
    marked.use({
      renderer: {
        link(href, title, text) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
      }
    });

    const aiReplyHTML = marked.parse(aiReplyRaw);

    // 4. Enviamos la respuesta limpia
    return res.status(200).json({ reply: aiReplyHTML });

  } catch (error) {
    console.error("Error en el chat web:", error);
    return res.status(500).json({ reply: "Hubo un error procesando tu mensaje." });
  }
}
