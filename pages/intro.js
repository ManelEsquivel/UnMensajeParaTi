import Head from 'next/head'; 
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

// --- CONSTANTE PARA LA CLAVE DE LOCAL STORAGE ---
const LAST_VISIT_KEY = 'lastIntroVideoWatched';
// -----------------------------------------------

// --- FUNCIÓN DE UTILIDAD PARA COMPROBAR LA FECHA ---
const isDifferentDay = (storedDateString) => {
  if (!storedDateString) {
    return true; // No existe la marca, así que es diferente día (primera visita)
  }
  
  const storedDate = new Date(storedDateString);
  const today = new Date();

  // Comparamos el día, mes y año.
  return (
    storedDate.getDate() !== today.getDate() ||
    storedDate.getMonth() !== today.getMonth() ||
    storedDate.getFullYear() !== today.getFullYear()
  );
};
// --------------------------------------------------

export default function IntroPage() {
  const router = useRouter();
  const playerRef = useRef(null);
  
  const [isStarted, setIsStarted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // --- NUEVO ESTADO PARA CONTROLAR SI DEBEMOS MOSTRAR LA INTRO ---
  const [showIntro, setShowIntro] = useState(false); 
  // --------------------------------------------------------------
  
  const pageTitle = "Asistente de la Boda de Manel & Carla";
  const pageDescription = "Entra aquí para interactuar con nuestro asistente virtual.";
  const pageImage = "https://bodamanelcarla.vercel.app/icono.png"; 

  useEffect(() => {
    // Código para el manejo de Local Storage (solo en el cliente)
    if (typeof window !== 'undefined') {
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
      
      if (isDifferentDay(lastVisit)) {
        // La última visita fue ayer o no existe la marca. Mostramos el video.
        setShowIntro(true);
        
        // PINTAMOS DE NEGRO AL ENTRAR (sólo si se va a mostrar la intro)
        document.documentElement.style.setProperty('background-color', '#000000', 'important');
        document.body.style.setProperty('background-color', '#000000', 'important');

        // Inicializar YouTube Iframe API
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
        
      } else {
        // La última visita fue hoy. Redirigir directamente.
        router.replace('/bot_boda_asistente'); // Usar replace para evitar que la intro esté en el historial
      }
    }

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Función de redirección centralizada
  const redirectToBot = () => {
    // Guardar la marca de tiempo de la visita en el Local Storage
    if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    }
    router.push('/bot_boda_asistente');
  }

  const startExperience = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      setIsStarted(true);
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
      // El setTimeout para el fundido y la redirección es el mismo, pero ahora llama a redirectToBot
      setTimeout(() => { setIsFadingOut(true); }, 7000);
      setTimeout(redirectToBot, 8500); 
    }
  };

  const onPlayerStateChange = (event) => {
    // Si el video termina (data === 0) y no estamos ya en proceso de fundido de salida, redirigimos.
    if (event.data === 0 && !isFadingOut) { 
       redirectToBot();
    }
  };
  
  // Si showIntro es false, el componente no renderiza nada y el useEffect ya ha redirigido.
  if (!showIntro) {
      // Devolver un fragmento o null para evitar un render innecesario antes de la redirección,
      // pero manteniendo el Head por si acaso.
      return (
        <Head>
            <title>{pageTitle}</title>
            <meta property="og:title" content={pageTitle} />
            <meta name="theme-color" content="#000000" />
        </Head>
      );
  }

  // --- RENDERIZADO CONDICIONAL DE LA INTRO ---
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
