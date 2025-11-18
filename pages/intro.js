import { useRouter } from 'next/router'; // O 'next/navigation' si usas App Router
import { useEffect, useRef } from 'react';

export default function IntroPage() {
  const router = useRouter();
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      // 1. Forzamos el silencio por código (Esto arregla el bug de React)
      videoElement.muted = true; 
      
      // 2. Forzamos el play
      videoElement.play().catch(error => {
        console.log("Autoplay falló:", error);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    router.push('/bot_boda_asistente');
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      backgroundColor: 'black', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <video
        ref={videoRef}
        // Usamos estos atributos como respaldo
        playsInline
        muted
        autoPlay
        onEnded={handleVideoEnd}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      >
        {/* Usamos la URL que ME HAS CONFIRMADO que funciona */}
        <source src="/wedding-intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
