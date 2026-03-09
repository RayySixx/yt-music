import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let isApiInitialized = false;

// Lu bisa implementasi sistem cache 20x request kayak sebelumnya di sini
// Gua buat simple dulu biar lu paham alurnya

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        if (!isApiInitialized) {
            await ytmusic.initialize();
            isApiInitialized = true;
        }

        // Ini bakal ngambil SEMUA section yang ada di beranda YT Music
        const homeData = await ytmusic.getHome();
        
        return res.status(200).json({
            success: true,
            data: homeData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Gagal mengambil data beranda' });
    }
}
