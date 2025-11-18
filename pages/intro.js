import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

export default function IntroPage() {
  const router = useRouter();
  const playerRef = useRef(null);

  useEffect(() => {
    // Cargamos API de YouTube
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
          mute: 1,
          controls: 0,      // Sin controles
          showinfo: 0,      // (Ya no funciona al 100% en YouTube, por eso haremos zoom)
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          loop: 0 
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

  const onPlayerStateChange = (event) => {
    // Cuando termina (estado 0), nos vamos
    if (event.data === 0) { 
      router.push('/bot_boda_asistente');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'black', zIndex: 9999, 
      overflow: 'hidden', // <--- IMPORTANTE: Esto corta lo que sobra
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      
      {/* CONTENEDOR CON ZOOM */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', // Evita que pulsen el video y salga el título
        
        // TRUCO: Escalamos al 140% para sacar los logos fuera de la pantalla
        transform: 'scale(1.4)', 
        transformOrigin: 'center center'
      }}>
        <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
      </div>
      
    </div>
  );
}
