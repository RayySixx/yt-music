import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let isInitialized = false;

// Variabel Cache & Counter untuk 20x request
let cache = {};
let requestCount = 0;
const MAX_REQUESTS = 20;

// Fungsi helper buat inisialisasi API
const getYTMusic = async () => {
    if (!isInitialized) {
        await ytmusic.initialize();
        isInitialized = true;
    }
    return ytmusic;
};

// Fungsi helper buat ngatur Cache
const withCache = async (cacheKey, fetchFunction) => {
    requestCount++;
    console.log(`[REQ #${requestCount}] Action: ${cacheKey}`);

    if (requestCount >= MAX_REQUESTS) {
        console.log('Limit 20 request tercapai! Mengosongkan cache...');
        cache = {}; 
        requestCount = 0;
    }

    if (cache[cacheKey]) {
        return { source: 'cache', request_count: requestCount, data: cache[cacheKey] };
    }

    const data = await fetchFunction();
    cache[cacheKey] = data; 
    
    return { source: 'api', request_count: requestCount, data };
};

// HANDLER UTAMA VERCEL
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Ambil parameter action dari URL
    const { action, query, id } = req.query;

    if (!action) {
        return res.status(400).json({ error: 'Kasih parameter ?action= bro (pilihan: home, search, artist, album)' });
    }

    try {
        const yt = await getYTMusic();
        let response;

        // Routing berdasarkan "action"
        switch (action) {
            case 'home':
                response = await withCache('home_feed', () => yt.getHome());
                break;

            case 'search':
                if (!query) return res.status(400).json({ error: 'Parameter ?query= wajib diisi buat search' });
                response = await withCache(`search_${query}`, () => yt.search(query));
                break;

            case 'artist':
                if (!id) return res.status(400).json({ error: 'Parameter ?id= wajib diisi (Channel ID)' });
                response = await withCache(`artist_${id}`, () => yt.getArtist(id));
                break;

            case 'album':
                if (!id) return res.status(400).json({ error: 'Parameter ?id= wajib diisi (Browse ID)' });
                // Ini otomatis ngebawa list lagunya sekalian bro
                response = await withCache(`album_${id}`, () => yt.getAlbum(id));
                break;

            default:
                return res.status(400).json({ error: 'Action tidak valid. Pilih: home, search, artist, album' });
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error('Scraping Error:', error);
        return res.status(500).json({ error: 'Gagal memproses permintaan lu bro', details: error.message });
    }
}
