const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/preguntar', async (req, res) => {
  const pregunta = req.body.pregunta;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres un asistente para una boda que responde preguntas frecuentes sobre el evento.' },
        { role: 'user', content: pregunta }
      ]
    })
  });

  const data = await response.json();
  const respuesta = data.choices[0].message.content;
  res.json({ respuesta });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
