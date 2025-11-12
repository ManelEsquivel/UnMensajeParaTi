export default async function handler(req, res) {
  const { message, history } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: history.concat({ role: "user", content: message }),
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ reply: "Error interno. Intenta más tarde." });
  }
}
