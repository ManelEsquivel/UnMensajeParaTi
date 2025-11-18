import React from 'react';

export default function IntroVideo() {
  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <video 
        controls 
        autoPlay 
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Esta ruta funciona porque moviste el video a la carpeta public */}
        <source src="/wedding-intro.mp4" type="video/mp4" />
        Tu navegador no soporta videos.
      </video>
    </div>
  );
}
