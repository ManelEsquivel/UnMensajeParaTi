<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Save The Date - Manel & Carla</title>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Cormorant Garamond', serif;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f7f3ed; 
        }

        /* ESTILOS TARJETA INVITACIÓN */
        .invitation-frame {
            position: relative;
            z-index: 10; 
            width: 100%;
            max-width: 400px;
            padding: 3rem 1.5rem; 
            text-align: center;
            
            /* IMAGEN DE FONDO */
            background-image: url('https://raw.githubusercontent.com/ManelEsquivel/SaveTheDate/main/anillos_2.png');
            background-size: cover;
            background-position: center 50%; 
            background-repeat: no-repeat;
            
            background-color: rgba(245, 245, 245, 0.7); 
            background-blend-mode: overlay; 

            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15); 
            border: 1px solid #e0d8c7; 
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-radius: 12px;
        }
        
        /* HOJAS DECORATIVAS */
        .leaf-detail {
            position: absolute;
            width: 70px;
            height: 70px;
            z-index: 15;
            color: #d4af94; 
            opacity: 0;
            animation: fadeIn 0.8s forwards; 
            animation-delay: 0.2s; 
        }
        .top-left-leaf { top: 5px; left: 5px; transform: rotate(0deg); }
        .top-right-leaf { top: 5px; right: 5px; transform: rotate(90deg); }
        .bottom-right-leaf { bottom: 5px; right: 5px; transform: rotate(180deg); }
        .bottom-left-leaf { bottom: 5px; left: 5px; transform: rotate(-90deg); }

        @keyframes fadeIn { to { opacity: 1; } }

        .accent-color { color: #b18579; }

        /* ANIMACIONES DE TEXTO */
        .animated-item {
            opacity: 0;
            transform: translateY(15px);
            animation-fill-mode: forwards;
            animation-name: fadeInSlide;
            font-family: 'Cormorant Garamond', serif; 
            animation-duration: 0.8s;
        }

        @keyframes fadeInSlide {
            to { opacity: 1; transform: translateY(0); }
        }

        .step-1 { animation-delay: 0.2s; }
        .step-2 { animation-delay: 1.0s; }
        .step-2-5 { animation-delay: 1.6s; }
        .step-3 { animation-delay: 2.2s; }
        .step-4 { animation-delay: 3.2s; }
        .step-5 { animation-delay: 4.0s; }
        .step-6 { animation-delay: 4.8s; }
        .step-7 { animation-delay: 5.6s; }

        /* BOTÓN PRINCIPAL */
        .btn-main {
            font-family: 'Noto Sans', sans-serif;
            background-color: #b18579;
            color: white;
            padding: 0.75rem 1.75rem;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(177, 133, 121, 0.4);
            cursor: pointer;
            border: none;
            font-size: 1rem;
            letter-spacing: 0.5px;
        }

        .btn-main:hover {
            background-color: #9c7569;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(177, 133, 121, 0.5);
        }

        /* --- ESTILOS DE LA MODAL --- */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 100;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s;
        }

        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .modal-content {
            background-color: #fff;
            padding: 2.5rem 2rem;
            border-radius: 12px;
            max-width: 90%;
            width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            transform: scale(0.8) translateY(20px);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            border: 1px solid #e0d8c7;
            position: relative;
        }

        .modal-overlay.active .modal-content {
            transform: scale(1) translateY(0);
        }

        .modal-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            color: #b18579;
            margin-bottom: 1rem;
            font-weight: 600;
            line-height: 1.1;
        }

        .modal-text {
            font-family: 'Noto Sans', sans-serif;
            color: #555;
            font-size: 1rem;
            margin-bottom: 2rem;
            line-height: 1.6;
        }

        .modal-buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .btn-calendar {
            font-family: 'Noto Sans', sans-serif;
            background-color: white;
            color: #b18579;
            border: 1px solid #b18579;
            padding: 0.7rem;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
            font-size: 0.95rem;
        }

        .btn-calendar:hover {
            background-color: #fcf8f7;
            transform: translateY(-1px);
        }

        .btn-confirm {
            font-family: 'Noto Sans', sans-serif;
            background-color: #b18579;
            color: white;
            border: none;
            padding: 0.8rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(177, 133, 121, 0.3);
            font-size: 1rem;
        }

        .btn-confirm:hover {
            background-color: #9c7569;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(177, 133, 121, 0.4);
        }

        .close-modal {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 1.5rem;
            color: #aaa;
            cursor: pointer;
            transition: color 0.2s;
        }
        .close-modal:hover { color: #555; }

    </style>
</head>
<body>
    
    <div class="invitation-frame"> 

        <div class="leaf-detail top-left-leaf">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 5 95 C 30 75, 75 30, 95 5" /><path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/><path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/><circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
            </svg>
        </div>
        <div class="leaf-detail top-right-leaf">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 5 95 C 30 75, 75 30, 95 5" /><path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/><path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/><circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
            </svg>
        </div>
        <div class="leaf-detail bottom-right-leaf">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 5 95 C 30 75, 75 30, 95 5" /><path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/><path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/><circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
            </svg>
        </div>
        <div class="leaf-detail bottom-left-leaf">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 5 95 C 30 75, 75 30, 95 5" /><path d="M 25 75 Q 35 85 45 75 M 45 75 Q 35 65 25 75" stroke-width="1.2"/><path d="M 50 50 Q 60 60 70 50 M 70 50 Q 60 40 50 50" stroke-width="1.2"/><circle cx="5" cy="95" r="3" fill="currentColor" stroke="none" />
            </svg>
        </div>
        
        <p class="animated-item step-1 text-xl tracking-widest uppercase mb-6 text-gray-800">
            Save The Date
        </p>

        <h1 class="animated-item step-2 text-6xl font-normal text-gray-800 mb-0 leading-tight">Manel</h1>
        <p class="animated-item step-2-5 text-4xl font-extrabold my-2 accent-color leading-tight">&</p> 
        <h1 class="animated-item step-3 text-6xl font-normal text-gray-800 mt-0 mb-4 leading-tight">Carla</h1>

        <p class="animated-item step-4 text-3xl font-bold mb-8 accent-color">
            31 · 10 · 2026
        </p>
         
        <p class="animated-item step-5 text-xl mt-16 mb-6 text-gray-700">
            Masia Mas Llombart<br>Sant Fost de Campsentelles, Barcelona
        </p>

        <p class="animated-item step-6 text-base italic text-gray-500 mb-8">
            ¡Nos encantaría que nos acompañaras en nuestro gran día!
        </p>

        <div class="animated-item step-7">
            <button id="openModalBtn" class="btn-main">
                Confirmar Asistencia
            </button>
        </div>
        
    </div>

    <div id="confirmationModal" class="modal-overlay">
        <div class="modal-content">
            <span class="close-modal" id="closeModalX">&times;</span>
            
            <h2 class="modal-title">¡Qué ilusión!</h2>
            <p class="modal-text">
                Gracias por querer venir a nuestra boda. Antes de ir a confirmar, ¿quieres guardarte la fecha en el calendario?
            </p>
            
            <div class="modal-buttons">
                <button id="modalSaveCal" class="btn-calendar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    Guardar fecha (31/10/2026)
                </button>
                
                <button id="modalConfirm" class="btn-confirm">
                    Continuar para Confirmar ➔
                </button>
            </div>
        </div>
    </div>

    <script>
        // --- Datos del Evento ---
        const eventData = {
            title: "Boda Manel & Carla",
            location: "Masia Mas Llombart, Sant Fost de Campsentelles, Barcelona",
            description: "¡Nos encantaría que nos acompañaras en nuestro gran día! Web: https://www.bodas.net/web/manel-y-carla/bienvenidos-1",
            // Fecha: 31 Oct 2026 12:00.
            date: "20261031T120000",
            durationHours: 10 // Termina a las 22:00
        };

        const confirmUrl = "https://www.bodas.net/web/manel-y-carla/bienvenidos-1";

        // --- Referencias al DOM ---
        const openModalBtn = document.getElementById('openModalBtn');
        const modal = document.getElementById('confirmationModal');
        const closeModalX = document.getElementById('closeModalX');
        const btnSaveCal = document.getElementById('modalSaveCal');
        const btnConfirm = document.getElementById('modalConfirm');

        // --- Lógica de la Modal ---
        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });

        function closeModal() {
            modal.classList.remove('active');
        }

        closeModalX.addEventListener('click', closeModal);

        // Cerrar si se hace clic fuera del contenido de la modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // --- Acción: Guardar en Calendario ---
        btnSaveCal.addEventListener('click', () => {
            downloadICalFile(eventData);
        });

        // --- Acción: Continuar (Abrir enlace) ---
        btnConfirm.addEventListener('click', () => {
            window.open(confirmUrl, '_blank');
            closeModal(); // Opcional: cerrar modal tras clic
        });

        // --- Función formateo ICS ---
        function formatICSDate(dateString, isEnd = false) {
            const year = parseInt(dateString.substring(0, 4));
            const month = parseInt(dateString.substring(4, 6)) - 1;
            const day = parseInt(dateString.substring(6, 8));
            const hour = parseInt(dateString.substring(9, 11));
            const minute = parseInt(dateString.substring(11, 13));
            const second = parseInt(dateString.substring(13, 15));

            let date = new Date(year, month, day, hour, minute, second);

            if (isEnd) {
                date.setHours(date.getHours() + eventData.durationHours);
            }

            const pad = (num) => num.toString().padStart(2, '0');
            return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
        }
        
        // --- Generar archivo ICS ---
        function downloadICalFile(event) {
            const startDate = event.date;
            const endDate = formatICSDate(startDate, true);
            const stamp = formatICSDate(new Date().toISOString().replace(/[-:.]/g, '').substring(0, 15));
            const uid = Date.now().toString() + "@manel-carla-boda.com";

            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Manel & Carla//SaveTheDate//ES',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${stamp}`,
                `DTSTART:${formatICSDate(startDate)}`,
                `DTEND:${endDate}`,
                `SUMMARY:${event.title}`,
                `DESCRIPTION:${event.description}`,
                `LOCATION:${event.location}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'Boda_Manel_Carla.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // --- Scroll inicial suave ---
        window.onload = function() {
            window.scrollTo(0, 50); 
        };
    </script>

</body>
</html>
