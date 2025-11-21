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

export default function DjPage() {
    const router = useRouter();
    
    const [formData, setFormData] = useState({ song: '', artist: '', album: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playlist, setPlaylist] = useState([]);

    // --- LÓGICA DE MEZCLA (LOCAL + GOOGLE) ---
    const fetchPlaylist = async () => {
        try {
            // 1. Descargar lista OFICIAL de Google
            const response = await fetch(`${SHEET_CSV_URL}&uid=${Date.now()}`, {
                cache: "no-store",
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });
            
            let remoteTracks = [];
            const text = await response.text();

            if (text && text.length > 10) {
                const rows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').slice(1);
                const separator = text.indexOf(';') > -1 && text.indexOf(',') < text.indexOf(';') ? ';' : ',';

                remoteTracks = rows.map((row, index) => {
                    if (!row || row.trim() === "") return null;
                    const regex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
                    const columns = row.split(regex); 
                    const clean = (str) => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';

                    return {
                        id: `remote-${index}`, // ID remoto
                        song: clean(columns[1]),
                        artist: clean(columns[2]) || "Desconocido",
                        album: clean(columns[3]) || "Single",
                        isLocal: false
                    };
                }).filter(t => t && t.song && t.song.length > 0 && t.song !== "Canción desconocida").reverse();
            }

            // 2. Recuperar mis canciones PENDIENTES del navegador
            const localData = localStorage.getItem('dj_pending_tracks');
            let localTracks = localData ? JSON.parse(localData) : [];

            // 3. LIMPIEZA: Si una canción local YA aparece en Google, la borramos de local
            // (Para que no salga duplicada cuando Google por fin se actualice)
            localTracks = localTracks.filter(local => {
                const alreadyInRemote = remoteTracks.some(remote => 
                    remote.song.toLowerCase().trim() === local.song.toLowerCase().trim()
                );
                return !alreadyInRemote; // Solo mantenemos las que NO han llegado a Google aún
            });

            // Actualizamos el localStorage con la lista limpia
            localStorage.setItem('dj_pending_tracks', JSON.stringify(localTracks));

            // 4. FUSIÓN: Ponemos las locales (nuevas) primero, luego las de Google
            const finalPlaylist = [...localTracks.reverse(), ...remoteTracks];
            
            setPlaylist(finalPlaylist);
            setIsLoading(false);

        } catch (error) {
            console.error("Error cargando:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylist();
        const interval = setInterval(fetchPlaylist, 5000); // Refrescar cada 5 seg
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.song) return;
        setIsSubmitting(true);

        const formBody = new URLSearchParams();
        formBody.append(ENTRY_SONG, formData.song);
        formBody.append(ENTRY_ARTIST, formData.artist);
        formBody.append(ENTRY_ALBUM, formData.album);

        try {
            // 1. Enviar a Google (Segundo plano)
            await fetch(FORM_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            });
            
            // 2. Guardar en MEMORIA LOCAL (LocalStorage) inmediatamente
            const newTrack = {
                id: `local-${Date.now()}`, 
                song: formData.song,
                artist: formData.artist || 'Desconocido',
                album: formData.album || 'Single',
                isLocal: true // Marca para saber que es nuestra
            };

            const currentLocals = JSON.parse(localStorage.getItem('dj_pending_tracks') || '[]');
            currentLocals.push(newTrack);
            localStorage.setItem('dj_pending_tracks', JSON.stringify(currentLocals));

            // 3. Forzar actualización visual inmediata
            fetchPlaylist();

        } catch (error) {
            console.error("Error enviando");
        }

        setFormData({ song: '', artist: '', album: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="container">
            <Head>
                <title>DJ Guest List 🎵</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <meta name="theme-color" content="#667eea" />
                <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Poppins:wght@400;600;800&display=swap" rel="stylesheet" />
            </Head>

            <div className="form-section">
                <div className="header">
                    <div className="vinyl-container">
                        <div className="vinyl-icon">💿</div>
                    </div>
                    <h1 className="title">DJ GUEST LIST</h1>
                    <p className="subtitle">¡Pide tu canción y mira qué suena!</p>
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
                            <input name="album" value={formData.album} onChange={handleChange} placeholder="Sale el Sol" />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'ENVIANDO...' : 'AÑADIR A LA PIZARRA ✨'}
                    </button>
                </form>
                
                <button onClick={() => router.push('/homepage')} className="back-btn">← Volver</button>
            </div>

            <div className="board-section">
                <div className="chalkboard">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                        <h2 className="chalk-title" style={{margin:0}}>PETICIONES</h2>
                        <button onClick={fetchPlaylist} className="refresh-btn">↻</button>
                    </div>
                    <div className="chalk-divider"></div>
                    
                    {isLoading ? (
                        <p style={{textAlign:'center', color:'rgba(255,255,255,0.5)'}}>Cargando lista...</p>
                    ) : (
                        <div className="requests-list">
                            {playlist.length === 0 ? (
                                <div style={{textAlign:'center', opacity:0.5, padding:'20px'}}>
                                    <p>Aún no hay peticiones...</p>
                                    <small style={{fontSize:'10px'}}>¡Sé el primero en pedir!</small>
                                </div>
                            ) : (
                                playlist.map((track) => (
                                    <div key={track.id} className="chalk-item">
                                        <div className="chalk-song">
                                            "{track.song}" 
                                            {/* Indicador visual de que se está enviando (opcional) */}
                                            {track.isLocal && <span style={{fontSize:'12px', color:'#68D391', marginLeft:'5px'}}> (Enviando...)</span>}
                                        </div>
                                        <div className="chalk-details">
                                            <span className="artist">🎤 {track.artist}</span>
                                            <span className="separator">|</span>
                                            <span className="album">💿 {track.album}</span>
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
                .container { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Poppins', sans-serif; background: #1a202c; overflow-x: hidden; }
                .form-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px 40px 20px; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); width: 100%; }
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
                .submit-btn { width: 100%; padding: 18px; margin-top: 10px; background: #2d3748; color: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); touch-action: manipulation; }
                .back-btn { background: none; border: none; color: rgba(255,255,255,0.8); margin-top: 20px; padding: 10px; font-size: 14px; font-weight: 600; }
                .board-section { flex: 1; padding: 30px 20px; display: flex; justifyContent: center; width: 100%; }
                .chalkboard { width: 100%; max-width: 500px; background: #2b2b2b; border: 10px solid #5D4037; border-radius: 8px; padding: 20px; color: #fff; font-family: 'Permanent Marker', cursive; min-height: 300px; background-image: url("https://www.transparenttextures.com/patterns/black-chalk.png"); }
                .chalk-title { font-size: 22px; color: rgba(255,255,255,0.95); letter-spacing: 1px; }
                .chalk-divider { height: 2px; background: rgba(255,255,255,0.2); margin-bottom: 15px; }
                .chalk-item { margin-bottom: 15px; animation: slideIn 0.4s ease-out; }
                .chalk-song { font-size: 20px; margin-bottom: 5px; color: white; line-height: 1.3; }
                .chalk-details { font-size: 14px; opacity: 0.8; font-family: 'Poppins', sans-serif; }
                .artist { color: #f6e05e; }
                .album { color: #63b3ed; }
                .chalk-line { margin-top: 10px; border-bottom: 1px dashed rgba(255,255,255,0.15); }
                .refresh-btn { background: none; border: 1px solid rgba(255,255,255,0.4); color: white; border-radius: 6px; cursor: pointer; padding: 5px 10px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 380px) { .form-section { padding-top: 50px; padding-left: 15px; padding-right: 15px; } .title { font-size: 24px; } .form-card { padding: 20px 15px; } .row-group { flex-direction: column; gap: 0; } .input-group { margin-bottom: 12px; } }
            `}</style>
        </div>
    );
}
