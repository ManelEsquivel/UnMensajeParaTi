import Head from 'next/head'; 
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const LAST_VISIT_KEY = 'lastIntroVideoWatched';

const isDifferentDay = (storedDateString) => {
  if (typeof window === 'undefined') return true;
  if (!storedDateString) return true;
  
  const storedDate = new Date(storedDateString);
  const today = new Date();

  return (
    storedDate.getDate() !== today.getDate() ||
    storedDate.getMonth() !== today.getMonth() ||
    storedDate.getFullYear() !== today.getFullYear()
  );
};

export default function IntroPage() {
  const router = useRouter();
  const playerRef = useRef(null);
  
  const [isStarted, setIsStarted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showVideoExperience, setShowVideoExperience] = useState(false); 
  const [isReady, setIsReady] = useState(false); 

  const pageTitle = "Boda de Manel & Carla";
  const pageDescription = "Bienvenidos a nuestra boda.";
  
  // IMPORTANTE: La URL exacta de tu imagen JPG
  const pageImage = "https://bodamanelcarla.vercel.app/boda_icon_5.jpg"; 

  const navigateToHome = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    }
    router.push('/homepage');
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
      const isNewDay = isDifferentDay(lastVisit);
      
      setShowVideoExperience(isNewDay);
      setIsReady(true); // Aquí ya sabemos qué mostrar
      
      if (isNewDay) {
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
            videoId: '_uNx7FNU6Fo', 
            playerVars: { autoplay: 0, controls: 0, showinfo: 0, rel: 0, playsinline: 1, modestbranding: 1, loop: 0, fs: 0 },
            events: { 'onStateChange': onPlayerStateChange }
          });
        };
      }
    }

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const onPlayerStateChange = (event) => {
    if (event.data === 0 && !isFadingOut) { 
       navigateToHome();
    }
  };

  const handleStart = () => {
    if (showVideoExperience) {
      if (playerRef.current && playerRef.current.playVideo) {
        setIsStarted(true);
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        playerRef.current.playVideo();
        setTimeout(() => { setIsFadingOut(true); }, 7000);
        setTimeout(navigateToHome, 8500);
      }
    } else {
      navigateToHome();
    }
  };

  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* --- METADATOS --- */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:image:secure_url" content={pageImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        
        <meta name="theme-color" content="#000000" />
        
        <style>{`
          html, body, #__next {
            background-color: ${showVideoExperience || !isReady ? '#000000' : 'white'} !important;
            margin: 0; padding: 0; height: 100%; overflow: hidden;
          }
          /* 🥂 NUEVA ANIMACIÓN PARA LAS COPAS */
          @keyframes cheers {
              0% { transform: scale(1) rotate(0deg); }
              25% { transform: scale(1.1) rotate(-5deg); }
              50% { transform: scale(1.1) rotate(5deg); }
              75% { transform: scale(1.1) rotate(-5deg); }
              100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </Head>

      {/* IMAGEN FANTASMA */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0, top: 0, left: 0, zIndex: -1 }}>
          <img src={pageImage} alt="thumbnail boda" style={{ width: '300px', height: '300px' }} />
      </div>

      {/* CONTENIDO VISUAL */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 9999, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Si no está listo (cargando) */}
        {!isReady ? (
            <div style={{width: '100%', height: '100%', backgroundColor: 'black'}}></div>
        ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isFadingOut ? 0 : 1, transition: 'opacity 1.5s ease-in-out' }}>
                
                {!isStarted && (
                <div onClick={handleStart} style={{ position: 'absolute', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                    
                    {/* 🥂 ICONO DE COPAS CON ANIMACIÓN DE "TINTINEO" */}
                    <div style={{
                        fontSize: '50px',
                        marginBottom: '15px',
                        display: 'inline-block',
                        animation: 'cheers 1.5s ease-in-out infinite', // Aplica la nueva animación
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                    }}>
                        🥂
                    </div>
                    
                    <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>Manel & Carla</h1>
                    <div style={{ padding: '12px 24px', border: '1px solid white', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', textAlign: 'center' }}>
                    {showVideoExperience ? 'Bienvenidos' : 'Acceder (Bienvenido de nuevo 😉)'}
                    </div>
                    <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>(Toca para comenzar)</p>
                </div>
                )}
                
                {showVideoExperience && (
                <div style={{ width: '100%', height: '100%', pointerEvents: 'none', transform: 'scale(1.4)', opacity: isStarted ? 1 : 0, transition: 'opacity 1s' }}>
                    <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
                </div>
                )}
            </div>
        )}
      </div>
    </>
  );
}
