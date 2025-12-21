import { extractJsonFromText } from '../utils/jsonUtils';

export const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'demo-key-123';
const MODEL_NAME = 'gemini-2.5-flash'; // En güncel stable model (Aralık 2025)
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 saniye

const JSON_TEMPLATE = `{
  "marka": "{{MARKA}}",
  "model": "{{MODEL}}",
  "model_yili": {{YIL}},
  "guncelleme_tarihi": "{{TARIH}}",
  "piyasa_bilgileri": {
    "fiyat_tarihi": "{{TARIH}} itibarıyla",
    "not": "Fiyat aralıkları genel bir tahmini yansıtmaktadır.",
    "sifir_km": {
      "durum": "0 KM / Sıfır",
      "fiyat_araligi": "TL cinsinden"
    },
    "ikinci_el_50000_km": {
      "durum": "İkinci El / ~50.000 km",
      "tahmini_model_yili": "{{YIL}}",
      "tahmini_fiyat_araligi": "TL cinsinden"
    },
    "ikinci_el_100000_km": {
      "durum": "İkinci El / ~100.000 km",
      "tahmini_model_yili": "{{YIL}}",
      "tahmini_fiyat_araligi": "TL cinsinden"
    }
  },
  "model_genel_bakis": {
    "one_cikan_olumlu_yonler": [
      {"baslik": "Başlık", "aciklama": "Detaylı açıklama"}
    ],
    "dikkat_edilmesi_gereken_genel_konular": [
      {"baslik": "Başlık", "aciklama": "Detaylı açıklama", "tekrarlanma_sikligi": "Orta", "maliyet_notu": "TL"}
    ]
  },
  "motor_sanziman_varyantlari": [
    {
      "varyant_adi": "Motor adı",
      "varyant_ozellikleri": "Özellikler",
      "varyanta_ozgu_olumlu_yonler": ["Olumlu yön 1"],
      "potansiyel_sorunlar_ve_maliyetler": [
        {"sorun_basligi": "Sorun", "aciklama": "Açıklama", "tekrarlanma_sikligi": "Orta", "tahmini_tamir_maliyeti": "TL"}
      ]
    }
  ]
}`;

/**
 * AI'dan araç profili getirir
 */
export const generateVehicleProfile = async (marka, model, yil, retryCount = 0) => {
  if (!marka || !model || !yil) {
    console.error('❌ Eksik araç bilgisi');
    return null;
  }

  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `${marka} ${model} ${yil} modeli için detaylı araç profili oluştur.

ÇIKTI FORMATI: Sadece JSON döndür (açıklama yazma).

ŞABLON:
${JSON_TEMPLATE}

DEĞİŞKENLER:
- {{MARKA}} = ${marka}
- {{MODEL}} = ${model}
- {{YIL}} = ${yil}
- {{TARIH}} = ${today}

KURALLAR:
1. Tüm fiyatlar TL cinsinden
2. tekrarlanma_sikligi: sadece "Düşük", "Orta" veya "Yüksek"
3. Her motor varyantı için minimum 2 potansiyel sorun
4. Geçerli JSON formatı (tırnak, virgül kontrolü)
5. one_cikan_olumlu_yonler: minimum 3 öğe
6. dikkat_edilmesi_gereken_genel_konular: minimum 3 öğe`;

  try {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    console.log(`🔄 [${retryCount + 1}/${MAX_RETRIES + 1}] AI isteği: ${marka} ${model} ${yil}`);

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.2,  // Daha deterministik
          topP: 0.9, 
          topK: 20, 
          maxOutputTokens: 8192,
          responseMimeType: "application/json"  // JSON formatı zorla (2.5-flash destekliyor)
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    });

    // Rate limit kontrolü
    if (resp.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const waitTime = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.warn(`⏳ Rate limit! ${waitTime / 1000}s bekleniyor...`);
        await new Promise((r) => setTimeout(r, waitTime));
        return generateVehicleProfile(marka, model, yil, retryCount + 1);
      }
      throw new Error('Rate limit aşıldı. 1 dakika bekleyip tekrar deneyin.');
    }

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('❌ API Hatası:', resp.status, errorText.substring(0, 200));
      throw new Error(`API Hatası (${resp.status})`);
    }

    const data = await resp.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error('❌ AI boş yanıt döndü');
      throw new Error('AI boş yanıt döndü');
    }

    console.log('📥 AI yanıtı alındı, ilk 200 karakter:', responseText.substring(0, 200));

    // JSON extraction
    const parsed = extractJsonFromText(responseText);
    
    if (!parsed) {
      console.error('❌ JSON parse başarısız. Tam yanıt:', responseText.substring(0, 1000));
      
      // Retry
      if (retryCount < MAX_RETRIES) {
        console.warn(`🔁 Retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await new Promise(r => setTimeout(r, 2000));
        return generateVehicleProfile(marka, model, yil, retryCount + 1);
      }
      
      throw new Error('AI yanıtı JSON formatında değil');
    }

    // Validasyon
    const requiredFields = ['marka', 'model', 'model_yili', 'piyasa_bilgileri', 'model_genel_bakis', 'motor_sanziman_varyantlari'];
    const missingFields = requiredFields.filter(f => !parsed[f]);
    
    if (missingFields.length > 0) {
      console.error('❌ Eksik alanlar:', missingFields);
      throw new Error(`JSON eksik alanlar içeriyor: ${missingFields.join(', ')}`);
    }

    const formatted = JSON.stringify(parsed, null, 2);
    console.log(`✅ Başarılı: ${marka} ${model} ${yil} (${formatted.length} karakter)`);
    return formatted;

  } catch (err) {
    console.error(`❌ Hata (${marka} ${model} ${yil}):`, err.message);
    
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      const waitTime = RETRY_DELAY * (retryCount + 1);
      console.warn(`⏳ ${waitTime / 1000}s sonra tekrar denenecek...`);
      await new Promise(r => setTimeout(r, waitTime));
      return generateVehicleProfile(marka, model, yil, retryCount + 1);
    }
    
    return null;
  }
};