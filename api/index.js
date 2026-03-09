const express = require('express');
const cors = require('cors');
const YTMusic = require('ytmusic-api');

const app = express();
app.use(cors());

const ytmusic = new YTMusic();
let isInitialized = false;

async function init() {
    if (!isInitialized) {
        await ytmusic.initialize();
        isInitialized = true;
    }
}

// 1. ENDPOINT HOME (Lengkap dengan Song, Playlist, Album)
app.get('/api/home', async (req, res) => {
    try {
        await init();
        // Memaksa API hanya mencari tipe spesifik agar tidak tercampur video biasa
        const songs = await ytmusic.search('Lagu populer', 'song');
        const playlists = await ytmusic.search('Top Hits Indonesia', 'playlist');
        const albums = await ytmusic.search('Album rilis terbaru', 'album');

        res.json({ 
            status: true, 
            data: { 
                songs: songs.slice(0, 10), 
                playlists: playlists.slice(0, 10),
                albums: albums.slice(0, 10)
            } 
        });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 2. ENDPOINT SEARCH (Strict Filter - HANYA PURE MUSIC)
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, msg: 'Parameter q dibutuhkan' });
        
        await init();
        const results = await ytmusic.search(q);
        
        // FILTERING KETAT: Buang semua "video" biasa (cover/vlog), sisakan official music
        const pureMusic = results.filter(item => {
            return item.type === 'song' || item.type === 'artist' || item.type === 'album' || item.type === 'playlist';
        });

        res.json({ status: true, data: pureMusic });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 3. ENDPOINT PLAYLIST (Mengambil data pembuat & jumlah lagu)
app.get('/api/playlist', async (req, res) => {
    try {
        let { list } = req.query;
        if (!list) return res.status(400).json({ status: false });
        if (list.startsWith('VL')) list = list.substring(2);
        
        await init();
        const playlist = await ytmusic.getPlaylist(list);
        res.json({ status: true, data: playlist });
    } catch (e) { res.status(500).json({ status: false, error: e.message }); }
});

// 4. ENDPOINT ALBUM
app.get('/api/album', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ status: false });
        await init();
        const album = await ytmusic.getAlbum(id);
        res.json({ status: true, data: album });
    } catch (e) { res.status(500).json({ status: false, error: e.message }); }
});

// 5. ENDPOINT ARTIS
app.get('/api/artist', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ status: false });
        await init();
        const artist = await ytmusic.getArtist(id);
        res.json({ status: true, data: artist });
    } catch (e) { res.status(500).json({ status: false, error: e.message }); }
});

module.exports = app;
