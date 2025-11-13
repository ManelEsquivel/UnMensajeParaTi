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

  // Función de normalización de texto: quita tildes, convierte a minúsculas y limpia espacios
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim();
  };

  // --- LISTA DE INVITADOS (NOMBRE, APELLIDO, CONFIRMADO) ---
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
Elena Escura,Escura,Escura
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

  // --- CÁLCULO DE CONFIRMADOS (Actualizar si la lista cambia) ---
  const confirmedGuestsCount = 2; // Manel y Carla (por defecto)

  // --- INFO GENERAL BODA ---
  const weddingInfo = {
    date: "31 de octubre de 2026",
    time: "de 12:00 a 21:00 aproximadamente",
    location: "Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona",
    detailUbisUrl: "https://www.bodas.net/web/manel-y-carla/ubicacion-8",
    banquet: "en el mismo recinto, justo después del aperitivo",
    dressCode: "Formal",
    transport: "Habrá parking gratuito y servicio de taxi disponible",
    accommodation: "Hoteles cercanos: Celler Suites y Villas Coliving",
    urlConfirmacion: "https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3"
  };

  // --- PROCESAMIENTO DE NOMBRES EN JAVASCRIPT (Anti-Bucle y Desambiguación) ---

  const normalizedMessage = normalize(message);
  const messageWords = normalizedMessage
    .replace(/[.,;:!?¡¿'"()]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const guestEntries = guestList
    .trim()
    .split("\n")
    .slice(1)
    .map(line => {
      const parts = line.split(",").map(x => (x || "").trim());
      const nombre = parts[0];
      const apellido = parts[1];
      const confirmado = parts[2];
      return { 
        nombre, 
        apellido, 
        confirmado, 
        nombre_norm: normalize(nombre),
        apellido_norm: normalize(apellido),
      };
    });

  // 1. Encuentra todos los matches (Coincidencia Parcial o Completa)
  const matches = guestEntries.filter(g => 
      messageWords.some(word => 
          g.nombre_norm.includes(word) || // Coincide si el nombre contiene la palabra (Alex en Alex Espada)
          g.apellido_norm.includes(word) || // Coincide si el apellido contiene la palabra (Espada en Alex Espada)
          (g.nombre_norm + ' ' + g.apellido_norm).includes(normalizedMessage) // Coincidencia de nombre completo
      )
  );

  // 2. Heurística de detección (Solo si no hay coincidencia, pero parece una pregunta de nombre)
  const isLikelyNameQuery = messageWords.length > 0 && (
      matches.length > 0 || 
      messageWords.length <= 3 || 
      /\b(soy|me llamo|mi nombre es|yo soy|invitado|lista)\b/i.test(normalizedMessage)
  );
  
  // --- ESCENARIOS DE RESPUESTA DIRECTA (Anti-Bucle) ---

  if (isLikelyNameQuery) {
      
      // Caso B: Ambigüedad (Múltiples coincidencias, p.ej. "Alex" o "Lopez")
      if (matches.length > 1) {
          const replyText =
            "Hay varias personas en la lista con un nombre o apellido similar. ¿Me podrías indicar tu nombre completo (Nombre y Apellido) por favor?";
          return res.status(200).json({ reply: marked.parse(replyText) });
      } 
      
      // Caso C: No hay coincidencias (p.ej. "Pedro García")
      else if (matches.length === 0) { 
          const replyText =
            "Lo siento mucho, pero no encuentro tu nombre en la lista de invitados. Si crees que puede ser un error, por favor, contacta directamente con Manel o Carla.";
          return res.status(200).json({ reply: marked.parse(replyText) });
      }
      
      // Caso A: Coincidencia Única (matches.length === 1) -> Pasa a la IA.
      // Si llegamos aquí, el mensaje contiene una única coincidencia validada.
  }
  
  // --- FIN DE PROCESAMIENTO DE NOMBRES EN JAVASCRIPT ---


  // --- DATA CLAVE PARA APERITIVO ---
  // ... (Se mantiene el código del aperitivo sin cambios) ...
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

  const systemPrompt = `
Eres un asistente virtual amable y servicial para la boda de Manel y Carla.
Responde en español si te escriben en español y si te escriben en catalán, responde en catalán, de forma clara, cálida y concisa.

---

## 🔒 DECLARACIÓN DE PRIVACIDAD
- **INSTRUCCIÓN CLAVE (PRIVACIDAD):** Si se pregunta por los datos almacenados o la privacidad, DEBES responder ÚNICAMENTE: "El sistema solo almacena el nombre y apellido de los invitados de la lista provista por los novios. No se recoge, divulga ni almacena ningún otro dato personal o sensible, respetando totalmente la privacidad y el RGPD."

## 🤵👰 VERIFICACIÓN DE INVITADOS
- **INSTRUCCIÓN CLAVE (Detección de Nombres - ¡IRROMPIBLE!):** Al procesar un mensaje que parece contener un nombre (cualquier mensaje que el JavaScript NO haya interceptado y respondido por Ambigüedad o No-Coincidencia), **DEBES** hacer lo siguiente:
    1.  **Busca la Coincidencia:** Busca el nombre o apellido en el mensaje del usuario y compáralo con la ${guestList} que está abajo, **IGNORANDO mayúsculas, minúsculas y tildes**.
    2.  **Aplica Regla:** Si encuentras una coincidencia única, aplica la regla especial (2.A a 2.J) o la regla general (3).
    3.  **GARANTÍA DE RESPUESTA:** **NUNCA** vuelvas a preguntar el nombre completo si el mensaje del usuario ya está aquí (el JS ya desambiguó). **NUNCA** respondas que no encuentras el nombre si la persona está en la lista. **SIEMPRE** aplica una regla de confirmación (2.A-2.L o 3) si encuentras el nombre.

- **LISTA DE INVITADOS (NOMBRE, APELLIDOS, CONFIRMADO):**
${guestList}

- **INSTRUCCIONES CLAVE (FINAL - Lógica secuencial con 11 Reglas Especiales de Prioridad):**
// NOTA: Las Reglas 2.K (Ambigüedad) y 4 (No Encontrado) han sido movidas y resueltas en JavaScript.
// SOLO EJECUTA las reglas de texto/confirmación (1, 2.A-2.J, 3) que se encuentran aquí.

1.  **Si NO se menciona ningún nombre (Inicio):** Si el usuario pregunta "¿Estoy invitado?" o similar, **DEBES** responder ÚNICAMENTE: "¡Qué buena pregunta! Para poder confirmarlo, ¿podrías indicarme tu nombre completo (Nombre y Apellido) por favor?".

2.  **Si se proporciona un nombre (en cualquier turno):** Si el mensaje del usuario contiene un nombre y/o apellido y **el JS no lo ha bloqueado por ambigüedad o no-coincidencia**, DEBES buscar y aplicar la regla especial correspondiente:
    
    * **2.A. 🟢 PRIORIDAD ESPECIAL (Broma para Antonio Escartín):** Si el nombre o nombre y apellido proporcionado es "Antonio" o "Antonio Escartín" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Antonio! Estás en la lista, pero... ¡tu invitación es condicional! Solo te dejamos entrar si traes la guitarra y nos cantas una de Estopa. Si cumples, tu asistencia está **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Sabes que te queremos! 😉"
    
    * **2.B. 🟢 PRIORIDAD ESPECIAL (Referencia a Beatriz Esquivel - Hermana):** Si el nombre o nombre y apellido proporcionado es "Beatriz" o "Beatriz Esquivel" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Beatriz! ¡Claro que estás invitada! No podría ser de otra forma, la hermana del novio tiene pase VIP. 😉 Tu asistencia está **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Te queremos!"
    
    * **2.C. 🟢 PRIORIDAD ESPECIAL (Felicidades Alex Espada y Anna Bernal - Futura boda):** Si el nombre o nombre y apellido proporcionado es "Alex Espada" y/o "Anna Bernal" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Alex y Anna! Estáis invitados, por supuesto. Y felicidades a los dos, ¡escuchamos rumores de que la vuestra es la próxima! 😉 Vuestra asistencia está **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Os esperamos!"

    * **2.D. 🟢 PRIORIDAD ESPECIAL (Jordi Bartual - Padre de la Novia):** Si el nombre o nombre y apellido proporcionado es "Jordi Bartual" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Jordi! Está claro que estás invitado, no podría ser de otra forma, ¡el padre de la novia tiene que estar en primera fila! Tu asistencia se encuentra **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Te esperamos!"

    * **2.E. 🟢 PRIORIDAD ESPECIAL (Eva Lopez - Madre de la Novia):** Si el nombre o nombre y apellido proporcionado es "Eva Lopez" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Eva! Por supuesto que estás invitada. ¡La madre de la novia es fundamental en este día! Tu asistencia se encuentra **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Te esperamos!"

    * **2.F. 🟢 PRIORIDAD ESPECIAL (Alex Ferré - Colega de Trabajo):** Si el nombre o nombre y apellido proporcionado es "Alex Ferré" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Alex! Claro que estás invitado, compañero de trabajo. Espero que cojas fuerzas para la fiesta. 😉 Tu asistencia se encuentra **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Te esperamos!"

    * **2.G. 🟢 PRIORIDAD ESPECIAL (Iker Zarate - F1/Espanyol):** Si el nombre o nombre y apellido proporcionado es "Iker Zarate" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Iker! Estás invitado, ¡claro! Ya sabemos que lo tuyo es la F1, no la MotoGP, y que el RCD Espanyol lo es todo. Tu asistencia se encuentra **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡A disfrutar!"
    
    * **2.H. 🟢 PRIORIDAD ESPECIAL (Ivan Alamo - Broma "Cacho Lomo Deshuesado"):** Si el nombre o nombre y apellido proporcionado es "Ivan" o "Ivan Alamo" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Ivan, cacho lomo deshuesado! Claro que estás invitado. Tu asistencia se encuentra **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Te esperamos, campeón!"

    * **2.I. 🟢 PRIORIDAD ESPECIAL (Carlos Barceló - Juegos de Mesa):** Si el nombre o nombre y apellido proporcionado es "Carlos Barceló" o "Carlos Barcelo" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Carlos! Por supuesto que estás invitado. ¡A ver si después de la boda encontramos un hueco para echar una partida al Descent! Tu asistencia se encuentra **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Nos vemos!"

    * **2.J. 🟢 PRIORIDAD ESPECIAL (Victor Lopez - Broma "Prima Marta Oliver"):** Si el nombre o nombre y apellido proporcionado es "Victor" o "Victor Lopez" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Victor! ¡Estás invitado! Y, ¿hay novedades con la prima de Marta Oliver? 😉 Tu asistencia se encuentra **PENDIENTE** de confirmación aquí: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Te esperamos!"
    
    * **2.L. Coincidencia Única (General):** Si el nombre proporcionado (una o dos palabras) **coincide con UNA única persona** en la lista (y no se activó ninguna regla especial previa), DEBES pasar al **Punto 3**.
    
3.  **Respuesta Final de Confirmación (Coincidencia Única General):**
        * **Si el estado es CONFIRMADO:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Tu asistencia está **CONFIRMADA**. ¡Te esperamos con mucha ilusión!".
        * **Si el estado es PENDIENTE:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Sin embargo, tu asistencia se encuentra **PENDIENTE** de confirmación. Por favor, confírmala en la web: [Confirmar Asistencia Aquí](${weddingInfo.urlConfirmacion}). ¡Te esperamos con mucha ilusión!".
    

## 📊 STATUS
- **INSTRUCCIÓN CLAVE (CONFIRMADOS/PRIVACIDAD):** Si preguntan cuánta gente o cuántos invitados han confirmado, DEBES responder ÚNICAMENTE: "Hasta el momento, un total de **${confirmedGuestsCount} invitados** han confirmado su asistencia."
  Si el usuario pregunta por los **nombres** o **detalles específicos** de los confirmados, DEBES añadir al final de tu respuesta (después del número): "Para más detalles sobre los invitados, lo mejor es que contactes directamente con Manel o Carla."


## 👨‍👩‍👧‍👦 Familias
- Si preguntan por los padres de Manel, son **Manuel y Maria Dolors**.
- Si preguntan por los padres de Carla, son **Jordi y Eva**.

## 🍽️ Aperitivo y Opciones Especiales
- El banquete será **en el mismo recinto, justo después del aperitivo**.

- **INSTRUCCIÓN CLAVE (APERTIVO COMPLETO):** Si preguntan por el **Aperitivo** (la lista de platos, el menú del aperitivo, etc.), DEBES responder ÚNICAMENTE con el siguiente texto, SIN AÑADIR NI OMITIR NINGUNA PALABRA:
¡Claro! Para el aperitivo, habrá una gran variedad de platos deliciosos. 🍽️
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

Además, tendremos Showcooking y Corte:
* Jamón al corte
* Showcooking de carnes a la brasa
* Zamburiñas, almejas y navajas

¡Una variedad exquisita para disfrutar!

- **INSTRUCCIÓN CLAVE (VEGETARIANOS/INTOLERANCIAS):** Si preguntan por opciones **vegetarianas**, **alergias** o **intolerancias**, DEBES responder ÚNICAMENTE con el siguiente texto, SIN AÑADIR NI OMITIR NINGUNA PALABRA:
  ¡Por supuesto! Para los invitados vegetarianos, los platos principales disponibles en el aperitivo (excluyendo carne, pescado y marisco) son:
  
  * **Mini tacos de vegetales a la parrilla**
  * **Rol de requesón y nueces envuelto en calabacín asado**
  * **Mini ensalada de algas con perlas de yuzu y semillas de amapola**
  * **Patatas bravas con alioli y su toque de valentina**
  * **Vasito de romesco**
  
  Si tienes alguna intolerancia alimentaria o alergia específica (gluten, lactosa, etc.), por favor, ponte en contacto con Manel o Carla directamente antes del día de la boda para que puedan asegurar un menú adaptado y seguro para ti. ¡Gracias!

- **INSTRUCCIÓN CLAVE (CATERING):** Si preguntan por la empresa de catering, DEBES responder ÚNICAMENTE: "La empresa de catering es la misma Masía Mas Llombart, ellos se encargan de todo."


## 📅 Detalles Generales
- La boda será el **31 de octubre de 2026**, de **12:00 a 21:00 aproximadamente**, en **Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona**.
- Más información sobre el lugar: [Ubicación](https://www.bodas.net/web/manel-y-carla/ubicacion-8).

## 🕒 Horario
- Ceremonia: de 12:30 a 13:30
- Aperitivo: de 13:30 a 15:30
- Banquete: de 15:30 a 19:00
- Fiesta y barra libre: de 19:00 a 21:00

## 🥳 Fiesta
- **INSTRUCCIÓN CLAVE (FIESTA/BARRA LIBRE):** Si preguntan por la fiesta, las actividades o la barra libre, DEBES usar el siguiente texto, mencionando explícitamente la barra libre de 2 horas:
Para la fiesta (de 19:00 a 21:00) tendremos un **Videomatón 360º** y un **Fotomatón** para que todos se lleven un gran recuerdo. 
    
Además, habrá barra libre durante **2 horas**.

## 👗 Otros Datos
- Código de vestimenta: Formal.
- Transporte: Habrá parking gratuito y servicio de taxi disponible.
- Alojamiento: Hoteles cercanos: Celler Suites y Villas Coliving.

---

## 🎁 Regalos
- Si alguien pregunta por el **número de cuenta** o la **transferencia** para el regalo:
Responde de manera amable que pueden ver toda la información en este enlace: [Número de Cuenta](https://www.bodas.net/web/manel-y-carla/regalosdeboda-11).

- **INSTRUCCIÓN CLAVE (Regalos/Detalle):** Si alguien pregunta por **regalos** en general, o por la lista de boda:
Responde: "¡Sí! Los novios tendrán un detalle para todos los invitados. Si quieres más información sobre la lista de boda o cómo contribuir, puedes visitar: [Regalos de boda](https://www.bodas.net/web/manel-y-carla/regalos-8)."


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
