import Head from 'next/head';
import { useEffect, useRef } from 'react';

export default function IntroPage() {
  const playerRef = useRef(null);

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
          autoplay: 1, // 1 = Reproducción automática
          mute: 1,     // 1 = Silenciado (Obligatorio para que funcione el autoplay)
          controls: 1, // Muestra los controles para que puedan activar el sonido
          showinfo: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          loop: 0,
          fs: 1
        },
        events: {
          'onReady': onPlayerReady
        }
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Nos aseguramos de que empiece a reproducirse en cuanto cargue
  const onPlayerReady = (event) => {
    event.target.mute(); 
    event.target.playVideo();
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
        `}</style>
      </Head>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 9999, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Reproductor de Video directo */}
        <div style={{ width: '100%', height: '100%' }}>
          <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
        </div>

      </div>
    </>
  );
}
