import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

export default function IntroPage() {
  const playerRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);

  const pageTitle = "Boda de Manel & Carla";
  const pageDescription = "Bienvenidos a nuestra boda.";
  const pageImage = "https://bodamanelcarla.vercel.app/boda_icon_5.jpg";

  useEffect(() => {
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
        playerVars: {
          autoplay: 0,
          controls: 1, // Cambiado a 1 para que puedan pausar/adelantar si lo desean
          showinfo: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          loop: 0,
          fs: 1
        }
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const handleStart = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      setIsStarted(true);
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* METADATOS */}
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
            background-color: #000000 !important;
            margin: 0; padding: 0; height: 100%; overflow: hidden;
          }
          @keyframes cheers {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(-5deg); }
            50% { transform: scale(1.1) rotate(5deg); }
            75% { transform: scale(1.1) rotate(-5deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </Head>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 9999, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Pantalla inicial de bienvenida */}
        {!isStarted && (
          <div 
            onClick={handleStart} 
            style={{ position: 'absolute', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '50px', marginBottom: '15px', display: 'inline-block', animation: 'cheers 1.5s ease-in-out infinite', textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' }}>
              🥂
            </div>
            
            <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>Manel & Carla</h1>
            <div style={{ padding: '12px 24px', border: '1px solid white', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', textAlign: 'center' }}>
              Bienvenidos
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>(Toca para comenzar)</p>
          </div>
        )}

        {/* Reproductor de Video */}
        <div style={{ width: '100%', height: '100%', opacity: isStarted ? 1 : 0, transition: 'opacity 1s' }}>
          <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
        </div>

      </div>
    </>
  );
}
