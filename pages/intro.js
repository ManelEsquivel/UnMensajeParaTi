import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function IntroPage() {
  const router = useRouter();
  const playerRef = useRef(null);
  
  const [isStarted, setIsStarted] = useState(false);     // Controla si hemos dado al botón
  const [isFadingOut, setIsFadingOut] = useState(false); // <--- NUEVO: Controla el final

  // --- DATOS WHATSAPP ---
  const pageTitle = "Asistente de la Boda de Manel & Carla";
  const pageDescription = "Entra aquí para interactuar con nuestro asistente virtual.";
  const pageImage = "https://bodamanelcarla.vercel.app/icono.png"; 

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: 'XZ8ktV9YgCQ', 
        playerVars: {
          autoplay: 0,
          controls: 0,
          showinfo: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          loop: 0,
          fs: 0,
          end: 7 // Corta a los 7 segundos
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
      setIsStarted(true);
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
    }
  };

  const onPlayerStateChange = (event) => {
    // Cuando el video termina (o llega al segundo 7)
    if (event.data === 0) { 
      
      // 1. Activamos el fundido a negro
      setIsFadingOut(true);

      // 2. Esperamos 1.5 segundos (1500ms) para que la animación termine
      // y entonces cambiamos de página sin que se note el corte.
      setTimeout(() => {
        router.push('/bot_boda_asistente');
      }, 1500);
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
      </Head>

      <div style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        backgroundColor: 'black', zIndex: 9999, overflow: 'hidden',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>

        {/* ENVOLTORIO DE CONTENIDO QUE SE DIFUMINA 
            Todo lo que esté aquí dentro se volverá transparente al final,
            dejando ver el fondo negro del 'div' padre.
        */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          // MAGIA CSS: Si isFadingOut es true, opacidad 0. Si no, opacidad 1.
          opacity: isFadingOut ? 0 : 1, 
          transition: 'opacity 1.5s ease-in-out' // Dura 1.5 segundos
        }}>

            {/* PANTALLA DE BIENVENIDA */}
            {!isStarted && (
              <div 
                onClick={startExperience}
                style={{
                  position: 'absolute', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%',
                  backgroundColor: 'black',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  color: 'white', cursor: 'pointer'
                }}
              >
                <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>
                  Manel & Carla
                </h1>
                
                <div style={{
                  padding: '12px 24px', 
                  border: '1px solid white', 
                  borderRadius: '4px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px', 
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  Entrar al asistente
                </div>
                
                <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>
                  (Toca para comenzar)
                </p>
              </div>
            )}

            {/* VIDEO */}
            <div style={{ 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none',
              transform: 'scale(1.4)', 
              opacity: isStarted ? 1 : 0,
              transition: 'opacity 1s'
            }}>
              <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
            </div>

        </div>
      </div>
    </>
  );
}
