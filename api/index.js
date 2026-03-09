const express = require('express');
const cors = require('cors');
const YTMusic = require('ytmusic-api');

const app = express();
app.use(cors());

const ytmusic = new YTMusic();
let isInitialized = false;

// Fungsi untuk inisialisasi ytmusic-api
async function init() {
    if (!isInitialized) {
        await ytmusic.initialize();
        isInitialized = true;
    }
}

// 1. ENDPOINT HOME (/api/home)
// Mengembalikan rekomendasi lagu/album secara umum
app.get('/api/home', async (req, res) => {
    try {
        await init();
        // Menggunakan pencarian chart/populer sebagai pengganti home (karena home asli butuh cookies login)
        const trending = await ytmusic.search('Lagu populer hari ini', 'song');
        const playlists = await ytmusic.search('Top Hits Indonesia', 'playlist');
        
        res.json({ 
            status: true, 
            data: {
                recommended_songs: trending,
                recommended_playlists: playlists
            } 
        });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 2. ENDPOINT PLAYLIST (/api/playlist?list=ID_PLAYLIST)
// Contoh: /api/playlist?list=PLL7nDOFbad5oCBCoLz5GJCu6yqGvQwe9Y
app.get('/api/playlist', async (req, res) => {
    try {
        const { list } = req.query;
        if (!list) return res.status(400).json({ status: false, msg: 'Parameter list dibutuhkan' });
        
        await init();
        const playlist = await ytmusic.getPlaylist(list);
        
        res.json({ status: true, data: playlist });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 3. ENDPOINT WATCH/SONG (/api/watch?v=ID_LAGU)
// Contoh: /api/watch?v=MODbh7nKWmQ
app.get('/api/watch', async (req, res) => {
    try {
        const { v } = req.query;
        if (!v) return res.status(400).json({ status: false, msg: 'Parameter v (id lagu) dibutuhkan' });
        
        await init();
        const songData = await ytmusic.getSong(v);
        
        // Coba scrape lirik jika tersedia
        let lyrics = null;
        try {
            lyrics = await ytmusic.getLyrics(v);
        } catch (err) {
            lyrics = "Lirik tidak tersedia untuk lagu ini.";
        }
        
        res.json({ 
            status: true, 
            data: songData,
            lyrics: lyrics
        });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 4. ENDPOINT SEARCH (/api/search?q=QUERY)
// Contoh: /api/search?q=monolog
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, msg: 'Parameter q (query pencarian) dibutuhkan' });
        
        await init();
        const results = await ytmusic.search(q);
        
        res.json({ status: true, data: results });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// Export untuk Vercel Serverless
module.exports = app;
