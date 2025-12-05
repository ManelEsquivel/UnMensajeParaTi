import React, { useState, useEffect, useRef } from 'react'; // 1. AÑADIMOS useRef
import Head from 'next/head';
import { useRouter } from 'next/router';

// *******************************************************************
// ✅ TUS DATOS
// *******************************************************************
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdUwUkcF_RHlfHdraWI0Vdca6Or6HxE1M_ykj2mfci_cokyoA/formResponse"; 
const ENTRY_SONG   = "entry.38062662"; 
const ENTRY_ARTIST = "entry.1279581249"; 
const ENTRY_ALBUM  = "entry.2026891459"; 
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZ9RxSCBQemScY8lZhfg2Bbi4T5xOoNhTcmENIJSZWFo8yVF0bxd7yXy5gx0HoKIb87-chczYEccKr/pub?output=csv";
// *******************************************************************

export default function DjPage() {
    const router = useRouter();
    
    // 2. CREAMOS LA REFERENCIA PARA EL SCROLL
    const boardRef = useRef(null);

    // --- ESTADOS ---
    const [formData, setFormData] = useState({ song: '', artist: '', album: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNotice, setShowNotice] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);
    const [playlist, setPlaylist] = useState([]);

    // 1️⃣ AL CARGAR LA PÁGINA
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${SHEET_CSV_URL}&uid=${Date.now()}`);
                const text = await res.text();
                let remoteTracks = [];
                
                if (text && !text.trim().startsWith("<") && text.length > 50) {
                    const rows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').slice(1);
                    const separator = text.indexOf(';') > -1 && text.indexOf(',') < text.indexOf(';') ? ';' : ',';
                    
                    remoteTracks = rows.map((row) => {
                        if (!row || row.trim() === "") return null;
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
                            album: clean(columns[3]) || "", 
                            isLocal: false 
                        };
                    }).filter(t => t && t.song).reverse();
                }

                const localData = localStorage.getItem('dj_pending_tracks');
                if (localData) {
                    let localTracks = JSON.parse(localData);
                    const pendingTracks = localTracks.filter(local => {
                        const yaEstaEnExcel = remoteTracks.some(remote => remote.id === local.id);
                        return !yaEstaEnExcel;
                    });
                    localStorage.setItem('dj_pending_tracks', JSON.stringify(pendingTracks));
                    setPlaylist([...pendingTracks.reverse(), ...remoteTracks]);
                } else {
                    setPlaylist(remoteTracks);
                }

            } catch (error) {
                console.error("Error cargando lista:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.song) return;
        setIsSubmitting(true);
        
        const songClean = formData.song.trim();
        const artistClean = (formData.artist || 'Desconocido').trim();
        const uniqueId = `${songClean}-${artistClean}`.replace(/\s+/g, '-').toLowerCase();

        const newTrack = {
            id: uniqueId, 
            song: songClean, 
            artist: artistClean, 
            album: formData.album.trim(), 
            isLocal: true,
            timestamp: Date.now() 
        };

        setPlaylist(prev => [newTrack, ...prev]);
        const currentLocals = JSON.parse(localStorage.getItem('dj_pending_tracks') || '[]');
        currentLocals.push(newTrack);
        localStorage.setItem('dj_pending_tracks', JSON.stringify(currentLocals));

        setFormData({ song: '', artist: '', album: '' });
        setShowNotice(true);
        setTimeout(() => setShowNotice(false), 8000);

        const formBody = new URLSearchParams();
        formBody.append(ENTRY_SONG, songClean);
        formBody.append(ENTRY_ARTIST, artistClean);
        formBody.append(ENTRY_ALBUM, formData.album.trim());

        try {
            await fetch(FORM_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            });
        } catch (error) { console.error("Error envio"); }
        
        setIsSubmitting(false);
    };

    // 3. FUNCIÓN PARA HACER SCROLL
    const scrollToBoard = () => {
        if (boardRef.current) {
            boardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Head><title>Cargando Pizarra...</title></Head>
                <div className="vinyl-icon large-spin">💿</div>
                <h2 className="loading-text">Cargando la lista...</h2>
                <style jsx>{`
                    .loading-container {
                        height: 100vh; width: 100vw; background: #1a202c;
                        display: flex; flex-direction: column; justifyContent: center; alignItems: center;
                        color: white; font-family: 'Poppins', sans-serif;
                    }
                    .large-spin { font-size: 80px; animation: spin 1s linear infinite; margin-bottom: 20px; }
                    .loading-text { font-size: 18px; font-weight: 400; opacity: 0.8; animation: pulse 1.5s infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="container">
            <Head>
                <title>Dj Pizarra 🎵</title>
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
                        {isSubmitting ? 'ENVIANDO...' : 'AÑADIR A LA PIZARRA ✨'}
                    </button>
                </form>
                
                <button onClick={() => router.push('/homepage')} className="back-btn">← Volver</button>

                {/* 4. AÑADIMOS EL BOTÓN DE VER LISTADO */}
                <div onClick={scrollToBoard} className="scroll-btn">
                    <div className="scroll-icon">📜</div>
                    <span>Ver listado de canciones</span>
                    <div className="arrow-down">▼</div>
                </div>
            </div>

            {showNotice && (
                <div className="notice-box">
                    <div className="notice-title">✅ ¡Anotada en la pizarra!</div>
                    <div className="notice-text">
                        Tú ya la ves, pero el resto de invitados la verán cuando recarguen (aprox 5 min). 🐢
                    </div>
                </div>
            )}

            {/* 5. AÑADIMOS LA REF AQUÍ */}
            <div className="board-section" ref={boardRef}>
                <div className="chalkboard">
                    <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:'10px'}}>
                        <h2 className="chalk-title" style={{margin:0}}>PETICIONES</h2>
                    </div>
                    <div className="chalk-divider-top"></div>
                    
                    {playlist.length === 0 ? (
                        <div style={{textAlign:'center', opacity:0.5, padding:'20px'}}>
                            <p>La pizarra está vacía... ¡Estrena tú la lista!</p>
                        </div>
                    ) : (
                        <div className="requests-list">
                            {playlist.map((track, index) => (
                                <div key={track.id + index} className="chalk-item">
                                    <div className="chalk-content">
                                        <div className="chalk-song">"{track.song}"</div>
                                        <div className="chalk-details">
                                            <span className="artist">🎤 {track.artist}</span>
                                            <span className="separator"> | </span>
                                            <span className="album">💿 {track.album}</span>
                                        </div>
                                    </div>
                                    <div className="chalk-line-separator"></div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="chalk-footer">
                        * Recarga la página para ver nuevas canciones.
                    </div>
                </div>
            </div>

            <style jsx global>{`
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; padding: 0; background: #1a202c; }
            `}</style>

            <style jsx>{`
                .container { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Poppins', sans-serif; background: #1a202c; overflow-x: hidden; padding-bottom: 50px; }
                .form-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px 40px 20px; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); width: 100%; flex-shrink: 0; position: relative; }
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
                .submit-btn:disabled { opacity: 0.7; cursor: wait; }
                
                .back-btn { background: none; border: none; color: rgba(255,255,255,0.7); margin-top: 20px; padding: 5px 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
                
                /* ESTILOS DEL NUEVO BOTÓN SCROLL */
                .scroll-btn {
                    margin-top: 15px;
                    display: flex; flex-direction: column; align-items: center;
                    color: white; cursor: pointer; opacity: 0.9;
                    animation: float 2s ease-in-out infinite;
                }
                .scroll-btn:hover { opacity: 1; }
                .scroll-icon { font-size: 24px; margin-bottom: 2px; }
                .scroll-btn span { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px dashed rgba(255,255,255,0.5); padding-bottom: 2px; }
                .arrow-down { font-size: 10px; margin-top: 5px; opacity: 0.7; }

                .notice-box { background: #C6F6D5; border-left: 5px solid #48BB78; padding: 15px; margin: 20px 20px 0 20px; border-radius: 8px; color: #22543D; animation: slideIn 0.5s ease-out; max-width: 500px; width: 90%; align-self: center; }
                .notice-title { font-weight: 800; margin-bottom: 5px; font-size: 14px; }
                .notice-text { font-size: 12px; line-height: 1.4; }

                .board-section { padding: 30px 20px; display: flex; justifyContent: center; width: 100%; flex-grow: 1; }
                
                .chalkboard { width: 100%; max-width: 500px; background: #2b2b2b; border: 10px solid #5D4037; border-radius: 8px; padding: 20px; color: #fff; font-family: 'Permanent Marker', cursive; min-height: 300px; height: fit-content; background-image: url("https://www.transparenttextures.com/patterns/black-chalk.png"); display: flex; flex-direction: column; }
                
                .requests-list { display: flex; flex-direction: column; gap: 0px; width: 100%; margin-bottom: 15px; }
                .chalk-item { width: 100%; display: flex; flex-direction: column; animation: slideIn 0.4s ease-out; }
                .chalk-content { padding: 12px 5px; }

                .chalk-title { font-size: 22px; color: rgba(255,255,255,0.95); letter-spacing: 1px; text-align: center; }
                .chalk-divider-top { height: 2px; background: rgba(255,255,255,0.3); margin-bottom: 10px; }
                
                .chalk-song { font-size: 22px; margin-bottom: 4px; color: #fff; line-height: 1.2; word-break: break-word; }
                .chalk-details { font-size: 14px; opacity: 0.9; font-family: 'Poppins', sans-serif; display: flex; flex-wrap: wrap; align-items: center; }
                .artist { color: #f6e05e; }
                .album { color: #63b3ed; }
                .separator { color: rgba(255,255,255,0.4); margin: 0 5px; }
                
                .chalk-line-separator { width: 100%; height: 1px; background-image: linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.3), rgba(255,255,255,0.05)); margin: 2px 0; }
                
                .chalk-footer { margin-top: auto; text-align: center; font-size: 10px; font-family: 'Poppins', sans-serif; opacity: 0.4; font-style: italic; padding-top: 10px; }

                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(5px); } 100% { transform: translateY(0px); } }

                @media (max-width: 380px) { .form-section { padding-top: 50px; } .title { font-size: 24px; } .form-card { padding: 20px 15px; } }
            `}</style>
        </div>
    );
}
