####Blokzincir Tabanlı Dijital Sertifika Sistemi####

Bu proje, Docker tabanlı bir blokzincir altyapısı üzerinde çalışan, **kişisel veri gizliliğine (KVKK) uygun** bir dijital sertifika oluşturma, dağıtma ve doğrulama sistemidir. 

Proje; Ethereum tabanlı akıllı kontratlar, Node.js istemcileri ve mikroservis mimarisi kullanılarak uçtan uca geliştirilmiştir.

---

### Proje Özellikleri ###

* **Dockerize Edilmiş Altyapı:** Tek komutla ayağa kalkan Ganache (Blokzincir), Hardhat (Derleyici) ve Client (İstemci) servisleri.
* **Akıllı Kontrat (Smart Contract):** Sertifika oluşturma (issue), doğrulama (verify) ve iptal etme (revoke) yetenekleri.
* **Veri Gizliliği:** Kişisel veriler (Ad, Soyad, Öğrenci No) asla blokzincire açık olarak yazılmaz. Veriler `Keccak256` ile hash'lenir ve tuzlanır (salting).
* **Otomatik İstemci:** Sertifika sürecini simüle eden Node.js tabanlı istemci.

---

###Teknik Yığın

| Bileşen | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Blockchain** | Ganache | Yerel Ethereum ağı simülasyonu. |
| **Backend** | Node.js & Ethers.js | Blokzincir ile etkileşim sağlayan kütüphaneler. |
| **Kontrat** | Solidity & Hardhat | Akıllı kontrat geliştirme ve test ortamı. |
| **DevOps** | Docker & Compose | Konteyner orkestrasyonu. |

---

###Proje Yapısı

```text
blokzincir-sertifika-projesi/
├── client/                 # Node.js İstemci Uygulaması
│   ├── index.js            # Sertifika oluşturma ve doğrulama kodları
│   └── Dockerfile          # İstemci konteyner ayarları
├── dapp/                   # Akıllı Kontrat Geliştirme Ortamı
│   ├── contracts/          # CertificateRegistry.sol (Solidity Kodu)
│   ├── scripts/            # Deploy scriptleri
│   ├── hardhat.config.js   # Hardhat ağ ayarları
│   └── Dockerfile          # Hardhat konteyner ayarları
├── docker-compose.yml      # Tüm sistemi başlatan ana dosya
└── README.md               # Proje dokümantasyonu

### Kurulum ve Çalıştırma Adımları
Bu projeyi çalıştırmak için bilgisayarınızda Docker Desktop yüklü olmalıdır.

1. Sistemi Başlatın
Terminali proje klasöründe açın ve servisleri ayağa kaldırın (terminalde aşağıdaki komutu çalıştırın):
docker compose up -d --build
Bu işlem Ganache ağını başlatır ve gerekli bağımlılıkları yükler.

2. Akıllı Kontratı Dağıtın (Deploy)
Hardhat konteyneri üzerinden kontratı yerel zincire (Ganache) gönderin (terminalde aşağıdaki komutu çalıştırın):
docker compose exec hardhat npx hardhat run scripts/deploy.js --network ganache
Önemli: Bu komutun çıktısında verilen kontrat adresini (Örn: 0x5Fb...) kopyalayın.

3. İstemciyi Yapılandırın
docker-compose.yml dosyasını açın ve client servisi altındaki CONTRACT_ADDRESS alanını kopyaladığınız adresle güncelleyin:
environment:
  RPC_URL: http://ganache:8545
  CONTRACT_ADDRESS: "0xKOPYALADIGINIZ_ADRES_BURAYA"

4. Sertifika Senaryosunu Çalıştırın
Yapılandırmayı kaydettikten sonra istemciyi çalıştırın:
docker compose up -d --no-deps client

5. Sonuçları Görüntüleyin
Sistemin sertifikayı oluşturduğunu ve doğruladığını görmek için logları izleyin:
docker compose logs -f client


### Örnek Çalışma Çıktısı ###
Aşağıdaki ekran görüntüsünde görüldüğü üzere; sistem bir öğrenci için Hash üretmiş, sertifikayı zincire yazmış ve ardından doğruluğunu teyit etmiştir.

time="2025-11-28T20:50:43+03:00" level=warning msg="C:\\Users\\ahmet\\Desktop\\blokzincir-sertifika-projesi\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"

client-1  | Blockchain'e bağlanılıyor... http://ganache:8545

client-1  | 

client-1  | --- SERTİFİKA İŞLEMLERİ BAŞLIYOR ---

client-1  | Sertifika ID: 0x6504bcd13341c0acf9835cab061a5d16338e22643a9d3981390de42b665615ac

client-1  | Kişi Hash (Gizli): 0x43ff9e31f59d0fb2fc431d750b1981b526761613d59379db1a48f78bed7dbdb8

client-1  | Sertifika zincire yazılıyor...

client-1  | ✅ Sertifika başarıyla oluşturuldu! TX Hash: 0xb4cabb8a135be172106a7c00c125c1b160570b047f8ade9c714cb8f5d6841eb8

client-1  | Sertifika doğrulanıyor...

client-1  |

client-1  | --- DOĞRULAMA SONUCU ---

client-1  | Geçerli mi?: true

client-1  | İptal durumu: false

client-1  | Başlık: Blockchain Uzmanlık Sertifikası

client-1  | Veren Kurum: Teknoloji Üniversitesi


### Güvenlik ve KVKK Değerlendirmesi ###
Bu projede kişisel verilerin korunması (KVKK/GDPR) için şu yöntemler izlenmiştir:

Veri Minimizasyonu: Blokzincire Ad Soyad veya TCKN gibi veriler yazılmaz.

Hashing & Salting: İstemci tarafında SHA-256 (Keccak) algoritması kullanılır. Tahmin edilememesi için veriye rastgele bir "Salt" (Tuz) eklenerek Hash üretilir.

Formül: Hash = keccak256(ÖğrenciNo + AdSoyad + Salt)

Yetki Kontrolü: Kontrat üzerinde onlyOwner modifiyeri bulunur. Sadece yetkili kurum (Owner cüzdanı) sertifika oluşturabilir veya iptal edebilir.

Proje https://github.com/AhmetCode-dot/Blockchain adresine push edilmiştir.



