# 🚗 Araç Profil Oluşturucu

Google Gemini AI kullanarak otomatik araç profilleri oluşturan Tauri + React uygulaması.

## ✨ Özellikler

- 🤖 **AI Destekli**: Gemini 2.5 Flash modeli ile detaylı araç analizleri
- 📊 **Toplu İşlem**: Excel'den araç listesi yükleyip otomatik JSON üretimi
- 💾 **Otomatik Kayıt**: Her araç için ayrı JSON dosyası oluşturma
- 🎯 **Detaylı Profiller**: Piyasa bilgileri, motor varyantları, potansiyel sorunlar
- ⚡ **Hızlı ve Güvenilir**: Rate limit koruması ve retry mekanizması

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- Rust 1.70+
- Google Gemini API Key

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/KULLANICI_ADINIZ/arac-profil-olusturucu.git
cd arac-profil-olusturucu
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **API Key ayarlayın**

`.env` dosyası oluşturun:
```env
VITE_GOOGLE_API_KEY=your_gemini_api_key_here
```

4. **Uygulamayı başlatın**
```bash
npm run tauri dev
```

## 📖 Kullanım

### Tek Araç Modu
1. Marka, model ve yıl bilgilerini girin
2. "Profil Oluştur" butonuna tıklayın
3. JSON çıktısını indirin

### Toplu İşlem Modu
1. "Excel Yükle" butonuna tıklayın
2. Araç listesi içeren Excel dosyasını seçin
3. "Toplu İşleme Başla" ile otomatik işlem başlatın

**Excel Format Örneği:**
```
| Marka  | Model    | Yıl  |
|--------|----------|------|
| BMW    | 3 Serisi | 2020 |
| Audi   | A4       | 2019 |
```

## 🏗️ Proje Yapısı

```
arac-profil-olusturucu/
├── src/
│   ├── App.jsx              # Ana uygulama bileşeni
│   ├── services/
│   │   └── aiService.js     # Gemini API entegrasyonu
│   └── utils/
│       ├── excelUtils.js    # Excel okuma işlemleri
│       └── jsonUtils.js     # JSON işleme yardımcıları
├── src-tauri/               # Tauri backend
├── .env                     # API anahtarları (git'e eklenmez)
└── package.json
```

## 🔧 Geliştirme

```bash
# Development mode
npm run tauri dev

# Build (production)
npm run tauri build

# Sadece web geliştirme
npm run dev
```

## 📋 Çıktı Formatı

Oluşturulan JSON dosyaları şu yapıyı takip eder:

```json
{
  "marka": "BMW",
  "model": "3 Serisi",
  "model_yili": 2020,
  "piyasa_bilgileri": { ... },
  "model_genel_bakis": {
    "one_cikan_olumlu_yonler": [...],
    "dikkat_edilmesi_gereken_genel_konular": [...]
  },
  "motor_sanziman_varyantlari": [
    {
      "varyant_adi": "...",
      "potansiyel_sorunlar_ve_maliyetler": [...]
    }
  ]
}
```

Detaylı format için: [`ORNEK_CIKTI_FORMATI.md`](ORNEK_CIKTI_FORMATI.md)

## 🛠️ Teknolojiler

- **Frontend**: React 18 + Vite
- **Desktop**: Tauri 2
- **AI**: Google Gemini 2.5 Flash
- **Excel**: xlsx
- **UI**: Tailwind CSS

## 📝 Lisans

MIT License - Detaylar için `LICENSE` dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için: [GitHub Issues](https://github.com/KULLANICI_ADINIZ/arac-profil-olusturucu/issues)

---

⭐ Projeyi beğendiyseniz yıldızlamayı unutmayın!

## ⚠️ Önemli Not

`.env` dosyasını oluşturmayı unutmayın:

```bash
echo "VITE_GOOGLE_API_KEY=your_api_key_here" > .env
```
