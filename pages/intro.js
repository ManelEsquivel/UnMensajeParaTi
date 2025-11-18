import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function IntroPage() {
  const router = useRouter();
  const playerRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false); // Controla si ya hemos entrado

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
          autoplay: 0,      // No intentamos autoplay (para que no salga error)
          controls: 0,
          showinfo: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          loop: 0,
          fs: 0
        },
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const startExperience = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      setIsStarted(true);           // Quitamos la cortina
      playerRef.current.unMute();   // ¡ACTIVAMOS SONIDO! (Ventaja de hacerlo con clic)
      playerRef.current.setVolume(100);
      playerRef.current.playVideo(); // Iniciamos video
    }
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

      {/* --- PANTALLA DE BIENVENIDA (CORTINA) --- 
          Esto es lo que se ve en el móvil primero. 
          Oculta el video hasta que tocan.
      */}
      {!isStarted && (
        <div 
          onClick={startExperience}
          style={{
            position: 'absolute', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'black', // Fondo negro elegante
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            color: 'white', cursor: 'pointer'
          }}
        >
          <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>
            Manel & Carla
          </h1>
          <div style={{
            padding: '12px 24px', border: '1px solid white', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem'
          }}>
            Entrar
          </div>
          <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>
            (Toca para comenzar)
          </p>
        </div>
      )}

      {/* --- VIDEO YOUTUBE (ESCONDIDO DETRÁS HASTA EL CLIC) --- */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        transform: 'scale(1.4)', // Mantenemos el Zoom para ocultar logos
        opacity: isStarted ? 1 : 0, // Se hace visible suavemente
        transition: 'opacity 1s'
      }}>
        <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
      </div>

    </div>
  );
}
