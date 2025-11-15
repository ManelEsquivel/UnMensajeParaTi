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

  // --- PROCESAMIENTO DE NOMBRES EN JAVASCRIPT (Solo para INYECCIÓN de Prioridad Absoluta) ---

  const normalizedMessage = normalize(message);
  const messageWords = normalizedMessage
    .replace(/[.,;:!?¡¿'"()]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  // Stop words para filtrar frases conversacionales (soy, me llamo, etc.)
  const stopWords = new Set(['soy', 'me', 'llamo', 'mi', 'nombre', 'es', 'yo', 'la', 'el', 'los', 'las', 'un', 'una', 'de', 'del', 'al', 'o', 'y', 'si', 'no', 'que', 'en', 'para', 'invitado', 'lista', 'asistencia', 'confirmacion', 'a', 'e', 'mis']);
  
  // Palabras relevantes para la búsqueda (excluyendo stop words)
  const nameLikeWords = messageWords.filter(word => !stopWords.has(word));
  const relevantQuery = nameLikeWords.join(' ');

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

  // --- CONDICIONAL PROMPT INJECTION (FORZAR LA REGLA) ---
  const NO_NAME_VERIFICATION_NEEDED = "¡VERIFICACIÓN DE NOMBRE REQUERIDA PARA ACCESO AL QUIZ!";

  let aiForcedInstruction = `
## 🎯 INSTRUCCIÓN DE PRIORIDAD ABSOLUTA (¡Generada por JS!)
${NO_NAME_VERIFICATION_NEEDED}
`; // <-- MENSAJE CLARO Y ÚNICO PARA CUANDO NO SE ENCUENTRA INVITADO.

  if (forcedGuest) {
      const guestName = forcedGuest.nombre;
      const guestSurname = forcedGuest.apellido;
      const guestStatus = forcedGuest.confirmado;
      const fullName = `${guestName} ${guestSurname}`.trim();
      
      // *** INSTRUCCIÓN LIMPIA: SÓLO PARA CONFIRMACIÓN DE NOMBRE (EL QUIZ ES UNIVERSAL Y ES GESTIONADO POR REGLA CERO) ***
      aiForcedInstruction = `
      ## 🎯 INSTRUCCIÓN DE PRIORIDAD ABSOLUTA (¡Generada por JS!)
      El mensaje del usuario ha sido analizado por el backend y se ha identificado a un ÚNICO invitado:
      - Nombre Completo: **${fullName}**
      - Estado: **${guestStatus}**
      
      **TU TAREA ES LA SIGUIENTE, EN ESTE ORDEN:**
      
      1.  IGNORA la Regla 1, Regla Cero, Regla 2.K y Regla 4.
      2.  BUSCA la coincidencia para "${fullName}" SÓLO en las Reglas Especiales (2.A a 2.J).
      3.  **Si encuentras una coincidencia en 2.A-2.J, APLICA esa regla ÚNICAMENTE.**
      4.  Si NO encuentras una coincidencia en 2.A-2.J, APLICA la Regla 3 usando el estado "${guestStatus}" y el nombre "${fullName}" para generar la respuesta.
      
      ¡NO vuelvas a preguntar el nombre ni digas que no lo encuentras!
      `;
  }
  // --- FIN DE INYECCIÓN ---

  // --- CONFIGURACIÓN DE RESPUESTAS FIJAS (COMIDA) ---
  const confirmedGuestsCountInPrompt = confirmedGuestsCount;
  const urlConfirmacionInPrompt = weddingInfo.urlConfirmacion;
  const detailUbisUrlInPrompt = weddingInfo.urlConfirmacion;
  const urlRegalosdebodaInPrompt = weddingInfo.urlRegalosdeboda;
  const urlRegalosInPrompt = weddingInfo.urlRegalos;
  
  // --- NUEVA VARIABLE DE AVISO DE 24 HORAS (para inyectar en las reglas) ---
  const twentyFourHourNotice = `<br/>
  <br/>
  ⚠️ **Aviso:** Una vez confirmada tu asistencia en el enlace, los cambios pueden tardar hasta **24 horas** en reflejarse en este asistente.`;

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

  // Respuesta Menú Completo para inyección
  const menuCompletoResponse = `${aperitivoCompletoResponse}\n\n---\n\n${menuPrincipalResponse}`;

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
    - **A. Acceso General:** Responde ÚNICAMENTE: "¡Prepárate, amigo/a! El QUIZ está cargando... 🕹️ ¡Te toca demostrar cuánto sabes de Manel y Carla! Si aciertas, tendrás una sorpresa. **¡Mucha suerte!** [EMPEZAR QUIZ](https://bodamanelcarla.vercel.app/quizboda)"

// *** FIN DE LA REGLA CERO ***


2.  **Si se proporciona un nombre (en cualquier turno):**
    
    * **2.A. 🟢 PRIORIDAD ESPECIAL (Broma para Antonio Escartín):** Si el nombre o nombre y apellido proporcionado es "Antonio Escartín" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Antonio! Estás en la lista, pero... ¡tu invitación es condicional! Solo te dejamos entrar si vienes vestido de calamardo. Si cumples, estas invitado 😉. Tu asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Sabes que te queremos! 😉${twentyFourHourNotice}"
    
    * **2.B. 🟢 PRIORIDAD ESPECIAL (Referencia a Beatriz Esquivel - Hermana):** Si el nombre o nombre y apellido proporcionado es "Beatriz Esquivel" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Beatriz! ¡Claro que estás invitada! No podría ser de otra forma, la hermana del novio tiene pase VIP. 😉 Tu asistencia está **PENDIENTE** de confirmación aquí. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te queremos!${twentyFourHourNotice}"
    
    * **2.C. 🟢 PRIORIDAD ESPECIAL ( Kike Masgrau - Colega de Trabajo):** Si el nombre o nombre y apellido proporcionado es **"Kike Masgrau"** (o similar a cualquiera de los dos, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Kike! Estás invitados, por supuesto. **Pero no te duermas!** Escuchamos rumores de las siestas del zulo. 😉 tu asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Os esperamos!${twentyFourHourNotice}"
    
    * **2.D. 🟢 PRIORIDAD ESPECIAL (Jordi Bartual - Padre de la Novia):** Si el nombre o nombre y apellido proporcionado es "Jordi Bartual" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Jordi! Está claro que estás invitado, no podría ser de otra forma, ¡el padre de la novia tiene que estar en primera fila! Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!${twentyFourHourNotice}"

    * **2.E. 🟢 PRIORIDAD ESPECIAL (Eva Lopez - Madre de la Novia):** Si el nombre o nombre y apellido proporcionado es "Eva Lopez" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Eva! Por supuesto que estás invitada. ¡La madre de la novia es fundamental en este día! Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!${twentyFourHourNotice}"

    * **2.F. 🟢 PRIORIDAD ESPECIAL (Alex Ferré - Colega de Trabajo):** Si el nombre o nombre y apellido proporcionado es **"Alex Ferré"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Alex! Claro que estás invitado, compañero de trabajo. Espero que cojas fuerzas para la fiesta. 😉 Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!${twentyFourHourNotice}"

    * **2.G. 🟢 PRIORIDAD ESPECIAL (Iker Zarate - F1/Espanyol):** Si el nombre o nombre y apellido proporcionado es "Iker Zarate" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Iker! Estás invitado, ¡claro! Ya sabemos que lo tuyo es la F1, no la MotoGP, y que el RCD Espanyol lo es todo. Tu asistencia se encuentra **PENDIENTE** de confirmación . Para confirmar asistencia ves aquí: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡A disfrutar!${twentyFourHourNotice}"
    
    * **2.H. 🟢 PRIORIDAD ESPECIAL (Ivan Alamo - Broma "Cacho Lomo Deshuesado"):** Si el nombre o nombre y apellido proporcionado es "Ivan Alamo" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Ivan, cacho lomo deshuesado! Claro que estás invitado. Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos, campeón!${twentyFourHourNotice}"

    * **2.I. 🟢 PRIORIDAD ESPECIAL (Carlos Barceló - Juegos de Mesa):** Si el nombre o nombre y apellido proporcionado es "Carlos Barceló" (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Carlos! Por supuesto que estás invitado. ¡El novio me comento que después de la boda queria quedar contigo echar una partida al Descent! Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Nos vemos!${twentyFourHourNotice}"

    * **2.J. 🟢 PRIORIDAD ESPECIAL (Victor Lopez - Broma "Prima Marta"):** Si el nombre o nombre y apellido proporcionado es **"Victor Lopez"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Victor! ¡Estás invitado! Y, ¿hay novedades con la prima de Marta Oliver? 😉 Tu asistencia se encuentra **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia](${urlConfirmacionInPrompt}). ¡Te esperamos!${twentyFourHourNotice}"
    
    * **2.K. Ambigüedad:** Si el nombre/apellido proporcionado coincide con **MÁS de una persona** y falta información clara para una coincidencia única (e.g. "Alex" con "Alex Ferré" y "Alex Espada"), debes preguntar: "¿Me podrías indicar tu apellido, por favor? Tenemos varias personas con ese nombre en la lista."
    
    * **2.L. Coincidencia Única (General):** Si el nombre proporcionado (una o dos palabras) **coincide con UNA única persona** en la lista (y no se activó ninguna regla especial previa), DEBES pasar al **Punto 3**.
    
    * **2.M. 🟢 PRIORIDAD ESPECIAL ( Anna Bernal - Futura boda):** Si el nombre o nombre y apellido proporcionado es **"Anna Bernal"** (ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Anna! Estáis invitados, por supuesto. **¡Enhorabuena por tu compromiso con Alex!** Escuchamos rumores de que vuestra boda es la próxima. 😉 Vuestra asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡Os esperamos!${twentyFourHourNotice}"

    * **2.N. 🟢 PRIORIDAD ESPECIAL ( Alex espada - Futura boda):** Si el nombre o nombre y apellido proporcionado es **"Alex espada"** (ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Anna! Estáis invitados, por supuesto. **¡Enhorabuena por tu compromiso con Anna!** Escuchamos rumores de que vuestra boda es la próxima. 😉 Vuestra asistencia está **PENDIENTE** de confirmación. Para confirmar asistencia ves aquí: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡Os esperamos!${twentyFourHourNotice}"
    
    * **2.O. 🟢 PRIORIDAD ESPECIAL (Manel Esquivel):** Si el nombre o nombre y apellido proporcionado es **"Manel Esquivel"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Manel! Eres el novio, ¡claro que estás invitado! Tu asistencia está **CONFIRMADA**. ¡Nos vemos en el altar! 😉"
    
    * **2.P. 🟢 PRIORIDAD ESPECIAL (Carla Bartual):** Si el nombre o nombre y apellido proporcionado es **"Carla Bartual"** (o similar, ignorando mayúsculas/tildes), **DEBES** responder ÚNICAMENTE: "¡Carla! Eres la novia, ¡claro que estás invitada! Tu asistencia está **CONFIRMADA**. ¡Te esperamos! 😉"
    
3.  **Respuesta Final de Confirmación (Coincidencia Única General):**
        * **Si el estado es CONFIRMADO:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Tu asistencia está **CONFIRMADA**. ¡Te esperamos con mucha ilusión!".
        * **Si el estado es PENDIENTE:** "¡Sí, [Nombre] [Apellido], estás en la lista de invitados! Sin embargo, tu asistencia se encuentra **PENDIENTE** de confirmación. Por favor, confírmala en la web: [Confirmar Asistencia Aquí](${urlConfirmacionInPrompt}). ¡Te esperamos con mucha ilusión!${twentyFourHourNotice}".
    
4.  **No Encontrado:** Si el nombre/apellido no tiene ninguna coincidencia en la lista, debes responder: "Lo siento mucho, pero no encuentro tu nombre en la lista de invitados. Si crees que puede ser un error, por favor, contacta directamente con Manel o Carla."
    

## 📊 STATUS
// ... (El resto del systemPrompt sigue igual) ...
// ...
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125", // <-- CAMBIO 1: Modelo optimizado para velocidad y coste.
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7, // <-- CAMBIO 2: Temperatura ajustada para respuestas deterministas y rápidas.
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
