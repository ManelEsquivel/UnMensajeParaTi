import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

export default function IntroPage() {
  const router = useRouter();
  const playerRef = useRef(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: 'VDqdb9hQZMc',
        playerVars: {
          autoplay: 1,      
          mute: 1,          // Vital para móvil
          controls: 0,
          showinfo: 0,
          rel: 0,
          playsinline: 1,   // Vital para iPhone (evita pantalla completa obligatoria)
          modestbranding: 1,
          loop: 0,
          fs: 0             // Desactiva botón fullscreen
        },
        events: {
          'onReady': onPlayerReady,       // <--- NUEVO: Aquí forzamos el arranque
          'onStateChange': onPlayerStateChange
        }
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // NUEVA FUNCIÓN: Se ejecuta en cuanto el video carga
  const onPlayerReady = (event) => {
    // Doble seguridad para móviles:
    event.target.mute();      // 1. Silenciar explícitamente
    event.target.playVideo(); // 2. Ordenar Play explícitamente
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 0) { 
      router.push('/bot_boda_asistente');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'black', zIndex: 9999, overflow: 'hidden',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      
      {/* IMPORTANTE: En móvil, a veces necesitamos que el usuario toque si falla el autoplay.
         He quitado el 'pointerEvents: none' estricto del contenedor padre por si acaso,
         pero lo mantenemos visualmente limpio.
      */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        transform: 'scale(1.4)', // Mantenemos el zoom para ocultar logos
        transformOrigin: 'center center'
      }}>
        <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
      </div>
      
      {/* CAPA TRANSPARENTE DE SEGURIDAD: 
         Si el móvil bloquea el video, el usuario intentará tocar la pantalla.
         Esta capa detecta el toque e inicia el video si estaba parado.
      */}
      <div 
        onClick={() => {
            // Si el usuario toca la pantalla, intentamos play por si estaba bloqueado
            if(playerRef.current && playerRef.current.playVideo) {
                playerRef.current.playVideo();
            }
        }}
        style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 100, cursor: 'pointer'
        }}
      ></div>

    </div>
  );
}
