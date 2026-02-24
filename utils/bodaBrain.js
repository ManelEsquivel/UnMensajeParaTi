// utils/bodaBrain.js

export async function obtenerRespuestaBoda(message) {
  // --- 1. CONFIGURACIÓN Y UTILIDADES ---
  
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim();
  };

  const normalizedMessage = normalize(message);

  // --- 📸 REGLA DE ORO: FOTOS (INTERCEPTACIÓN PRIORITARIA) ---
  // Esta regla va ANTES que la IA para que "añadir fotos" no se confunda con "añadir canciones"
  const fotoKeywords = ["foto", "fotos", "imagenes", "galeria", "subir foto", "añadir foto", "poner foto", "compartir fotos"];
  
  if (fotoKeywords.some(keyword => normalizedMessage.includes(keyword))) {
    return `¡Qué ilusión! 🥳📸 ¡Me encanta la idea! 

Podéis subir las fotos directamente por **WhatsApp**. A los novios les hace muchísima ilusión ver la boda desde vuestros ojos, ¡así que no os cortéis! 

Podéis consultar la galería de todas las fotos que se han ido subiendo aquí: https://bodamanelcarla.vercel.app/imagenes_boda`;
  }

  // --- 📍 REGLA ESPECIAL: UBICACIÓN GPS ---
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
🎮 ¡O jugar al Quiz de los Novios!`;
  }

  // --- 2. DATOS FIJOS (MENÚS Y BEBIDAS) ---
  const aperitivoCompletoResponse = `¡Claro! Para el aperitivo, habrá una gran variedad de platos deliciosos:
* Roll de salmón ahumado, con crema de anchoas
* Crostini de escalivada asada con ventresca de atún
* Mini tacos de vegetales a la parrilla
* Trufa de foie con crocante de almendra
* Cazuela gourmet de pasta ragú
* Rol de requesón y nueces con calabacín
* Mini ensalada de algas y yuzu
* Chupito de mazamorra cordobesa
* Croquetas de pulpo gallego
* Crocanti de pollo caramelizado
* Patatas bravas con alioli
* Trilogía de hamburguesas (pollo, ternera y quinoa)
* Tiras de calamar crujiente
* Bocado de jamón de guijuelo en croqueta
* Vasito de romesco y Hummus bicolor
* Risotto de setas ceps y parmesano
* Gamba crujiente con jamón ibérico
* Perla de bacalao con all i oli

Además, tendremos Showcooking: Jamón al corte, carnes a la brasa, zamburiñas, almejas y navajas.`;

  const menuPrincipalResponse = `El banquete principal consiste en:
  
**PRIMER PLATO:**
* Filete de dorada con carne de vieira, reducción de cítricos con albahaca y chips de remolacha

**SEGUNDO PLATO:**
* Costillar black angus a baja temperatura envuelto en crujiente de pasta brick, salsa tártara y orejones

**POSTRE:**
* Lingote de Ferrero Rocher con praliné, esferas de chocolate al Frangelico y tierra de galleta`;

  const allDrinksResponse = `Aquí tienes la información de las bebidas:
- **Ceremonia:** Agua, limonada, naranjada y cocktails de cava.
- **Aperitivo:** Aguas, refrescos y cervezas.
- **Banquete:** Vinos (Tintos: Legaris o Viña Pomal / Blancos: Viña Pomal o Raimat) y Cavas (Gran Bach o Roger de Flor).
- **Fiesta:** Barra libre durante 2 horas.`;

  const accommodationResponse = `Te recomendamos **Villas Coliving** (aprox. 70€/noche) por su cercanía. También tienes **Celler Suites**. Puedes ver más opciones aquí: [Booking.com](https://www.booking.com/searchresults.es.html?ss=Sant+Fost+de+Campsentelles&checkin=2026-10-31&checkout=2026-11-01)`;

  const weddingInfo = {
    date: "31 de octubre de 2026",
    location: "Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona",
    urlConfirmacion: "https://www.bodas.net/web/manel-y-carla/confirmatuasistencia-3",
    urlRegalosdeboda: "https://www.bodas.net/web/manel-y-carla/regalosdeboda-11"
  };

  // --- 3. LÓGICA DE INVITADOS ---
  const guestList = `NOMBRE,APELLIDOS,CONFIRMADO
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
Elena Briones,Briones,CONFIRMADA
Joan Marin,,CONFIRMADO
Josua Bayona,Bayona,CONFIRMADO
Amandine Liam,Liam,CONFIRMADO
Eva Areny,Areny,CONFIRMADA
Carla Sardà,Sardà,CONFIRMADA
Cristian Fernández,Fernández,CONFIRMADO
Anna Gonzalez,Gonzalez,CONFIRMADA
Marta Bartual,Bartual,CONFIRMADO
Iker Zarate,Zarate,CONFIRMADO
Alfonso Zarate,Zarate,CONFIRMADO
Noa Pallares,,CONFIRMADA`;

  const guestsRows = guestList.split('\n').slice(1).filter(line => line.trim() !== '');
  const validGuests = guestsRows.map(row => {
    const parts = row.split(',');
    const nombreRaw = parts[0]?.trim() || '';
    const apellidoRaw = parts[1]?.trim() || '';
    if (!nombreRaw) return null;
    return { 
      original: `${nombreRaw} ${apellidoRaw}`.trim(), 
      normFull: normalize(`${nombreRaw} ${apellidoRaw}`), 
      normName: normalize(nombreRaw) 
    };
  }).filter(Boolean);

  const foundExact = validGuests.find(g => normalizedMessage.includes(g.normFull));
  const foundNameOnly = !foundExact ? validGuests.find(g => normalizedMessage.includes(g.normName)) : null;

  let aiInstruction = "";
  if (foundExact) {
    aiInstruction = `El usuario es ${foundExact.original}. Confirma que está en la lista e invita a confirmar en: ${weddingInfo.urlConfirmacion}`;
  } else if (foundNameOnly) {
    aiInstruction = `He encontrado a alguien llamado ${foundNameOnly.original.split(' ')[0]} pero necesito el apellido para estar seguro.`;
  }

  // --- 4. SYSTEM PROMPT PARA OPENAI ---
  const systemPrompt = `Eres el asistente de la boda de Manel y Carla (31/10/2026).
  
REGLAS IMPORTANTES:
1. FOTOS: Si piden subir o ver fotos, usa este enlace: https://bodamanelcarla.vercel.app/imagenes_boda
2. MÚSICA: Si quieren añadir canciones o la pizarra del DJ, usa: https://bodamanelcarla.vercel.app/dj
3. COMIDA: Aperitivo: ${aperitivoCompletoResponse}. Menú: ${menuPrincipalResponse}
4. BEBIDA: ${allDrinksResponse}
5. QUIZ: Jugar aquí: https://bodamanelcarla.vercel.app/game
6. REGALOS: Los novios tendrán un detalle con los invitados. Info regalos: ${weddingInfo.urlRegalosdeboda}

${aiInstruction}`;

  // --- 5. LLAMADA A OPENAI ---
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
    return data?.choices?.[0]?.message?.content || "No puedo responder ahora mismo.";
  } catch (error) {
    return "Error al procesar la respuesta.";
  }
}
