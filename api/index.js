import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let isInitialized = false;

export default async function handler(req, res) {
    try {
        // Cek apakah API udah jalan atau belum
        if (!isInitialized) {
            await ytmusic.initialize();
            isInitialized = true;
        }

        // Kita tes nyari satu lagu aja secara hardcode
        const testSearch = await ytmusic.search("dewa 19");
        
        return res.status(200).json({ 
            status: "BERHASIL BRO!", 
            data: testSearch 
        });

    } catch (error) {
        // Kalau gagal, error aslinya bakal ditampilin di layar
        return res.status(500).json({ 
            status: "GAGAL", 
            pesan_error: error.message 
        });
    }
}
