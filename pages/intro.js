import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react'; 

export default function IntroPage() {
  const router = useRouter();
  const playerRef = useRef(null);
  
  const [isStarted, setIsStarted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const pageTitle = "Asistente de la Boda de Manel & Carla";
  const pageDescription = "Entra aquí para interactuar con nuestro asistente virtual.";
  const pageImage = "https://bodamanelcarla.vercel.app/icono.png"; 

  useEffect(() => {
    // PINTAMOS DE NEGRO AL ENTRAR
    // Usamos 'important' para asegurar que ganamos al modo claro si viniera de otra web
    document.documentElement.style.setProperty('background-color', '#000000', 'important');
    document.body.style.setProperty('background-color', '#000000', 'important');

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: 'XZ8ktV9YgCQ', 
        playerVars: { autoplay: 0, controls: 0, showinfo: 0, rel: 0, playsinline: 1, modestbranding: 1, loop: 0, fs: 0 },
        events: { 'onStateChange': onPlayerStateChange }
      });
    };

    return () => {
      // --- CAMBIO CRÍTICO AQUÍ ---
      // HE BORRADO LA LIMPIEZA DE COLOR.
      // Al salir, NO reseteamos el fondo. Dejamos que la siguiente página (el bot)
      // simplemente sobrescriba con blanco. Así evitamos el "flash" negro.
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const startExperience = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      setIsStarted(true);
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
      setTimeout(() => { setIsFadingOut(true); }, 7000);
      setTimeout(() => { router.push('/bot_boda_asistente'); }, 8500);
    }
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 0 && !isFadingOut) { 
       router.push('/bot_boda_asistente');
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
        
        {/* Barra de estado negra */}
        <meta name="theme-color" content="#000000" />
        
        <style>{`
          html, body, #__next {
            background-color: #000000 !important;
            margin: 0; padding: 0; height: 100%; overflow: hidden;
          }
        `}</style>
      </Head>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 9999, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isFadingOut ? 0 : 1, transition: 'opacity 1.5s ease-in-out' }}>
            {!isStarted && (
              <div onClick={startExperience} style={{ position: 'absolute', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>Manel & Carla</h1>
                <div style={{ padding: '12px 24px', border: '1px solid white', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', textAlign: 'center' }}>Entrar al asistente</div>
                <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>(Toca para comenzar)</p>
              </div>
            )}
            <div style={{ width: '100%', height: '100%', pointerEvents: 'none', transform: 'scale(1.4)', opacity: isStarted ? 1 : 0, transition: 'opacity 1s' }}>
              <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
            </div>
        </div>
      </div>
    </>
  );
}
