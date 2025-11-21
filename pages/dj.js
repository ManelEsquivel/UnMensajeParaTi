import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// *******************************************************************
// ✅ TUS DATOS CONFIGURADOS
// *******************************************************************
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdUwUkcF_RHlfHdraWI0Vdca6Or6HxE1M_ykj2mfci_cokyoA/formResponse"; 
const ENTRY_SONG   = "entry.38062662"; 
const ENTRY_ARTIST = "entry.1279581249"; 
const ENTRY_ALBUM  = "entry.2026891459"; 
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZ9RxSCBQemScY8lZhfg2Bbi4T5xOoNhTcmENIJSZWFo8yVF0bxd7yXy5gx0HoKIb87-chczYEccKr/pub?output=csv";
// *******************************************************************

export default function DjPage({ initialTracks }) {
    const router = useRouter();
    
    const [formData, setFormData] = useState({ song: '', artist: '', album: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 🚀 TRUCO: Inicializamos con lo que nos manda el servidor.
    // Si initialTracks trae datos, isLoading empieza en false directamente.
    const [playlist, setPlaylist] = useState(initialTracks || []);
    const [isLoading, setIsLoading] = useState(!initialTracks || initialTracks.length === 0);
    const [showNotice, setShowNotice] = useState(false); 

    // Función para refrescar datos en el cliente (Client Side)
    const fetchPlaylistClient = async () => {
        try {
            const response = await fetch(`${SHEET_CSV_URL}&uid=${Date.now()}`, {
                cache: "no-store",
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });
            
            const text = await response.text();
            
            // Protección: Si Google falla, no hacemos nada
            if (!text || text.trim().startsWith("<") || text.length < 50) return;

            const rows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').slice(1);
            const separator = text.indexOf(';') > -1 && text.indexOf(',') < text.indexOf(';') ? ';' : ',';

            const remoteTracks = rows.map((row) => {
                if (!row || row.trim() === "") return null;
                const regex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
                const columns = row.split(regex); 
                const clean = (str) => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';
                const songName = clean(columns[1]);
                const artistName = clean(columns[2]) || "Desconocido";
                const uniqueId = `${songName}-${artistName}`.replace(/\s+/g, '-').toLowerCase();

                return {
                    id: uniqueId, song: songName, artist: artistName, album: clean(columns[3]) || "Single", isLocal: false
                };
            }).filter(t => t && t.song).reverse();

            mergeWithLocals(remoteTracks);

        } catch (error) {
            console.error("Error refrescando background");
        }
    };

    // Función auxiliar para mezclar Remotas + Locales
    const mergeWithLocals = (remoteTracks) => {
        const localData = localStorage.getItem('dj_pending_tracks');
        let localTracks = localData ? JSON.parse(localData) : [];

        // Si una local ya está en el remoto, la borramos de local
        localTracks = localTracks.filter(local => !remoteTracks.some(remote => remote.id === local.id));
        localStorage.setItem('dj_pending_tracks', JSON.stringify(localTracks));

        // Unimos: Las locales (pendientes) siempre PRIMERO (arriba)
        const finalPlaylist = [...localTracks.reverse(), ...remoteTracks];
        const uniquePlaylist = finalPlaylist.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
        
        setPlaylist(uniquePlaylist);
        setIsLoading(false);
    };

    useEffect(() => {
        // Al cargar la página, mezclamos lo que trajo el servidor con lo que haya en localStorage del usuario
        // Esto es instantáneo
        mergeWithLocals(initialTracks || []);

        // Configuramos el intervalo para buscar nuevas canciones cada 10s
        const interval = setInterval(fetchPlaylistClient, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.song) return;
        
        const songClean = formData.song.trim();
        const artistClean = (formData.artist || 'Desconocido').trim();
        const uniqueId = `${songClean}-${artistClean}`.replace(/\s+/g, '-').toLowerCase();

        const newTrack = {
            id: uniqueId, song: songClean, artist: artistClean, album: formData.album || 'Single', isLocal: true 
        };

        // ⚡ OPTIMISTA: Añadimos al principio visualmente YA
        setPlaylist(prev => [newTrack, ...prev]);
        
        setFormData({ song: '', artist: '', album: '' });
        setShowNotice(true);
        setTimeout(() => setShowNotice(false), 8000);

        // Guardar en local
        const currentLocals = JSON.parse(localStorage.getItem('dj_pending_tracks') || '[]');
        currentLocals.push(newTrack);
        localStorage.setItem('dj_pending_tracks', JSON.stringify(currentLocals));

        // Enviar a Google (Silencioso)
        const formBody = new URLSearchParams();
        formBody.append(ENTRY_SONG, songClean);
        formBody.append(ENTRY_ARTIST, artistClean);
        formBody.append(ENTRY_ALBUM, formData.album || 'Single');

        try {
            await fetch(FORM_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            });
        } catch (error) { console.error("Error envio"); }
    };

    return (
        <div className="container">
            <Head>
                <title>Lista de canciones! 🎵</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Poppins:wght@400;600;800&display=swap" rel="stylesheet" />
            </Head>

            <div className="form-section">
                <div className="header">
                    <div className="vinyl-container"><div className="vinyl-icon">💿</div></div>
                    <h1 className="title">PLAYLIST DE INVITADOS</h1>
                    <p className="subtitle">¡Añade tu canción para que suene!</p>
                </div>

                <form onSubmit={handleSubmit} className="form-card">
                    <div className="input-group full-width">
                        <label>🎵 Canción</label>
                        <input name="song" value={formData.song} onChange={handleChange} placeholder="Ej: Waka Waka" required autoComplete="off"/>
                    </div>
                    <div className="row-group">
                        <div className="input-group half-width">
                            <label>🎤 Artista</label>
                            <input name="artist" value={formData.artist} onChange={handleChange} placeholder="Shakira" />
                        </div>
                        <div className="input-group half-width">
                            <label>💿 Álbum</label>
                            <input name="album" value={formData.album} onChange={handleChange} placeholder="Single" />
                        </div>
                    </div>
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        AÑADIR A LA PIZARRA ✨
                    </button>
                </form>
                <button onClick={() => router.push('/homepage')} className="back-btn">← Volver</button>
            </div>

            {showNotice && (
                <div className="notice-box">
                    <div className="notice-title">✅ ¡Anotada!</div>
                    <div className="notice-text">Aparece arriba en tu móvil. En unos minutos saldrá en los de los demás.</div>
                </div>
            )}

            <div className="board-section">
                <div className="chalkboard">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                        <h2 className="chalk-title" style={{margin:0}}>PETICIONES</h2>
                        <button onClick={fetchPlaylistClient} className="refresh-btn">↻</button>
                    </div>
                    <div className="chalk-divider"></div>
                    
                    {isLoading ? (
                        <div style={{textAlign:'center', padding:'20px', opacity:0.6}}>Cargando pizarra...</div>
                    ) : (
                        <div className="requests-list">
                            {playlist.length === 0 ? (
                                <div style={{textAlign:'center', opacity:0.5, padding:'20px'}}>
                                    <p>La pizarra está vacía... ¡Estrena tú la lista!</p>
                                </div>
                            ) : (
                                playlist.map((track) => (
                                    <div key={track.id} className="chalk-item">
                                        <div className="chalk-song">"{track.song}"</div>
                                        <div className="chalk-details">
                                            <span className="artist">🎤 {track.artist}</span>
                                            <span className="separator"> | </span>
                                            <span className="album">💿 {track.album}</span>
                                            {track.isLocal && <span style={{fontSize:'10px', color:'#68D391', marginLeft:'5px'}}> (Enviando...)</span>}
                                        </div>
                                        <div className="chalk-line"></div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; padding: 0; background: #1a202c; }
            `}</style>

            <style jsx>{`
                .container { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Poppins', sans-serif; background: #1a202c; overflow-x: hidden; padding-bottom: 50px; }
                .form-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px 40px 20px; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); width: 100%; flex-shrink: 0; }
                .header { text-align: center; color: white; margin-bottom: 25px; width: 100%; }
                .vinyl-container { height: 50px; margin-bottom: 10px; }
                .vinyl-icon { font-size: 45px; display: inline-block; animation: spin 4s linear infinite; }
                .title { margin: 5px 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; line-height: 1.2; }
                .subtitle { margin: 0; opacity: 0.9; font-size: 14px; }
                .form-card { background: rgba(255, 255, 255, 0.96); padding: 25px 20px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); margin: 0 auto; }
                .input-group { margin-bottom: 15px; width: 100%; }
                .input-group label { display: block; font-size: 12px; font-weight: 800; color: #4a5568; margin-bottom: 6px; text-transform: uppercase; }
                .input-group input { width: 100%; padding: 14px; border-radius: 12px; border: 2px solid #e2e8f0; font-size: 16px; outline: none; background-color: #f7fafc; font-family: 'Poppins', sans-serif; -webkit-appearance: none; }
                .input-group input:focus { border-color: #667eea; background: #fff; }
                .row-group { display: flex; gap: 12px; width: 100%; }
                .half-width { flex: 1; width: 50%; }
                .submit-btn { width: 100%; padding: 18px; margin-top: 10px; background: #2d3748; color: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); touch-action: manipulation; transition: transform 0.1s; }
                .submit-btn:active { transform: scale(0.98); }
                .back-btn { background: none; border: none; color: rgba(255,255,255,0.8); margin-top: 20px; padding: 10px; font-size: 14px; font-weight: 600; }
                .notice-box { background: #C6F6D5; border-left: 5px solid #48BB78; padding: 15px; margin: 20px 20px 0 20px; border-radius: 8px; color: #22543D; animation: slideIn 0.5s ease-out; max-width: 500px; width: 90%; align-self: center; }
                .notice-title { font-weight: 800; margin-bottom: 5px; font-size: 14px; }
                .notice-text { font-size: 12px; line-height: 1.4; }
                .board-section { padding: 30px 20px; display: flex; justifyContent: center; width: 100%; flex-grow: 1; }
                .chalkboard { width: 100%; max-width: 500px; background: #2b2b2b; border: 10px solid #5D4037; border-radius: 8px; padding: 20px; color: #fff; font-family: 'Permanent Marker', cursive; min-height: 300px; height: fit-content; background-image: url("https://www.transparenttextures.com/patterns/black-chalk.png"); }
                .requests-list { display: flex; flexDirection: column; gap: 10px; }
                .chalk-title { font-size: 22px; color: rgba(255,255,255,0.95); letter-spacing: 1px; }
                .chalk-divider { height: 2px; background: rgba(255,255,255,0.2); margin-bottom: 15px; }
                .chalk-item { margin-bottom: 5px; animation: slideIn 0.4s ease-out; width: 100%; }
                .chalk-song { font-size: 20px; margin-bottom: 5px; color: white; line-height: 1.3; word-break: break-word; }
                .chalk-details { font-size: 14px; opacity: 0.8; font-family: 'Poppins', sans-serif; }
                .artist { color: #f6e05e; }
                .album { color: #63b3ed; }
                .chalk-line { margin-top: 12px; border-bottom: 1px dashed rgba(255,255,255,0.15); }
                .refresh-btn { background: none; border: 1px solid rgba(255,255,255,0.4); color: white; border-radius: 6px; cursor: pointer; padding: 5px 10px; font-size: 16px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 380px) { .form-section { padding-top: 50px; } .title { font-size: 24px; } .form-card { padding: 20px 15px; } }
            `}</style>
        </div>
    );
}

// *******************************************************************
// ⚡ SERVER SIDE: ESTO SE EJECUTA EN EL SERVIDOR ANTES DE ENVIAR LA PÁGINA
// *******************************************************************
export async function getServerSideProps() {
    try {
        // Añadimos un timestamp para forzar al servidor a no usar caché antigua
        const res = await fetch(`${SHEET_CSV_URL}&uid=${Date.now()}`);
        const text = await res.text();

        let initialTracks = [];

        if (text && !text.trim().startsWith("<") && text.length > 50) {
            const rows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').slice(1);
            const separator = text.indexOf(';') > -1 && text.indexOf(',') < text.indexOf(';') ? ';' : ',';

            initialTracks = rows.map((row) => {
                if (!row || row.trim() === "") return null;
                // Parseo seguro de CSV
                const regex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
                const columns = row.split(regex); 
                const clean = (str) => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';

                const songName = clean(columns[1]);
                const artistName = clean(columns[2]) || "Desconocido";
                const uniqueId = `${songName}-${artistName}`.replace(/\s+/g, '-').toLowerCase();

                return {
                    id: uniqueId, 
                    song: songName,
                    artist: artistName,
                    album: clean(columns[3]) || "Single",
                    isLocal: false
                };
            })
            .filter(t => t && t.song && t.song.length > 0 && t.song !== "Canción desconocida")
            .reverse(); // ✅ INVIERTE EL ORDEN: Las últimas filas (nuevas) aparecen primero (index 0)
        }

        return {
            props: {
                initialTracks, // Enviamos el array relleno al componente
            },
        };
    } catch (error) {
        console.error("Error en Server Side Rendering:", error);
        return {
            props: {
                initialTracks: [], // Si falla, enviamos vacío y ya lo intentará el cliente
            },
        };
    }
}
