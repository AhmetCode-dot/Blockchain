const { ethers } = require("ethers");

// 1. AYARLAR
// Ganache RPC URL'si (Docker ağı üzerinden)
const RPC_URL = process.env.RPC_URL || "http://ganache:8545";

// Ganache ilk açıldığında verdiği varsayılan özel anahtarlardan biri (ÖDEV İÇİN SABİT)
// NOT: Gerçek hayatta bu asla koda yazılmaz!
const PRIVATE_KEY = "0x" + "buraya_ganache_private_key_gelecek_bunu_calistirinca_gorecegiz"; 
// Şimdilik boş kalsın, proje çalışınca Ganache loglarından alıp buraya yazacağız.
// Ya da Ganache'ı belirli bir key ile başlatabiliriz (Aşağıda Docker Compose'da yapacağız).

// Kontrat Adresi (Deploy ettikten sonra burayı güncelleyeceğiz)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x..."; 

// Kontrat ABI (Fonksiyon tanımları)
const ABI = [
    "function issue(bytes32 id, bytes32 holderHash, string title, string issuer, uint64 expiresAt) external",
    "function verify(bytes32 id, bytes32 holderHash) external view returns (bool valid, bool isRevoked, uint64 issuedAt, uint64 expiresAt, string title, string issuer)"
];

async function main() {
    console.log("Blockchain'e bağlanılıyor...", RPC_URL);
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Cüzdanı oluştur
    // Önemli: Eğer private key set edilmemişse hata verir, burayı docker compose sonrası düzelteceğiz.
    // Şimdilik örnek bir key koyalım (Ganache default keylerinden biri)
    // Bu key, 'test test ...' mnemonic'inin 0. indexli (Owner) hesabıdır.
    // Ganache & Hardhat varsayılan Mnemonic'inin 0. indexli (OWNER) hesabı
// Adresi: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

    //Orijinal cüzdan (Owner Account #0)
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    // --- SENARYO 6.2 İÇİN YETKİSİZ CÜZDAN ---
// Bu cüzdan Account #1'dir (Owner Account #0 idi).
//const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    // --- SENARYO ---
    console.log("\n--- SERTİFİKA İŞLEMLERİ BAŞLIYOR ---");

    // 1. Veri Hazırlama (Hashleme)
    const ogrNo = "12345";
    const adSoyad = "Ahmet Yilmaz";
    const salt = "gizliTuz123"; // Rastgele üretilmeli

    const payload = `${ogrNo}|${adSoyad.toUpperCase().trim()}|${salt}`;
    const holderHash = ethers.keccak256(ethers.toUtf8Bytes(payload));
    const certId = ethers.id("Sertifika-" + Date.now()); // Unique ID

    console.log(`Sertifika ID: ${certId}`);
    console.log(`Kişi Hash (Gizli): ${holderHash}`);

    // 2. Sertifika Verme (Issue)
    try {
        console.log("Sertifika zincire yazılıyor...");
        const tx = await contract.issue(
            certId,
            holderHash,
            "Blockchain Uzmanlık Sertifikası",
            "Teknoloji Üniversitesi",
            0 // Süresiz
        );
        await tx.wait();
        console.log("✅ Sertifika başarıyla oluşturuldu! TX Hash:", tx.hash);
    } catch (e) {
        console.error("Hata (Issue):", e.message);
    }

    // 3. Sertifika Doğrulama (Verify) orijinal veri ile
    try {
        console.log("Sertifika doğrulanıyor...");
        const result = await contract.verify(certId, holderHash);

        console.log("\n--- DOĞRULAMA SONUCU ---");
        console.log("Geçerli mi?:", result.valid);
        console.log("İptal durumu:", result.isRevoked);
        console.log("Başlık:", result.title);
        console.log("Veren Kurum:", result.issuer);
    } catch (e) {
         console.error("Hata (Verify):", e.message);
    } 


         // 3. Sertifika Doğrulama (Verify) 6.3 senaryosu için - veri tahribatı simülasyonu
       /* try {
            console.log("Sertifika doğrulanıyor...");
            
            // --- SENARYO 6.3: VERİ TAHRİBATI SİMÜLASYONU ---
            console.log("!!! DİKKAT: Kötü niyetli kişi veriyi değiştirdi !!!");
            // Gerçek isim 'Ahmet Yilmaz' idi, biz 'Mehmet Yilmaz' yaptık.
            const fakePayload = `${ogrNo}|MEHMET YILMAZ|${salt}`; 
            const fakeHash = ethers.keccak256(ethers.toUtf8Bytes(fakePayload));

            // Doğrulamaya yanlış hash gönderiyoruz
            const result = await contract.verify(certId, fakeHash); 
            
            console.log("\n--- DOĞRULAMA SONUCU ---");
            console.log("Geçerli mi?:", result.valid); // BURASI FALSE ÇIKMALI
            console.log("İptal durumu:", result.isRevoked);
            
        } catch (e) {
             console.error("Hata (Verify):", e.message);
        } */

}

// Basit bir bekleme döngüsü, konteyner hemen kapanmasın diye
setInterval(() => {}, 1000);

// Eğer contract adresi girilmişse çalıştır
if (process.env.CONTRACT_ADDRESS && process.env.CONTRACT_ADDRESS.length > 10) {
    main();
} else {
    console.log("Lütfen CONTRACT_ADDRESS çevre değişkenini girin.");
}