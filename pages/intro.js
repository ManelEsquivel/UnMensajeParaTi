import { useRouter } from 'next/router';
import { useState } from 'react';

export default function IntroPage() {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);

  // Función que se ejecuta cuando el video termina
  const handleVideoEnd = () => {
    // 1. Activamos el estado de desvanecimiento
    setIsFading(true);

    // 2. Esperamos 1 segundo (1000ms) para que se vea la transición y cambiamos de página
    setTimeout(() => {
      router.push('/bot_boda_asistente');
    }, 1000);
  };

  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        backgroundColor: 'black', 
        overflow: 'hidden',
        // La transición suave ocurre aquí:
        opacity: isFading ? 0 : 1, 
        transition: 'opacity 1s ease-in-out' 
      }}
    >
      <video
        // IMPORTANTE: Estas 3 propiedades son OBLIGATORIAS para el autoplay
        autoPlay
        muted
        playsInline 
        
        // Detecta el final
        onEnded={handleVideoEnd}
        
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' // Cubre toda la pantalla sin bordes negros
        }}
      >
        {/* Asegúrate de que el video esté en la carpeta /public */}
        <source src="/wedding-intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
