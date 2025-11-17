// pages/api/chat.js
import { marked } from "marked";

// Importamos el SDK de OpenAI si fuera necesario, pero en este caso solo usamos fetch.

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

  const normalizedMessage = normalize(message); // Normalizamos el mensaje de entrada una sola vez

  // --- CONFIGURACIÓN DE RESPUESTAS FIJAS (ALOJAMIENTO) ---
  const accommodationBookingUrl = "https://www.booking.com/searchresults.es.html?ss=Sant+Fost+de+Campsentelles&checkin=2026-10-31&checkout=2026-11-01&group_adults=2&no_rooms=1&group_children=0&lang=es";
  
  // 🎯 RESPUESTA GENERAL DE ALOJAMIENTO (Incluye enlace)
  const fullAccommodationResponse = `Hay hoteles cercanos para alojamiento como **Celler Suites** y **Villas Coliving**.

Si quieres ver más opciones de alojamiento en la zona, puedes consultar este enlace directo a Booking.com: [Ver Hoteles Cerca de la Boda](${accommodationBookingUrl})`;

  // 🎯 RESPUESTA ESPECÍFICA DE PRECIO/RECOMENDACIÓN (Ahora incluye la URL de Booking)
  // Aseguramos que la respuesta de precio también incluya el enlace para que la acción del usuario sea completada.
  const recommendationPriceResponse = `En cuanto a alojamiento, te recomendamos **Villas Coliving** por su proximidad y buen precio, que es de unos **70€ por noche**.

Si quieres ver más opciones en la zona, o reservar en otro hotel cercano, puedes consultar este enlace directo a Booking.com: [Ver Hoteles Cerca de la Boda](${accommodationBookingUrl})`;


  // --- ⚡️ OPTIMIZACIÓN DE VELOCIDAD: RESPUESTA RÁPIDA DE ALOJAMIENTO ---

  // Keywords para MÁXIMA PRIORIDAD (Recomendación/Precio)
  const maxPriorityAccommodationKeywords = [
    "cual", "precios", "recomendacion", "recomiendas", "recomiendes", "mejor", 
    "cuanto cuesta", "hotel", "alojamiento"
  ];

  // Keywords para Alojamiento GENERAL
  const generalAccommodationKeywords = [
    "hoteles", "dormir", "quedarse"
  ];

  let hardcodedReplyRaw = null;

  // 1. Check para MÁXIMA PRIORIDAD (Recomendación/Precio)
  const isMaxPriorityAccommodationQuery = maxPriorityAccommodationKeywords.some(keyword => 
    normalizedMessage.includes(keyword)
  );

  if (isMaxPriorityAccommodationQuery) {
    hardcodedReplyRaw = recommendationPriceResponse;
  } else {
    // 2. Check para Alojamiento GENERAL
    const isGeneralAccommodationQuery = generalAccommodationKeywords.some(keyword => 
        normalizedMessage.includes(keyword)
    ) || (normalizedMessage.includes("alojamiento") && !isMaxPriorityAccommodationQuery); 
    
    if (isGeneralAccommodationQuery) {
        hardcodedReplyRaw = fullAccommodationResponse;
    }
  }

  if (hardcodedReplyRaw) {
    // Si se encuentra una respuesta fija, se devuelve inmediatamente (¡sin llamar a OpenAI!)
    // Configuramos el marcado para que los enlaces se abran en nueva pestaña.
    marked.use({
      renderer: {
        link(href, title, text) {
          // Devolvemos el enlace con target="_blank" para abrir en una nueva pestaña.
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
      }
    });

    const aiReplyHTML = marked.parse(hardcodedReplyRaw);
    return res.status(200).json({ reply: aiReplyHTML });
  }

  // --- FIN DE LA OPTIMIZACIÓN DE VELOCIDAD ---


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
Kike Masgrau,Masgrau,PENDIENTE
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
    urlConfirmacion: "https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3",
    urlRegalosdeboda: "https://www.bodas.net/web/manel-y-carla/regalosdeboda-11",
    urlRegalos: "https://wwwas.net/web/manel-y-carla/regalos-8"
  };
  
  // --- RESPUESTAS TEMPLATE FORZADAS (NUEVO BLOQUE PARA GARANTIZAR EL AVISO) ---
  const urlConfirmacionInPrompt = weddingInfo.urlConfirmacion;

  // Plantilla exacta para invitados PENDIENTES (General)
  const PENDIENTE_TEMPLATE = (fullName, url) => `¡${fullName}! ¡Claro que estás invitado/a! Sin embargo, tu asistencia se encuentra **PENDIENTE** de confirmación. Por favor, confírmala en la web: [Confirmar Asistencia Aquí](${url}). ¡Te esperamos con mucha ilusión! 🌸\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente.`;
  
  // Plantilla exacta para invitados CONFIRMADOS (General)
  const CONFIRMADO_TEMPLATE = (fullName) => `¡${fullName}! ¡Sí, estás en la lista de invitados! Tu asistencia está **CONFIRMADA**. ¡Te esperamos con mucha ilusión! 🎉`;
  
  
  // --- PROCESAMIENTO DE NOMBRES EN JAVASCRIPT (Solo para INYECCIÓN de Prioridad Absoluta) ---

  const messageWords = normalizedMessage
    .replace(/[.,;:!?¡¿'"()]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  // Stop words para filtrar frases conversacionales (soy, me llamo, etc.)
  // FIX 1: Añadidas palabras clave de menú y bebidas para evitar que se confundan con nombres
  const stopWords = new Set([
      'soy', 'me', 'llamo', 'mi', 'nombre', 'es', 'yo', 'la', 'el', 'los', 'las', 'un', 'una', 'de', 'del', 'al', 'o', 'y', 'si', 'no', 'que', 'en', 'para', 'a', 'e', 'mis',
      'todo', 'todos', 'toda', 'todas', 'aperitivo', 'banquete', 'comida', 'menu', 'completo', 'ambos', 
      'bebidas', 'fiesta', 'ceremonia', 'vinos', 'cavas', 'platos'
  ]);
  
  // Palabras relevantes para la búsqueda (excluyendo stop words)
  const nameLikeWords = messageWords.filter(word => !stopWords.has(word));
  const relevantQuery = nameLikeWords.join(' ');
  // Detección de intención explícita de pregunta por la invitación
  const isExplicitInvitationQuery = normalizedMessage.includes('invitado') || normalizedMessage.includes('lista') || normalizedMessage.includes('asistencia') || normalizedMessage.includes('confirmacion');


  const guestEntries = guestList
    .trim()
    .split("\n")
    .slice(1)
    .map(line => {
      const parts = line.split(",").map(x => (x || "").trim());
      const nombre = parts[0];
      const apellido = parts[1];
      const confirmado = parts[2];
      const nombre_norm = normalize(nombre);
      const apellido_norm = normalize(apellido);
      return { 
        nombre, 
        apellido, 
        confirmado, 
        nombre_norm,
        apellido_norm,
        fullName_norm: `${nombre_norm} ${apellido_norm}`.trim()
      };
    });

  let forcedGuest = null;
  const isLikelyNameQuery = nameLikeWords.length > 0;

  if (isLikelyNameQuery) {
      
      // 1. Coincidencia EXACTA (Ej: "alex espada")
      const exactFullNameMatches = guestEntries.filter(g => 
          g.fullName_norm === relevantQuery
      );
      
      if (exactFullNameMatches.length >= 1) {
          forcedGuest = exactFullNameMatches[0];
      } else {
          // 2. Coincidencia PARCIAL ÚNICA (Ej: "marta" -> Marta Oliver)
          const wordMatches = guestEntries.filter(g => 
              // Todas las palabras relevantes del input deben estar en el fullName_norm del invitado.
              nameLikeWords.every(word => g.fullName_norm.includes(word))
          );
          
          if (wordMatches.length === 1) {
              forcedGuest = wordMatches[0];
          }
          // Si wordMatches.length > 1 (ambigüedad) o wordMatches.length === 0 (no encontrado),
          // NO forzamos la respuesta. La IA aplica las reglas 2.K o 4.
      }
  }

  // --- CONFIGURACIÓN DE RESPUESTAS FIJAS (PROMPT INJECTION USES) ---
  const confirmedGuestsCountInPrompt = confirmedGuestsCount;
  const detailUbisUrlInPrompt = weddingInfo.urlConfirmacion;
  const urlRegalosdebodaInPrompt = weddingInfo.urlRegalosdeboda;
  const urlRegalosInPrompt = weddingInfo.urlRegalos;
  
  // CRÍTICO: Definición de la respuesta de Regla 4 para forzar el texto exacto.
  const notFoundResponse = "Lo siento mucho 😔, pero el nombre facilitado no lo encuentro en la lista de invitados. Si crees que puede ser un error, por favor, contacta directamente con Manel o Carla.";


  // --- CONDICIONAL PROMPT INJECTION (FORZAR LA REGLA) ---
  
  // FIX 2: Se elimina el texto "QUIZ" del valor por defecto para evitar que se active el juego con palabras no relacionadas.
  let aiForcedInstruction = `
## 🎯 INSTRUCCIÓN DE PRIORIDAD ABSOLUTA (¡Generada por JS!)
(No hay instrucciones de prioridad generadas por JS. El script JS no detectó un nombre. Aplica las Reglas 0-4 del System Prompt normalmente.)
`; 

  if (forcedGuest) {
      const guestName = forcedGuest.nombre;
      const guestSurname = forcedGuest.apellido;
      const guestStatus = forcedGuest.confirmado;
      const fullName = `${guestName} ${guestSurname}`.trim();
      
      // Lista de Nombres COMPLETOS normalizados que tienen una REGLA ESPECIAL (2.A-2.P)
      const specialCaseNames = new Set([
        normalize("Antonio Escartín"), normalize("Beatriz Esquivel"), normalize("Kike Masgrau"), 
        normalize("Jordi Bartual"), normalize("Eva Lopez"), normalize("Alex Ferré"), 
        normalize("Iker Zarate"), normalize("Ivan Alamo"), normalize("Carlos Barceló"), 
        normalize("Victor Lopez"), normalize("Anna Bernal"), normalize("Alex Espada"), 
        normalize("Manel Esquivel"), normalize("Carla Bartual")
      ]);
      
      const normalizedFullName = normalize(fullName);
      
      let forcedReplyText = null;

      // 1. Check for General Cases (Rule 3) - Marta Oliver falls here.
      if (!specialCaseNames.has(normalizedFullName)) {
          if (guestStatus === 'CONFIRMADO') {
              forcedReplyText = CONFIRMADO_TEMPLATE(fullName);
          } else if (guestStatus === 'PENDIENTE') {
              // Esta es la solución para Marta Oliver y todos los PENDIENTES generales.
              forcedReplyText = PENDIENTE_TEMPLATE(fullName, urlConfirmacionInPrompt);
          }
      }

      if (forcedReplyText) {
          // APLICAR INSTRUCCIÓN DE FUERZA BRUTA (No Paraphrasing)
          // La IA debe responder con el texto exacto, garantizando que el aviso de 24h está.
          const formattedForPrompt = forcedReplyText
              // Reemplazamos \n con ' \n\n' para que el salto de línea del aviso se mantenga.
              .replace(/\n\n⚠️ Aviso:/g, ' \n\n⚠️ Aviso:') 
              .replace(/\n/g, ' ') // Reemplazamos el resto de saltos de línea para seguridad.
              .trim();
              
          aiForcedInstruction = `
          ## 🎯 INSTRUCCIÓN DE PRIORIDAD ABSOLUTA (¡Generada por JS!)
          El mensaje del usuario ha sido analizado y se ha encontrado un invitado ÚNICO.
          
          **TU TAREA ES LA SIGUIENTE, EN ESTE ORDEN:**
          
          1.  IGNORA TODAS las Reglas (1, Cero, 2, 3, 4, 2.A-2.P).
          2.  **DEBES** responder ÚNICAMENTE con el siguiente texto, sin añadir, cambiar o parafrasear nada: "${formattedForPrompt}"
          `;

      } else {
          // Es un caso especial (2.A-2.P), dejamos que la IA aplique la regla especial del prompt.
          aiForcedInstruction = `
          ## 🎯 INSTRUCCIÓN DE PRIORIDAD ABSOLUTA (¡Generada por JS!)
          El mensaje del usuario ha sido analizado por el backend y se ha identificado a un ÚNICO invitado:
          - Nombre Completo: **${fullName}**
          - Estado: **${guestStatus}**
          
          **TU TAREA ES LA SIGUIENTE, EN ESTE ORDEN:**
          
          1.  IGNORA la Regla 1, Regla Cero, Regla 2.K, Regla 4 y Regla 3.
          2.  BUSCA la coincidencia para "${fullName}" SÓLO en las Reglas Especiales (2.A a 2.P).
          3.  **Si encuentras una coincidencia en 2.A-2.P, APLICA esa regla ÚNICAMENTE.**
          4.  Si NO encuentras una coincidencia en 2.A-2.P, APLICA la Regla 3 usando el estado "${guestStatus}" y el nombre "${fullName}" para generar la respuesta.
          
          ¡NO vuelvas a preguntar el nombre ni digas que no lo encuentras!
          `;
      }
      
  } else if (isLikelyNameQuery && nameLikeWords.length > 0) { 
      // Si se proporciona un nombre (Pepe/Maria Pombo), pero NO está en la lista.
      
      const nameWords = relevantQuery.split(' ').filter(Boolean);
      // Capitalizamos las palabras para un saludo formal: "Pepe Lopez"
      const capitalizedName = nameWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      if (isExplicitInvitationQuery || nameLikeWords.length >= 2) {
          // FIX: Si hay palabras clave de invitación O si se proporcionan 2 o más palabras (Nombre+Apellido),
          // asumimos que es un intento de verificación y forzamos la Regla 4 (Rechazo).
          aiForcedInstruction = `
          ## 🎯 INSTRUCCIÓN DE PRIORIDAD ABSOLUTA (¡Generada por JS!)
          El mensaje del usuario ha sido analizado por el backend y se ha determinado que el nombre **NO** se encuentra en la lista de invitados.
          
          **TU TAREA ES LA SIGUIENTE, EN ESTE ORDEN:**
          
          1.  IGNORA TODAS las Reglas (1, Cero, 2, 3, 2.K, 2.A-2.P).
          2.  APLICA la **Regla 4 (No Encontrado)** OBLIGATORIAMENTE, usando el texto exacto: "${notFoundResponse}"
          
          ¡NO busques el nombre ni intentes aplicar ninguna otra regla!
          `;
      } else {
          // Si solo es un saludo con un solo nombre (Ej: 'soy pepe'), aplicamos el saludo conversacional.
          aiForcedInstruction = `
          ## 🎯 INSTRUCCIÓN DE PRIORIDAD ABSOLUTA (¡Generada por JS!)
          El mensaje del usuario ha sido analizado por el backend y es un saludo de un nombre **NO** encontrado.
          
          **TU TAREA ES LA SIGUIENTE, EN ESTE ORDEN:**
          
          1.  IGNORA las Reglas 1, 3, 4 y 2.K (y todas las reglas de invitado/lista).
          2.  **DEBES** responder con un saludo amistoso usando el nombre detectado ("${capitalizedName}") y una pregunta abierta sobre cómo puedes ayudar, para reconducir la conversación a temas generales de la boda.
          3.  La respuesta OBLIGATORIA debe ser: **"¡Hola ${capitalizedName}! Dime, ¿en qué puedo ayudarte con la boda de Manel y Carla?"**
          
          ¡NO menciones la lista de invitados, ni el estado "No Encontrado" (Regla 4)!
          `;
      }
  }
  // --- FIN DE INYECCIÓN ---

  // --- CONFIGURACIÓN DE RESPUESTAS FIJAS (COMIDA) ---
  
  // Lista del Aperitivo para inyección
  const aperitivoCompletoResponse = `¡Claro! Para el aperitivo, habrá una gran variedad de platos deliciosos. 🍽️
* Roll de salmón ahumado, con crema de anchoas y brotes de albahaca crujiente
* Crostini de escalivada asada con ventresca de atún
* Mini tacos de vegetales a la parrilla
* Trufa de foie con crocante de almendra tostada
* Cazuela gourmet de pasta con relleno de ragú boloñesa con queso fundido y albahaca
* Rol de requesón y nueces envuelto en calabacín asado
* Mini ensalada de algas con perlas de yuzu y semillas de amapora
* Chupito de mazamorra cordobesa con tropicales y mousse de ventresca
* Croquetas de pulpo gallego y pimpenton de la vera
* Crocanti de pollo caramelizado y sésamo negro 
* Simulacro de calamar con patata paja
* Patatas bravas con alioli y su toque de valentina
* Trilogía de hamburguesas de pollo, ternera y quinoa
* Tiras de calamar crujiente en tempura
* Bocado de jamón de guijuelo en croqueta cremosa
* Vasito de romesco
* Bicolor de Hummus clásico y de remolacha con AOVE
* Cremosos de risotto de setas ceps y parmesano regianno
* Bocado de gamba crujiente envuelta en jamón ibérico
* Perla de bacalao con all i oli de arbequina

Además, tendremos Showcooking y Corte:
* Jamón al corte
* Showcooking de carnes a la brasa
* Zamburiñas, almejas y navajas

¡Una variedad exquisita para disfrutar!`;

  // Respuesta Vegetariana para inyección
  const aperitivoVegetarianoResponse = `
  ¡Por supuesto! Para los invitados vegetarianos, los platos principales disponibles en el aperitivo (excluyendo carne, pescado y marisco) son:
  
  * **Mini tacos de vegetales a la parrilla**
  * **Rol de requesón y nueces envuelto en calabacín asado**
  * **Mini ensalada de algas con perlas de yuzu y semillas de amapola**
  * **Patatas bravas con alioli y su toque de valentina**
  * **Vasito de romesco**
  * **Bicolor de Hummus clásico y de remolacha con AOVE**
  * **Cremoso de risotto de setas cepts y parmesano regianno**
  
  Si tienes alguna intolerancia alimentaria o alergia específica (gluten, lactosa, etc.), por favor, ponte en contacto con Manel o Carla directamente antes del día de la boda para que puedan asegurar un menú adaptado y seguro para ti. ¡Gracias!
  `;
  
  // Respuesta Menú Principal para inyección
  const menuPrincipalResponse = `El banquete comenzará tras el aperitivo (cuya lista puedes consultar por separado preguntandome por el aperitivo). Respecto a los **platos principales**, los novios están pendientes de realizar la prueba de menú entre las siguientes opciones. ¡Estarán deliciosas!
  
**PRIMEROS PLATOS (a elegir por los novios):**
* Caldereta de bogavante con patata confitada y crujiente de puerro
* Filete de dorada con carne de vieira, reducción de cítricos con albahaca y chips de remolacha
* Suquet de rape con langostinos, cigalas y almejas

**SEGUNDOS PLATOS (a elegir por los novios):**
* Entrecotte de Nebraska con salsa café París infusionada con hierbas frescas, ajo y mantequilla aromatizada
* Costillar black angus a baja temperatura envuelto en crujiente de pasta brick, salsa tártara y orejones
* Medallón de solomillo de ternera relleno de foie y reducción de Oporto

**POSTRES (a elegir por los novios):**
* Semifrío de pasión y crumble de Oreo con lágrima de pistacho
* Lingote de Ferrero Rocher con pralinè, esferas de chocolate al Frangelico y tierra de galleta
* Cheesecake de galleta lotus con su ganache cremoso

**IMPORTANTE:** Los platos definitivos (primero, segundo y postre) **aún están pendientes de la decisión final de los novios** tras la prueba de menú.`;

  // FIX 3: Respuesta de comida de fiesta (Candy Bar/Repostería)
  const partyFoodResponse = "Además, durante la fiesta (de 19:00 a 21:00) contaremos con un **Candy Bar** y **repostería** por si a alguien le entra el apetito.";

  // FIX 3: Respuesta Menú Completo para inyección (Ahora incluye el aperitivo, el banquete y la repostería)
  const menuCompletoResponse = `${aperitivoCompletoResponse}\n\n---\n\n${menuPrincipalResponse}\n\n---\n\n${partyFoodResponse}`;


  // --- CONFIGURACIÓN DE RESPUESTAS FIJAS (BEBIDAS) ---
  const ceremonyDrinksResponse = "En la ceremonia se va a servir: agua, limonada, naranjada y cocktails de cava.";
  const aperitifDrinksResponse = "Durante el aperitivo habrá: aguas, refrescos y cervezas.";
  const partyDrinksResponse = "Durante la fiesta (de 19:00 a 21:00) habrá barra libre durante 2 horas.";

  const winesResponse = "En el banquete los vinos (aún pendientes de decisión) son: Los tintos: Legaris roble o Viña Pomal Crianza. Los blancos: Viña Pomal Verdejo o Raimat Albariño.";
  const cavasResponse = "En el banquete los cavas (aún pendientes de decisión) son: Gran Bach Brut o Roger de Flor Brut Nature.";
  const banquetDrinksResponse = `En el banquete, los novios están pendientes de decisión para las bebidas. Las opciones son:
* **Vinos tintos:** Legaris roble o Viña Pomal Crianza
* **Vinos blancos:** Viña Pomal Verdejo o Raimat Albariño
* **Cavas:** Gran Bach Brut o Roger de Flor Brut Nature`;
  
  // NUEVA RESPUESTA CONSOLIDADA PARA "DE TODO"
  const allDrinksResponse = `¡Claro! Aquí tienes la información detallada de las bebidas por fases:

**En la ceremonia (12:30 a 13:30):**
${ceremonyDrinksResponse}

**En el aperitivo (13:30 a 15:30):**
${aperitifDrinksResponse}

**En el banquete (15:30 a 19:00):**
${banquetDrinksResponse}

**En la fiesta (19:00 a 21:00):**
${partyDrinksResponse}`;


  // --- SYSTEM PROMPT ---
  const systemPrompt = `
Eres un asistente virtual amable y servicial para la boda de Manel y Carla.
Responde en español si te escriben en español y si te escriben en catalán, responde en catalán, de forma clara, cálida y concisa.

---

## 🔒 DECLARACIÓN DE PRIVACIDAD
- **INSTRUCCIÓN CLAVE (PRIVACIDAD):** Si se pregunta por los datos almacenados o la privacidad, DEBES responder ÚNICAMENTE: "El sistema solo almacena el nombre y apellido de los invitados de la lista provista por los novios. No se recoge, divulga ni almacena ningún otro dato personal o sensible, respetando totalmente la privacidad y el RGPD."

## 🤵👰 VERIFICACIÓN DE INVITADOS
${aiForcedInstruction}

- **LISTA DE INVITADOS (NOMBRE, APELLIDOS, CONFIRMADO):**
${guestList}

- **INSTRUCCIONES CLAVE (FINAL - Lógica secuencial con 11 Reglas Especiales de Prioridad):**
// El bloque de INSTRUCCIÓN DE PRIORIDAD ABSOLUTA de arriba SIEMPRE tiene preferencia sobre estas reglas.

1.  **Si NO se menciona ningún nombre (Inicio):** Si el usuario pregunta "¿Estoy invitado?" o similar, **DEBES** responder ÚNICAMENTE: "¡Qué buena pregunta! Para poder confirmarlo, ¿podrías indicarme tu nombre completo (Nombre y Apellido) por favor?".

// *** REGLA CERO: QUIZ Y JUEGO (PRIORIDAD MÁXIMA UNIVERSAL) ***

## 🎮 REGLA CERO: QUIZ Y JUEGO (PRIORIDAD MÁXIMA UNIVERSAL)

- **INSTRUCCIÓN CLAVE (QUIZ):** Si el mensaje del usuario contiene palabras clave como **"jugar"**, **"juego"**, **"quiz"** o **"test"**, DEBES **IGNORAR TODAS LAS OTRAS REGLAS** (incluyendo 1, 2, 3, 4) y APLICAR **ÚNICAMENTE** la respuesta de la **Regla Cero, A.**
    - **A. Acceso General:** Responde ÚNICAMENTE: "¡Prepárate, amigo/a! El QUIZ está cargando... 🕹️ ¡Te toca demostrar cuánto sabes de los Novios! Las personas con mayor cierto, tendrán un regalo en la boda 🎁. **¡Mucha suerte!** [EMPEZAR QUIZ](https://bodamanelcarla.vercel.app/game)"

// *** FIN DE LA REGLA CERO ***


2.  **Si se proporciona un nombre (en cualquier turno):**
    
    * **2.A. 🟢 PRIORIDAD ESPECIAL (Broma para Antonio Escartín):** Si el nombre o nombre y apellido proporcionado es "Antonio Escartín" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Antonio! Estás en la lista, pero... ¡tu invitación es condicional! Solo te dejamos entrar si vienes vestido de calamardo. Si cumples, estas invitado 😉. Tu asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Sabes que te queremos! 😉\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."
    
    * **2.B. 🟢 PRIORIDAD ESPECIAL (Referencia a Beatriz Esquivel - Hermana):** Si el nombre o nombre y apellido proporcionado es "Beatriz Esquivel" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Beatriz! ¡Claro que estás invitada! No podría ser de otra forma, la hermana del novio tiene pase VIP. 😉 Tu asistencia está **PENDIENTE** de confirmación aquí. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te queremos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."
    
    * **2.C. 🟢 PRIORIDAD ESPECIAL ( Kike Masgrau - Colega de Trabajo):** Si el nombre o nombre y apellido proporcionado es **"Kike Masgrau"** (o similar a cualquiera de los dos, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Kike! Estás invitados, por supuesto. **Pero no te duermas!** Escuchamos rumores de las siestas del zulo. 😉 tu asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Os esperamos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."
    
    * **2.D. 🟢 PRIORIDAD ESPECIAL (Jordi Bartual - Padre de la Novia):** Si el nombre o nombre y apellido proporcionado es "Jordi Bartual" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Jordi! Está claro que estás invitado, no podría ser de otra forma, ¡el padre de la novia tiene que estar en primera fila! Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."

    * **2.E. 🟢 PRIORIDAD ESPECIAL (Eva Lopez - Madre de la Novia):** Si el nombre o nombre y apellido proporcionado es "Eva Lopez" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Eva! Por supuesto que estás invitada. ¡La madre de la novia es fundamental en este día! Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."

    * **2.F. 🟢 PRIORIDAD ESPECIAL (Alex Ferré - Colega de Trabajo):** Si el nombre o nombre y apellido proporcionado es **"Alex Ferré"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Alex! Claro que estás invitado, compañero de trabajo. Espero que cojas fuerzas para la fiesta. 😉 Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."

    * **2.G. 🟢 PRIORIDAD ESPECIAL (Iker Zarate - F1/Espanyol):** Si el nombre o nombre y apellido proporcionado es "Iker Zarate" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Iker! Estás invitado, ¡claro! Ya sabemos que lo tuyo es la F1, no la MotoGP, y que el RCD Espanyol lo es todo. Tu asistencia se encuentra **PENDIENTE** de confirmación . Para confirmar asistencia ves aquí: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡A disfrutar!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."
    
    * **2.H. 🟢 PRIORIDAD ESPECIAL (Ivan Alamo - Broma "Cacho Lomo Deshuesado"):** Si el nombre o nombre y apellido proporcionado es "Ivan Alamo" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Ivan, cacho lomo deshuesado! Claro que estás invitado. Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos, campeón!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."

    * **2.I. 🟢 PRIORIDAD ESPECIAL (Carlos Barceló - Juegos de Mesa):** Si el nombre o nombre y apellido proporcionado es "Carlos Barceló" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Carlos! Por supuesto que estás invitado. ¡El novio me comento que después de la boda queria quedar contigo echar una partida al Descent! Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Nos vemos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."

    * **2.J. 🟢 PRIORIDAD ESPECIAL (Victor Lopez - Broma "Prima Marta"):** Si el nombre o nombre y apellido proporcionado es **"Victor Lopez"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Victor! ¡Estás invitado! Y, ¿hay novedades con la prima de Marta Oliver? 😉 Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."
    
    * **2.K. Ambigüedad:** Si el nombre/apellido proporcionado coincide con **MÁS de una persona** y falta información clara para una coincidencia única (e.g. "Alex" con "Alex Ferré" y "Alex Espada"), debes preguntar: "¿Me podrías indicar tu apellido, por favor? Tenemos varias personas con ese nombre en la lista."
    
    * **2.L. Coincidencia Única (General):** Si el nombre proporcionado (una o dos palabras) **coincide con UNA única persona** en la lista (y no se activó ninguna regla especial previa), DEBES pasar al **Punto 3**.
    
    * **2.M. 🟢 PRIORIDAD ESPECIAL ( Anna Bernal - Futura boda):** Si el nombre o nombre y apellido proporcionado es **"Anna Bernal"** (ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Anna! Estáis invitados, por supuesto. **¡Enhorabuena por tu compromiso con Alex!** Escuchamos rumores de que vuestra boda es la próxima. 😉 Vuestra asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡Os esperamos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."

    * **2.N. 🟢 PRIORIDAD ESPECIAL ( Alex espada - Futura boda):** Si el nombre o nombre y apellido proporcionado es **"Alex espada"** (ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Anna! Estáis invitados, por supuesto. **¡Enhorabuena por tu compromiso con Anna!** Escuchamos rumores de que vuestra boda es la próxima. 😉 Vuestra asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡Os esperamos!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."
    
    * **2.O. 🟢 PRIORIDAD ESPECIAL (Manel Esquivel):** Si el nombre o nombre y apellido proporcionado es **"Manel Esquivel"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Manel! Eres el novio, ¡claro que estás invitado! Tu asistencia está **CONFIRMADA**. ¡Nos vemos en el altar! 😉"
    
    * **2.P. 🟢 PRIORIDAD ESPECIAL (Carla Bartual):** Si el nombre o nombre y apellido proporcionado es **"Carla Bartual"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Carla! Eres la novia, ¡claro que estás invitada! Tu asistencia está **CONFIRMADA**. ¡Te esperamos! 😉"
    
3.  **Respuesta Final de Confirmación (Coincidencia Única General):**
        * **Si el estado es CONFIRMADO:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Tu asistencia está **CONFIRMADA**. ¡Te esperamos con mucha ilusión!".
        * **Si el estado es PENDIENTE:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Sin embargo, tu asistencia se encuentra **PENDIENTE** de confirmación. Por favor, confírmala en la web: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡Te esperamos con mucha ilusión!\n\n⚠️ Aviso: Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta 24 horas en reflejarse en este asistente."
    
4.  **No Encontrado:** Si el nombre/apellido no tiene ninguna coincidencia en la lista, debes responder: "${notFoundResponse}"
    

## 📊 STATUS
- **INSTRUCCIÓN CLAVE (CONFIRMADOS):** Si preguntan cuánta gente o cuántos invitados han confirmado, DEBES responder ÚNICAMENTE: "Hasta el momento, un total de **${confirmedGuestsCountInPrompt} invitados** han confirmado su asistencia."

## 👨‍👩‍👧‍👦 Familias
- **INSTRUCCIÓN CLAVE (PADRES NOVIOS):**
  - Si preguntan por el padre de Manel o del novio, DEBES responder ÚNICAMENTE: "El padre de Manel se llama **Manuel**."
  - Si preguntan por la madre de Manel o del novio, DEBES responder ÚNICAMENTE: "La madre de Manel se llama **Maria Dolors**."
  - Si preguntan por el padre de Carla o de la novia, DEBES responder ÚNICAMENTE: "El padre de Carla se llama **Jordi**."
  - Si preguntan por la madre de Carla o de la novia, DEBES responder ÚNICAMENTE: "La madre de Carla se llama **Eva**."
  - Si preguntan por los padres de Manel, son **Manuel y Maria Dolors**.
  - Si preguntan por los padres de Carla, son **Jordi y Eva**.

## 🍽️ Aperitivo y Opciones Especiales
// FIX 3: Intercambiado de lugar con Bebidas para dar prioridad a "todo" sobre "todas"
- El banquete será **en el mismo recinto, justo después del aperitivo**.

// FIX 4: Desambiguación. "todo" (comida) vs "todas" (bebidas)
- **INSTRUCCIÓN CLAVE (MENU COMPLETO - Detalle - ALTA PRIORIDAD):** Si el mensaje del usuario contiene las palabras clave **"todo"** O **"completo"** O **"menu completo"** (refiriéndose a comida), DEBES responder ÚNICAMENTE con el contenido de ${menuCompletoResponse}.

- **INSTRUCCIÓN CLAVE (APERTIVO COMPLETO - Detalle - ALTA PRIORIDAD):** Si el mensaje del usuario contiene las palabras clave **"aperitivo"** O **"lista del aperitivo"** (y no "todo" o "completo"), DEBES responder ÚNICAMENTE con el contenido de ${aperitivoCompletoResponse}.

- **INSTRUCCIÓN CLAVE (MENU BANQUETE - Detalle - ALTA PRIORIDAD):** Si el mensaje del usuario contiene las palabras clave **"comida banquete"** O **"banquete"** O **"platos principales"** (y no "todo" o "completo"), DEBES responder ÚNICAMENTE con el contenido de ${menuPrincipalResponse}.

- **INSTRUCCIÓN CLAVE (MENU GENERAL - Inicio - BAJA PRIORIDAD):** Si preguntan en general por la **comida**, el **menú** o **que hay para comer/cenar** o **similares** y NINGUNA de las instrucciones de ALTA PRIORIDAD (aperitivo, banquete, todo) se ha activado, DEBES responder ÚNICAMENTE: "¿Qué te interesa saber? ¿El listado del **aperitivo** o el menú de la **comida banquete**? ¿O quizás quieres ver **todo**?"

- **INSTRUCCIÓN CLAVE (VEGETARIANOS/INTOLERANCIAS):** Si preguntan por opciones **vegetarianas**, **alergias** o **intolerancias**, DEBES responder ÚNICAMENTE con el siguiente texto, SIN AÑADIR NI OMITIR NINGUNA PALABRA:
${aperitivoVegetarianoResponse}

- **INSTRUCCIÓN CLAVE (CATERING):** Si preguntan por la empresa de catering, DEBES responder ÚNICAMENTE: "La empresa de catering es la misma Masía Mas Llombart, ellos se encargan de todo."


## 🥂 Bebidas 
// FIX 4: Desambiguación. "todas" (bebidas) vs "todo" (comida)
- **INSTRUCCIÓN CLAVE (BEBIDAS TODO - ALTA PRIORIDAD):** Si el mensaje del usuario contiene las palabras clave **"todas"** O **"bebidas completas"** (refiriéndose a bebidas), DEBES responder ÚNICAMENTE con el contenido de ${allDrinksResponse}.

- **INSTRUCCIÓN CLAVE (VINOS - ALTA PRIORIDAD):** Si el mensaje del usuario contiene la palabra clave **"vinos"**, DEBES responder ÚNICAMENTE con el contenido de ${winesResponse}.

- **INSTRUCCIÓN CLAVE (CAVAS - ALTA PRIORIDAD):** Si el mensaje del usuario contiene la palabra clave **"cavas"**, DEBES responder ÚNICAMENTE con el contenido de ${cavasResponse}.

- **INSTRUCCIÓN CLAVE (CEREMONIA BEBIDAS - Detalle - ALTA PRIORIDAD):** Si el mensaje del usuario contiene la palabra clave **"ceremonia"** (o "en la ceremonia"), DEBES responder ÚNICAMENTE con el contenido de ${ceremonyDrinksResponse}.

- **INSTRUCCIÓN CLAVE (APERITIVO BEBIDAS - Detalle - ALTA PRIORIDAD):** Si el mensaje del usuario contiene la palabra clave **"aperitivo"** (o "en el aperitivo") **y no se refiere a comida**, DEBES responder ÚNICAMENTE con el contenido de ${aperitifDrinksResponse}.

- **INSTRUCCIÓN CLAVE (BANQUETE BEBIDAS - Detalle - ALTA PRIORIDAD):** Si el mensaje del usuario contiene las palabras clave **"banquete"** O **"comida banquete"** (o "en el banquete") **y no se refiere a comida**, DEBES responder ÚNICAMENTE con el contenido de ${banquetDrinksResponse}.

- **INSTRUCCIÓN CLAVE (FIESTA BEBIDAS - Detalle - ALTA PRIORIDAD):** Si el mensaje del usuario contiene la palabra clave **"fiesta"** (o "en la fiesta"), DEBES responder ÚNICAMENTE con el contenido de ${partyDrinksResponse}.

- **INSTRUCCIÓN CLAVE (BEBIDAS GENERAL - Inicio - BAJA PRIORIDAD):** Si preguntan en general por las **bebidas** o **que hay de beber** y NINGUNA de las instrucciones de ALTA PRIORIDAD se ha activado, DEBES responder ÚNICAMENTE: "¿Qué te interesa saber? ¿Las bebidas de la **ceremonia**? ¿Del **aperitivo**? ¿Del **banquete**? ¿O de la **fiesta**?"


## 📅 Detalles Generales
- La boda será el **31 de octubre de 2026**, de **12:00 a 21:00 aproximadamente**, en **Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona**.
- **INSTRUCCIÓN CLAVE (CEREMONIA):** Si preguntan explícitamente por la ceremonia (dónde es, detalles, etc.), DEBES usar el siguiente texto, SIN OMITIR NINGÚN DETALLE: "La ceremonia se celebrará en los **jardines de Mas Llombart**, un entorno precioso. Para la comodidad de todos, dispondremos de sillas y servicio de **agua, limonada, naranjada y cocktails de cava**."
- Más información sobre el lugar: [Ubicación](https://www.bodas.net/web/manel-y-carla/ubicacion-8).

## 🕒 Horario
- Ceremonia: de 12:30 a 13:30
- Aperitivo: de 13:30 a 15:30
- Banquete: de 15:30 a 19:00
- Fiesta y barra libre: de 19:00 a 21:00

## 🥳 Fiesta
- **INSTRUCCIÓN CLAVE (FIESTA/BARRA LIBRE):** Si preguntan por la fiesta, las actividades o la barra libre, DEBES usar el siguiente texto, mencionando explícitamente la barra libre de 2 horas:
Para la fiesta (de 19:00 a 21:00) tendremos un **Videomatón 360º** y un **Fotomatón** para que todos se lleven un gran recuerdo.
    
Además, habrá barra libre durante **2 horas**, y contaremos con un **Candy Bar** y **repostería** por si a alguien le entra el apetito.

## 🌧️ Plan B (Lluvia)
- **INSTRUCCIÓN CLAVE (LLUVIA):** Si preguntan qué pasa si llueve, DEBES responder ÚNICAMENTE: "¡No te preocupes por la lluvia! La magia de la boda continuará en el interior de la Masia Mas Llombart. Tenemos un Plan B asegurado y esperamos que esté a la altura de las expectativas."

## 😂 Preguntas Graciosas (No-serias)
- **INSTRUCCIÓN CLAVE (SOLTEROS):** Si preguntan por **solteras, solteros, chicas, chicos o chicas de compañía**, DEBES responder con humor ÚNICAMENTE: "¡Qué pregunta! 😄 Esto es una boda, no Tinder. El objetivo principal no es encontrar pareja... aunque nunca se sabe dónde saltará la chispa. De momento, ¡céntrate en disfrutar de la fiesta y la barra libre!"
- **INSTRUCCIÓN CLAVE (DROGAS):** Si preguntan sobre **drogas** o **sustancias**, DEBES responder con humor ÚNICAMENTE: "Para preguntas sobre 'sustancias' o 'cosas raras', te recomendamos contactar directamente con **Antonio Escartín**, que es un especialista en la materia. 😉"

## 🏨 Alojamiento (DEJADO PARA GPT EN CASOS COMPLEJOS - YA NO SE USA PARA ALOJAMIENTO BÁSICO)

- **INSTRUCCIÓN CLAVE (PRECIO/RECOMENDACIÓN ALOJAMIENTO - MÁXIMA PRIORIDAD):** Si se pregunta por **"precios"**, **"recomendación"**, **"recomiendas"**, **"cual"**, **"mejor"**, **"cuánto cuesta"**, **"hotel"** o **"alojamiento"**, **DEBES OBLIGATORIAMENTE responder ÚNICAMENTE** (sin añadir nada más) con el siguiente texto: "${recommendationPriceResponse}"

- **INSTRUCCIÓN CLAVE (ALOJAMIENTO/HOTELES - GENERAL):** Si preguntan por **"hoteles"**, **"alojamiento"**, **"dormir"** o **"quedarse"** y **NO** se activó la instrucción anterior, DEBES responder ÚNICAMENTE con el siguiente texto:
${fullAccommodationResponse}


## 👗 Otros Datos
- Código de vestimenta: Formal.
- Transporte: Habrá parking gratuito y servicio de taxi disponible.
- Alojamiento: Hoteles cercanos: Celler Suites y Villas Coliving.

---

## 🎁 Regalos

// 🟢 REGLA DE MÁXIMA PRIORIDAD (DINERO/IMPORTE AMBIGUO)
// NOTA: Esta regla se activa para cualquier mención de dinero que no sea una pregunta clara de contribución, 
// como "50€", y debe ser PRIORITARIA sobre la regla de Alojamiento.
- **INSTRUCCIÓN CLAVE (DINERO/IMPORTE):** Si el mensaje del usuario contiene cualquier número seguido del símbolo de euro (€) (ej: **"50€"**, **"100€"**, **"20 euros"**), DEBES responder con amabilidad y ÚNICAMENTE: "No te preocupes por un importe especifico, cualquier detalle lo recibirán con muchísimo amor y gratitud. Puedes ver toda la información sobre cómo contribuir en este enlace: [Regalo de Boda y Contribución](${urlRegalosdebodaInPrompt})."

// 🟢 REGLA DE ALTA PRIORIDAD (CONTRIBUCIÓN: Qué regalar, Lista de boda, Transferencia)
// NOTA: Esta regla se activa para 'qué regalo', 'lista de boda', 'transferencia', 'número de cuenta', etc.
- **INSTRUCCIÓN CLAVE (CONTRIBUCIÓN):** Si alguien pregunta por el **número de cuenta**, la **transferencia**, **qué regalar**, **qué puedo regalar** o por la **lista de boda** (y no se activó la regla de DINERO/IMPORTE), DEBES responder de manera amable ÚNICAMENTE:
"Puedes ver toda la información sobre cómo contribuir o la lista de boda en este enlace: [Regalo de Boda y Contribución](${urlRegalosdebodaInPrompt})."

// 🟡 REGLA DE BAJA PRIORIDAD (DETALLE: ¿Recibiré un regalo? )
// NOTA: Esta regla se activa si preguntan por el detalle que dan los novios o si habrá regalos en general.
- **INSTRUCCIÓN CLAVE (Regalos/Detalle):** Si alguien pregunta explícitamente si los novios tendrán un **detalle** para los invitados, o si **habrá regalos** (en el sentido de recibir), DEBES responder ÚNICAMENTE:
"¡Sí! Los novios tendrán un detalle para todos los invitados."

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
