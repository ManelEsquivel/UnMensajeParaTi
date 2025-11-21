import Head from 'next/head'; 
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

// --- CONSTANTE PARA LA CLAVE DE LOCAL STORAGE ---
const LAST_VISIT_KEY = 'lastIntroVideoWatched';
// -----------------------------------------------

// --- FUNCIÓN DE UTILIDAD PARA COMPROBAR LA FECHA ---
const isDifferentDay = (storedDateString) => {
  if (typeof window === 'undefined') return true; // Asumir true en SSR
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
  
  // --- NUEVO ESTADO: true = Mostrar video, false = Omitir video/Redirigir ---
  const [showVideoExperience, setShowVideoExperience] = useState(false); 
  // --- NUEVO ESTADO: Para asegurar que el componente se renderiza solo después de la comprobación ---
  const [isReady, setIsReady] = useState(false); 
  // --------------------------------------------------------------------------------------------------

  const pageTitle = "Boda de Manel & Carla";
  const pageDescription = "Bienvenidos a nuestra boda.";
  const pageImage = "https://bodamanelcarla.vercel.app/icono.png"; 

  // Función de redirección centralizada y registro en Local Storage
  const navigateToHome = () => {
    if (typeof window !== 'undefined') {
        // Guardar la marca de tiempo de la visita en el Local Storage
        localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    }
    // CAMBIO REALIZADO: Redirige a /homepage
    router.push('/homepage');
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
      const isNewDay = isDifferentDay(lastVisit);
      
      setShowVideoExperience(isNewDay);
      setIsReady(true);
      
      if (isNewDay) {
        // Solo pintamos de negro e inicializamos YT si vamos a mostrar el video
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
      }
    }

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []); // El array vacío asegura que solo se ejecuta al montar

  const onPlayerStateChange = (event) => {
    if (event.data === 0 && !isFadingOut) { 
       navigateToHome();
    }
  };

  const handleStart = () => {
    if (showVideoExperience) {
      // Flujo: Reproducir Video
      if (playerRef.current && playerRef.current.playVideo) {
        setIsStarted(true);
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        playerRef.current.playVideo();
        setTimeout(() => { setIsFadingOut(true); }, 7000);
        setTimeout(navigateToHome, 8500);
      }
    } else {
      // Flujo: Redirección Inmediata si ya lo vieron hoy
      navigateToHome();
    }
  };

  // Esperar a que se complete la comprobación del Local Storage
  if (!isReady) {
    return (
      <Head>
        <title>{pageTitle}</title>
        <meta name="theme-color" content="#000000" />
      </Head>
    );
  }

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
            background-color: ${showVideoExperience ? '#000000' : 'white'} !important;
            margin: 0; padding: 0; height: 100%; overflow: hidden;
          }
        `}</style>
      </Head>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 9999, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Este div controla la opacidad general, oculta el video al final */}
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isFadingOut ? 0 : 1, transition: 'opacity 1.5s ease-in-out' }}>
            
            {/* PANTALLA DEL BOTÓN DE ACCESO (Siempre visible si no ha empezado el video) */}
            {/* Solo se oculta cuando el video ha empezado (isStarted = true) */}
            {!isStarted && (
              <div onClick={handleStart} style={{ position: 'absolute', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>Manel & Carla</h1>
                <div style={{ padding: '12px 24px', border: '1px solid white', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', textAlign: 'center' }}>
                  {/* CAMBIO REALIZADO: Texto cambiado a Bienvenidos */}
                  {showVideoExperience ? 'Bienvenidos' : 'Acceder (Bienvenido de nuevo 😉)'}
                </div>
                <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>(Toca para comenzar)</p>
              </div>
            )}
            
            {/* REPRODUCTOR DE YOUTUBE (Solo visible si es la experiencia del video) */}
            {showVideoExperience && (
              <div style={{ width: '100%', height: '100%', pointerEvents: 'none', transform: 'scale(1.4)', opacity: isStarted ? 1 : 0, transition: 'opacity 1s' }}>
                <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
