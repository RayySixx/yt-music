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

// 1. ENDPOINT HOME
app.get('/api/home', async (req, res) => {
    try {
        await init();
        const trending = await ytmusic.search('Lagu populer indonesia', 'song');
        const playlists = await ytmusic.search('Top Hits', 'playlist');
        res.json({ status: true, data: { recommended_songs: trending, recommended_playlists: playlists } });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 2. ENDPOINT PLAYLIST (Sudah diperbaiki error Prefix VL)
app.get('/api/playlist', async (req, res) => {
    try {
        let { list } = req.query;
        if (!list) return res.status(400).json({ status: false, msg: 'Parameter list dibutuhkan' });
        
        // Hapus prefix 'VL' jika ada, karena bikin ytmusic-api error
        if (list.startsWith('VL')) list = list.substring(2);
        
        await init();
        const playlist = await ytmusic.getPlaylist(list);
        res.json({ status: true, data: playlist });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 3. ENDPOINT ALBUM (BARU)
app.get('/api/album', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ status: false, msg: 'Parameter id dibutuhkan' });
        
        await init();
        const album = await ytmusic.getAlbum(id);
        res.json({ status: true, data: album });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 4. ENDPOINT ARTIST (BARU)
app.get('/api/artist', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ status: false, msg: 'Parameter id dibutuhkan' });
        
        await init();
        const artist = await ytmusic.getArtist(id);
        res.json({ status: true, data: artist });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 5. ENDPOINT WATCH/SONG
app.get('/api/watch', async (req, res) => {
    try {
        const { v } = req.query;
        if (!v) return res.status(400).json({ status: false, msg: 'Parameter v dibutuhkan' });
        
        await init();
        const songData = await ytmusic.getSong(v);
        res.json({ status: true, data: songData });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

// 6. ENDPOINT SEARCH
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, msg: 'Parameter q dibutuhkan' });
        
        await init();
        const results = await ytmusic.search(q);
        res.json({ status: true, data: results });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

module.exports = app;
