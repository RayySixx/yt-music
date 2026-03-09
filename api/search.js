import YTMusic from 'ytmusic-api';

// Inisialisasi API dan variabel Cache di luar handler
// Biar variabel ini tetep hidup selama instance serverless-nya nyala
const ytmusic = new YTMusic();
let isApiInitialized = false;

let cache = {};
let requestCount = 0;
const MAX_REQUESTS = 20;

export default async function handler(req, res) {
    // Cuma nerima method GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Kasih parameter query dong bro, contoh: ?query=nadin+amizah' });
    }

    // Tambah counter setiap kali ada request masuk
    requestCount++;
    console.log(`Request ke-${requestCount}`);

    // LOGIKA CACHE: Hapus cache kalau udah nyentuh batas 20 request
    if (requestCount >= MAX_REQUESTS) {
        console.log('Limit 20 request tercapai. Menghapus cache...');
        cache = {}; // Kosongkan cache
        requestCount = 0; // Reset counter
    }

    // Cek apakah data pencarian ini udah ada di cache
    if (cache[query]) {
        return res.status(200).json({
            source: 'cache',
            request_count: requestCount,
            data: cache[query]
        });
    }

    // Kalau nggak ada di cache, kita scrape dari YouTube Music API
    try {
        // Inisialisasi ytmusic cuma sekali aja biar hemat waktu
        if (!isApiInitialized) {
            await ytmusic.initialize();
            isApiInitialized = true;
        }

        // Cari lagu berdasarkan query
        const results = await ytmusic.searchSongs(query);
        
        // Simpan hasil scraping ke dalam cache
        cache[query] = results;

        return res.status(200).json({
            source: 'api',
            request_count: requestCount,
            data: results
        });

    } catch (error) {
        console.error('Error scraping:', error);
        return res.status(500).json({ error: 'Gagal nge-scrape data dari YouTube Music' });
    }
}
