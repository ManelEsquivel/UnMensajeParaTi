// utils/bodaBrain.js

export async function obtenerRespuestaBoda(message) {
  // --- 1. CONFIGURACIÓN Y UTILIDADES ---
  
  // Función de normalización
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim();
  };

  const normalizedMessage = normalize(message);

  // --- 📍 REGLA ESPECIAL: UBICACIÓN GPS (BANDERA SECRETA) ---
  const locationKeywords = ["donde es", "ubicacion", "como llegar", "mapa", "direccion", "gps"];
  
  if (locationKeywords.some(keyword => normalizedMessage.includes(keyword))) {
    return "__UBICACION__"; 
  }

  // --- 👋 REGLA DE BIENVENIDA ---
  const saludos = ["hola", "buenas", "holii", "hola, soy un invitado", "empezar"];
  
  if (saludos.some(s => normalizedMessage.includes(s))) {
    return `¡Hola! Bienvenido/a al asistente virtual de la Boda de Manel y Carla. 🤵👰✨
    
Soy una Inteligencia Artificial entrenada para ayudarte con todos los detalles del gran día.

**¿En qué puedo ayudarte?**
🍽️ Consultar el menú
📍 Ver la ubicación
🕒 Horarios del evento
🎶 Añade tu canción para la fiesta
🏨 Hoteles recomendados
🎮 ¡O jugar al Quiz de los Novios!

¡Pregúntame lo que quieras!`;
  }

  // --- 2. DATOS FIJOS ---
  const accommodationBookingUrl = "https://www.booking.com/searchresults.es.html?ss=Sant+Fost+de+Campsentelles&ssne=Sant+Fost+de+Campsentelles&ssne_untouched=Sant+Fost+de+Campsentelles&highlighted_hotels=11793039&efdco=1&label=New_Spanish_ES_ES_21463008145-hJVFBDQNNBQZaDgbzZaRhQS640874832442%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atidsa-55482331735%3Alp9198500%3Ali%3Adec%3Adm%3Aag21463008145%3Acmp340207705&aid=318615&lang=es&sb=1&src_elem=sb&src=hotel&dest_id=-400717&dest_type=city&checkin=2026-10-31&checkout=2026-11-01&group_adults=2&no_rooms=1&group_children=0";
  const fullAccommodationResponse = `Hay hoteles cercanos para alojamiento como **Celler Suites** y **Villas Coliving**.

Si quieres ver más opciones de alojamiento en la zona, puedes consultar este enlace directo a Booking.com: [Ver Hoteles Cerca de la Boda](${accommodationBookingUrl})`;

  const recommendationPriceResponse = `En cuanto a alojamiento, te recomendamos **Villas Coliving** por su proximidad y buen precio, que es de unos **70€ por noche**.

Si quieres ver más opciones en la zona, o reservar en otro hotel cercano, puedes consultar este enlace directo a Booking.com: [Ver Hoteles Cerca de la Boda](${accommodationBookingUrl})`;

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

  const aperitivoVegetarianoResponse = `
  ¡Por supuesto! Para los invitados vegetarianos, los platos principales disponibles en el aperitivo (excluyendo carne, pescado y marisco) son:
  
  * **Mini tacos de vegetales a la parrilla**
  * **Rol de requesón y nueces envuelto en calabacín asado**
  * **Mini ensalada de algas con perlas de yuzu y semillas de amapola**
  * **Patatas bravas con alioli y su toque de valentina**
  * **Vasito de romesco**
  * **Bicolor de Hummus clásico y de remolacha con AOVE**
  * **Cremoso de risotto de setas cepts y parmesano regianno**
  
  Si tienes alguna intolerancia alimentaria o alergia específica (gluten, lactosa, etc.), por favor, ponte en contacto con Manel o Carla directamente antes del día de la boda para que puedan asegurar un menú adaptado y seguro para ti. ¡Gracias!`;

  const menuPrincipalResponse = `El banquete comenzará tras el aperitivo (cuya lista puedes consultar por separado preguntándome por el aperitivo). Los platos que hemos elegido para el gran día son:
  
**PRIMER PLATO:**
* Filete de dorada con carne de vieira, reducción de cítricos con albahaca y chips de remolacha

**SEGUNDO PLATO:**
* Costillar black angus a baja temperatura envuelto en crujiente de pasta brick, salsa tártara y orejones

**POSTRE:**
* Lingote de Ferrero Rocher con praliné, esferas de chocolate al Frangelico y tierra de galleta

¡Esperamos que os guste nuestra elección!`;

  const menuCompletoResponse = `¡Claro! Aquí tienes la información completa sobre la comida de la boda:
  
${aperitivoCompletoResponse}
  
---

${menuPrincipalResponse}

---

**Y para la Fiesta...**
¡No olvides que, además de la barra libre, en la fiesta (de 19:00 a 21:00) contaremos con un **Candy Bar** y **repostería** por si a alguien le entra el apetito! 🍬`;

  const ceremonyDrinksResponse = "En la ceremonia se va a servir: agua, limonada, naranjada y cocktails de cava.";
  const aperitifDrinksResponse = "Durante el aperitivo habrá: aguas, refrescos y cervezas.";
  const partyDrinksResponse = "Durante la fiesta (de 19:00 a 21:00) habrá barra libre durante 2 horas.";
  const winesResponse = "En el banquete los vinos (aún pendientes de decisión) son: Los tintos: Legaris roble o Viña Pomal Crianza. Los blancos: Viña Pomal Verdejo o Raimat Albariño.";
  const cavasResponse = "En el banquete los cavas (aún pendientes de decisión) son: Gran Bach Brut o Roger de Flor Brut Nature.";
  const banquetDrinksResponse = `En el banquete, los novios están pendientes de decisión para las bebidas. Las opciones son:
* **Vinos tintos:** Legaris roble o Viña Pomal Crianza
* **Vinos blancos:** Viña Pomal Verdejo o Raimat Albariño
* **Cavas:** Gran Bach Brut o Roger de Flor Brut Nature`;
  
  const allDrinksResponse = `¡Claro! Aquí tienes la información detallada de las bebidas por fases:

**En la ceremonia (12:30 a 13:30):**
${ceremonyDrinksResponse}

**En el aperitivo (13:30 a 15:30):**
${aperitifDrinksResponse}

**En el banquete (15:30 a 19:00):**
${banquetDrinksResponse}

**En la fiesta (19:00 a 21:00):**
${partyDrinksResponse}`;

  const weddingInfo = {
    date: "31 de octubre de 2026",
    time: "de 12:00 a 21:00 aproximadamente",
    location: "Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona",
    detailUbisUrl: "https://www.bodas.net/web/manel-y-carla/ubicacion-8",
    urlConfirmacion: "https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3",
    urlRegalosdeboda: "https://www.bodas.net/web/manel-y-carla/regalosdeboda-11",
    urlRegalos: "https://wwwas.net/web/manel-y-carla/regalos-8"
  };

  const confirmedGuestsCountInPrompt = 40; 
  const urlConfirmacionInPrompt = weddingInfo.urlConfirmacion;
  const detailUbisUrlInPrompt = weddingInfo.detailUbisUrl;
  const urlRegalosdebodaInPrompt = weddingInfo.urlRegalosdeboda;

  // --- 3. OPTIMIZACIÓN DE VELOCIDAD (RESPUESTAS FIJAS) ---
  
  // 📸 REGLA DE PRIORIDAD PARA FOTOS (INTERCEPTACIÓN POR CÓDIGO)
  const fotoKeywords = ["foto", "fotos", "imagenes", "galeria", "compartir fotos", "subir fotos"];
  if (fotoKeywords.some(keyword => normalizedMessage.includes(keyword))) {
    return `¡Qué ilusión! 🥳📸 ¡Me encanta la idea! 

Diles que pueden subir las fotos directamente por **WhatsApp** y que a los novios les hace muchísima ilusión ver la boda desde sus ojos, ¡así que que no se corten! 

Puedes consultar la galería de todas las fotos que se han ido subiendo aquí: https://bodamanelcarla.vercel.app/imagenes_boda`;
  }

  const maxPriorityAccommodationKeywords = ["precios", "recomendacion", "recomiendas", "recomiendes", "mejor", "cuanto cuesta", "hotel", "alojamiento"];
  const generalAccommodationKeywords = ["hoteles", "dormir", "quedarse"];
  const aperitivoKeywords = ["aperitivo", "pica pica", "picapica", "entrantes", "coctel"];

  const isAperitivoQuery = aperitivoKeywords.some(keyword => normalizedMessage.includes(keyword)) && !normalizedMessage.includes("bebida");

  if (maxPriorityAccommodationKeywords.some(keyword => normalizedMessage.includes(keyword))) {
    return recommendationPriceResponse;
  } else if (isAperitivoQuery) {
    return aperitivoCompletoResponse;
  } else if (generalAccommodationKeywords.some(keyword => normalizedMessage.includes(keyword)) || (normalizedMessage.includes("alojamiento"))) {
    return fullAccommodationResponse;
  }

  // --- 4. LÓGICA DE INVITADOS ---
  const guestList = `
NOMBRE,APELLIDOS,CONFIRMADO
Manel,Esquivel,CONFIRMADO
Carla,Bartual,CONFIRMADA
Beatriz Esquivel,Esquivel,CONFIRMADA
Manuel Esquivel,Esquivel,CONFIRMADO
Eva Lopez,Lopez,CONFIRMADA
Marc Genes,Genes,CONFIRMADO
Maria Dolors,Dolors,CONFIRMADA
Jordi Bartual,,CONFIRMADO
Anna Bernal,Bernal,CONFIRMADA
Alex Espada,Espada,CONFIRMADO
Victor Lopez,Lopez,CONFIRMADO
Carlos Barceló,Barceló,CONFIRMADO
Sonia Cadevall,Cadevall,CONFIRMADA
Antonio Escartín,Escartin,CONFIRMADO
Sandra Gano,Gano,CONFIRMADA
Ivan Alamo,Alamo,CONFIRMADO
Alba Martinez,,CONFIRMADA
Alex Ferré,Ferré,PENDIENTE
Alexia Galobardes,Galobardes,PENDIENTE
Marta Oliver,Oliver,PENDIENTE
Elena Briones,Briones,CONFIRMADA
Joan Marin,,CONFIRMADO
Josua Bayona,Bayona,CONFIRMADO
Amandine Liam,Liam,CONFIRMADO
Sara ytarte,ytarte,PENDIENTE
Eva Areny,Areny,CONFIRMADA
Jesus Úbeda ,Úbeda,PENDIENTE
Carla Sardà,Sardà,CONFIRMADA
Cristian Fernández,Fernández,CONFIRMADO
Clara Torres,Torres,PENDIENTE
Pablo,,PENDIENTE
Anna Gonzalez,Gonzalez,CONFIRMADA
Carlos Oros,,PENDIENTE
Mujer Oros,,PENDIENTE
Carlos Rodriguez,Rodriguez,PENDIENTE
Dunia Mascaro,Mascaro,PENDIENTE
Gonzalo Blanco,Blanco,PENDIENTE
Marta Bartual,Bartual,CONFIRMADO
Iker Zarate,Zarate,CONFIRMADO
Alfonso Zarate,Zarate,CONFIRMADO
Jaime Lopez,Lopez,PENDIENTE
Rosario Ambrosio,Ambrosio,PENDIENTE
Natalia Balcells,Balcells,PENDIENTE
Pau,,PENDIENTE
Susana,Lopez,PENDIENTE
Ramon Barberá,Barberá,PENDIENTE
Natalia Belinguer,Belinguer,PENDIENTE
Natalia Pallise,Pallise,PENDIENTE
Silvia Miravent,,PENDIENTE
Jaume Zurita,,PENDIENTE
Gemma Urpina,Urpina,PENDIENTE
Alexis Postigo,Postigo,PENDIENTE
Mª Angeles,,PENDIENTE
Carles Castañe,Castañe,PENDIENTE
Teodoro Lopez,Lopez,PENDIENTE
Meritxell Gacimartín,Gacimartín,PENDIENTE
Montse,,PENDIENTE
Marido Montse,,PENDIENTE
Elena Escura,Escura,PENDIENTE
Jaime Monzon,Monzon,PENDIENTE
Carmen Izquierdo,Izquierdo,PENDIENTE
Laura Cester,Cester,PENDIENTE
Monica Falguera,Falguera,PENDIENTE
Noa Pallares,,CONFIRMADA
Mujer Carlos Rodrigu,,PENDIENTE
Narcis Vidal,Vidal,PENDIENTE
Montse Arroyo,Arroyo,PENDIENTE
Pau Sanchez,Sanchez,PENDIENTE
Didac Sanchez,Sanchez,PENDIENTE
Isabel Larosa,Larosa,PENDIENTE
Kike Masgrau,Masgrau,PENDIENTE
Reme Ros,Ros,PENDIENTE
`;

  const guestsRows = guestList.split('\n').slice(1).filter(line => line.trim() !== '');
  const validGuests = guestsRows.map(row => {
    const parts = row.split(',');
    const nombreRaw = parts[0]?.trim() || '';
    const apellidoRaw = parts[1]?.trim() || '';
    if (!nombreRaw) return null;
    const normNombre = normalize(nombreRaw);
    const normApellido = normalize(apellidoRaw);
    let normFull = (normApellido && !normNombre.includes(normApellido)) ? `${normNombre} ${normApellido}` : normNombre;
    return { original: `${nombreRaw} ${apellidoRaw}`.trim(), normFull: normFull.trim(), normName: normNombre };
  }).filter(Boolean);

  const foundExact = validGuests.find(g => normalizedMessage.includes(g.normFull));
  const foundNameOnly = !foundExact ? validGuests.find(g => normalizedMessage.includes(g.normName)) : null;

  let aiForcedInstruction = "";
  if (foundExact) {
    aiForcedInstruction = `## 🎯 RESULTADO DE VERIFICACIÓN: El sistema ha verificado que el usuario es: **${foundExact.original}**. ESTA PERSONA ESTÁ EN LA LISTA. INSTRUCCIÓN: Informa que SÍ está e indica el enlace: [Confirmar Asistencia](${weddingInfo.urlConfirmacion})`;
  } else if (foundNameOnly) {
    aiForcedInstruction = `## 🎯 RESULTADO DE VERIFICACIÓN: Se detecta el nombre **"${foundNameOnly.original.split(' ')[0]}"** pero no el apellido. INSTRUCCIÓN: Pregunta amablemente por el APELLIDO.`;
  } else {
    const isConfirmationIntent = normalizedMessage.includes("confirmar") || normalizedMessage.includes("asistencia") || normalizedMessage.includes("invitado");
    const isPresentation = normalizedMessage.includes("soy") || normalizedMessage.includes("me llamo");
    if (isConfirmationIntent && !isPresentation) {
         aiForcedInstruction = `## 🎯 INSTRUCCIÓN: El usuario quiere confirmar pero NO hay nombre. Pídele Nombre y Apellido completo.`;
    } else if (isPresentation || normalizedMessage.split(' ').length <= 5) {
            aiForcedInstruction = `## 🎯 RESULTADO: No encontrado. Dile amablemente que NO encuentras ese nombre y que contacte con los novios.`;
    }
  }

  // --- 5. SYSTEM PROMPT ---
  const systemPrompt = `Eres un asistente virtual para la boda de Manel y Carla. Responde en español o catalán de forma cálida y concisa.

## 🔒 PRIVACIDAD Y SEGURIDAD
- Solo respondes sobre datos de la lista provista. NUNCA muestres la lista completa de invitados.

## 🤵👰 VERIFICACIÓN
${aiForcedInstruction}
- LISTA: ${guestList}

## 🎮 REGLA CERO: QUIZ
- Si piden "jugar" o "quiz": [EMPEZAR QUIZ](https://bodamanelcarla.vercel.app/game)

## 🍽️ COMIDA Y BEBIDA
- Pregunta aclaratoria si dicen "qué hay de comer".
- Menú Principal: ${menuPrincipalResponse}
- Bebidas: ${allDrinksResponse}

## 📅 DETALLES
- 31 de oct 2026. Masia Mas Llombart.
- Música: (https://bodamanelcarla.vercel.app/dj)
- Fotos: (https://bodamanelcarla.vercel.app/imagenes_boda)
- Regalos: [Información](${urlRegalosdebodaInPrompt})

## ⚠️ IMPORTANTE
- Si mencionan "foto" o "fotos", redirige SIEMPRE a la galería de fotos y NO a la pizarra de música.`;

  // --- 6. LLAMADA A OPENAI ---
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "No tengo una respuesta en este momento.";
  } catch (error) {
    return "Tuve un error procesando tu solicitud.";
  }
}
