// pages/api/chat.js
import { marked } from "marked";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" }); 
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "No se recibió ningún mensaje." });
  }

  // --- LISTA DE INVITADOS (NOMBRE, APELLIDO, CONFIRMADO) ---
  // 🟢 AJUSTE: Se han limpiado los espacios extra en los nombres para mejorar la coincidencia.
  const guestList = `
NOMBRE,APELLIDOS,CONFIRMADO
Manel,Esquivel,CONFIRMADO
Carla,Bartual,CONFIRMADO
Beatriz Esquivel,Esquivel,PENDIENTE
Manuel Esquivel,Esquivel,PENDIENTE
Eva Lopez,Lopez,PENDIENTE
Marc Genes,Genes,PENDIENTE
Maria Dolors,Dolors,PENDIENTE
Jordi Bartual,,PENDIENTE
Anna Bernal,Bernal,PENDIENTE
Alex Espada,Espada,PENDIENTE
Victor Lopez,Lopez,PENDIENTE
Carlos Barceló,Barceló,PENDIENTE
Sonia Cadevall,Cadevall,PENDIENTE
Antonio Escartín,Escartin,PENDIENTE
Sandra Gano,Gano,PENDIENTE
Ivan Alamo,Alamo,PENDIENTE
Alba Martinez,,PENDIENTE
Alex Ferré,Ferré,PENDIENTE
Alexia Galobardes,Galobardes,PENDIENTE
Marta Oliver,Oliver,PENDIENTE
Helena Briones,Briones,PENDIENTE
Joan,,PENDIENTE
Josua Bayona,Bayona,PENDIENTE
Amandine Liam,Liam,PENDIENTE
Sara ytarte,ytarte,PENDIENTE
Eva Areny,Areny,PENDIENTE
Jesus,,PENDIENTE
Carla Sardà,Sardà,PENDIENTE
Cristian Fernández,Fernández,PENDIENTE
Clara Torres,Torres,PENDIENTE
Pablo,,PENDIENTE
Anna Gonzalez,Gonzalez,PENDIENTE
Carlos Oros,,PENDIENTE
Mujer Oros,,PENDIENTE
Carlos Rodriguez,Rodriguez,PENDIENTE
Dunia Mascaro,Mascaro,PENDIENTE
Gonzalo,,PENDIENTE
Marta Bartual,Bartual,PENDIENTE
Iker Zarate,Zarate,PENDIENTE
Alfonso Zarate,Zarate,PENDIENTE
Jaime Lopez,Lopez,PENDIENTE
Rosario,,PENDIENTE
Natalia Balcells,Balcells,PENDIENTE
Pau,,PENDIENTE
Susana,Lopez,PENDIENTE
Ramon,,PENDIENTE
Natalia Belinguer,Belinguer,PENDIENTE
Natalia Pellicer,Pellicer,PENDIENTE
Silvia,,PENDIENTE
Gemma Urpina,Urpina,PENDIENTE
Alexis Postigo,Postigo,PENDIENTE
Mª Angeles,,PENDIENTE
Carles Castañe,Castañe,PENDIENTE
Teodoro Lopez,Lopez,PENDIENTE
Meritxell,,PENDIENTE
Montse,,PENDIENTE
Marido Montse,,PENDIENTE
Elena Escura,Escura,PENDIENTE
Jaime Monzon,Monzon,PENDIENTE
Carmen Izquierdo,Izquierdo,PENDIENTE
Laura Cester,Cester,PENDIENTE
Monica Falguera,Falguera,PENDIENTE
Noa,,PENDIENTE
Mujer Carlos Rodrigu,,PENDIENTE
Narcis Vidal,Vidal,PENDIENTE
Montse Asociación,,PENDIENTE
Marido Montse,Asociación,PENDIENTE
Didac,,PENDIENTE
Mujer,Didac,PENDIENTE
`;

  // --- DATA CLAVE PARA APERITIVO ---
  const aperitivoPrincipalesFormatoLista = `
* Roll de salmón ahumado, con crema de anchoas y brotes de albahaca crujiente
* Crostini de escalivada asada con ventresca de atún
* Mini tacos de vegetales a la parrilla
* Trufa de foie con crocante de almendra tostada
* Cazuela gourmet de pasta con relleno de ragú boloñesa con queso fundido y albahaca
* Rol de requesón y nueces envuelto en calabacín asado
* Mini ensalada de algas con perlas de yuzu y semillas de amapora
* Chupito de mazamorra cordobesa con tropicales y mousse de ventresca
* Croquetas de pulpo gallego
* Simulacro de calamar con patata paja
* Patatas bravas con alioli y su toque de valentina
* Trilogía de hamburguesas de pollo, ternera y quinoa
* Tiras de calamar crujiente en tempura
* Bocado de jamón de guijuelo en croqueta cremosa
* Vasito de romesco
`;

  const aperitivoAdicionales = `
Además, tendremos Showcooking y Corte:
* Jamón al corte
* Showcooking de carnes a la brasa
* Zamburiñas, almejas y navajas
`;
  
  // RESPUESTA COMPLETA Y PRE-FORMATEADA para la pregunta general del aperitivo
  const aperitivoResponseCompleta = `¡Claro! Para el aperitivo, habrá una gran variedad de platos deliciosos. 🍽️
${aperitivoPrincipalesFormatoLista}

${aperitivoAdicionales}

¡Una variedad exquisita para disfrutar!
`;

  // RESPUESTA PARA VEGETARIANOS/INTOLERANCIAS
  const aperitivoVegetarianoResponse = `
  ¡Por supuesto! Para los invitados vegetarianos, los platos principales disponibles en el aperitivo (excluyendo carne, pescado y marisco) son:
  
  * **Mini tacos de vegetales a la parrilla**
  * **Rol de requesón y nueces envuelto en calabacín asado**
  * **Mini ensalada de algas con perlas de yuzu y semillas de amapola**
  * **Patatas bravas con alioli y su toque de valentina**
  * **Vasito de romesco**
  
  Si tienes alguna intolerancia alimentaria o alergia específica (gluten, lactosa, etc.), por favor, ponte en contacto con Manel o Carla directamente antes del día de la boda para que puedan asegurar un menú adaptado y seguro para ti. ¡Gracias!
  `;
  // --- FIN DATA APERITIVO ---

  const weddingInfo = {
    date: "31 de octubre de 2026",
    time: "de 12:00 a 21:00 aproximadamente",
    location: "Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona",
    detailUbisUrl: "https://www.bodas.net/web/manel-y-carla/ubicacion-8",
    banquet: "en el mismo recinto, justo después del aperitivo",
    dressCode: "Formal",
    transport: "Habrá parking gratuito y servicio de taxi disponible",
    accommodation: "Hoteles cercanos: Celler Suites y Villas Coliving",
    schedule: `
      - Ceremonia: de 12:30 a 13:30
      - Aperitivo: de 13:30 a 15:30
      - Banquete: de 15:30 a 19:00
      - Fiesta y barra libre: de 19:00 a 21:00
    `,
    fiestaActividades: `Para la fiesta (de 19:00 a 21:00) tendremos un **Videomatón 360º** y un **Fotomatón** para que todos se lleven un gran recuerdo. 
    
    Además, habrá barra libre durante **2 horas**.`,
    
    padresManel: "Manuel y Maria Dolors",
    padresCarla: "Jordi y Eva",
  };

  const systemPrompt = `
Eres un asistente virtual amable y servicial para la boda de Manel y Carla.
Responde en español si te escriben en español y si te escriben en catalán, responde en catalán, de forma clara, cálida y concisa.

---

## 🤵👰 VERIFICACIÓN DE INVITADOS
- **LISTA DE INVITADOS (NOMBRE, APELLIDOS, CONFIRMADO):**
${guestList}

- **INSTRUCCIONES CLAVE (AJUSTADAS para priorizar la verificación de Nombre + Apellido):**

1.  **RESPUESTA OBLIGATORIA al preguntar por la invitación:** Si el usuario pregunta "¿Estoy invitado?", "¿Están invitados [Yo/Nosotros]?" o similar **sin dar su nombre**, DEBES responder únicamente: "¡Qué buena pregunta! Para poder confirmarlo, ¿podrías indicarme tu nombre completo (Nombre y Apellido) por favor?".

2.  **Verificación y Estado de Confirmación:** Una vez que el usuario te da un nombre:
    * **Prioridad (Nombre + Apellido):** Si el usuario proporciona **dos o más palabras** (tratadas como Nombre y Apellido), y ese par **coincide exactamente con UNA persona** en la lista (ej: "Alex Ferré"), DEBES pasar directamente a confirmar su estado (Punto 3).
    * **Ambigüedad (Solo Nombre):** Si el usuario proporciona **solo una palabra** (tratada como Nombre), y esa palabra **coincide con MÁS de una persona** (ej: "Alex" con Espada y Ferré), debes preguntar: "¿Me podrías indicar tu apellido, por favor? Tenemos varias personas con ese nombre en la lista."
    
3.  **Respuesta Final de Confirmación (Si el invitado está en la lista):** Si el invitado se encuentra en la lista (ya sea por nombre o nombre y apellido):
        * **Si el estado es CONFIRMADO:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Tu asistencia está **CONFIRMADA**. ¡Te esperamos con mucha ilusión!".
        * **Si el estado es PENDIENTE:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Sin embargo, tu asistencia se encuentra **PENDIENTE** de confirmación. Por favor, asegúrate de contactar con Manel o Carla para confirmar tu asistencia. ¡Te esperamos con mucha ilusión!".
    
4.  **No Encontrado:** Si el usuario te da un nombre (o nombre y apellido) y **NO hay ninguna coincidencia con la lista de invitados** (después de una o dos interacciones), debes responder: "Lo siento mucho, pero no encuentro tu nombre en la lista de invitados. Si crees que puede ser un error, por favor, contacta directamente con Manel o Carla."
    

## 👨‍👩‍👧‍👦 Familias
- Si preguntan por los padres de Manel, son **${weddingInfo.padresManel}**.
- Si preguntan por los padres de Carla, son **${weddingInfo.padresCarla}**.

## 🍽️ Aperitivo y Opciones Especiales
- El banquete será **${weddingInfo.banquet}**.

- **INSTRUCCIÓN CLAVE (APERTIVO COMPLETO):** Si preguntan por el **Aperitivo** (la lista de platos, el menú del aperitivo, etc.), DEBES responder ÚNICAMENTE con el siguiente texto, SIN AÑADIR NI OMITIR NINGUNA PALABRA:
${aperitivoResponseCompleta}

- **INSTRUCCIÓN CLAVE (VEGETARIANOS/INTOLERANCIAS):** Si preguntan por opciones **vegetarianas**, **alergias** o **intolerancias**, DEBES responder ÚNICAMENTE con el siguiente texto, SIN AÑADIR NI OMITIR NINGUNA PALABRA:
${aperitivoVegetarianoResponse}

## 📅 Detalles Generales
- La boda será el **${weddingInfo.date}**, de **${weddingInfo.time}**, en **${weddingInfo.location}**.
- Más información sobre el lugar: [Ubicación](${weddingInfo.detailUbisUrl}).

## 🕒 Horario
${weddingInfo.schedule}

## 🥳 Fiesta
- **INSTRUCCIÓN CLAVE (FIESTA/BARRA LIBRE):** Si preguntan por la fiesta, las actividades o la barra libre, DEBES usar el siguiente texto, mencionando explícitamente la barra libre de 2 horas:
**${weddingInfo.fiestaActividades}**

## 👗 Otros Datos
- Código de vestimenta: ${weddingInfo.dressCode}.
- Transporte: ${weddingInfo.transport}.
- Alojamiento: ${weddingInfo.accommodation}.

---

## 🎁 Regalos
- Si alguien pregunta por el **número de cuenta** o la **transferencia** para el regalo:
Responde de manera amable que pueden ver toda la información en este enlace: [Número de Cuenta](https://www.bodas.net/web/manel-y-carla/regalosdeboda-11).

- Si alguien pregunta por **regalos** en general, o por la lista de boda:
Responde de manera amable y discreta que no es necesario, pero si desean más información pueden visitar: [Regalos de boda](https://www.bodas.net/web/manel-y-carla/regalos-8).


---

## ⚠️ Formato
- Usa SIEMPRE el formato Markdown correcto para enlaces: [Texto](URL)
- NO uses etiquetas HTML (<a>, target, rel, etc.)
- No devuelvas ningún otro formato que no sea texto o Markdown.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let aiReplyRaw =
      data?.choices?.[0]?.message?.content || "No tengo una respuesta en este momento.";
      
    // CONFIGURACIÓN CLAVE: Asegurar que los enlaces se abran en nueva pestaña
    marked.use({
      renderer: {
        link(href, title, text) {
          // Devolvemos el enlace con target="_blank" para abrir en una nueva pestaña.
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
      }
    });

    // Convertir Markdown a HTML limpio y saneado para el frontend
    const aiReplyHTML = marked.parse(aiReplyRaw);

    // Devolvemos el HTML completo.
    res.status(200).json({ reply: aiReplyHTML });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ reply: "Error interno del servidor. Intenta más tarde." });
  }
}
