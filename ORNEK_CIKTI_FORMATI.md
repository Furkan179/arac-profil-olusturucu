# Araç Profili JSON Çıktı Formatı

Bu doküman, AI tarafından üretilmesi gereken JSON çıktısının örnek yapısını gösterir.

## Örnek Referans

Aşağıdaki format baz alınmıştır: `Skoda_Kamiq_2020.json`

## Zorunlu Alanlar ve Yapı

```json
{
  "marka": "string",
  "model": "string", 
  "model_yili": number,
  "guncelleme_tarihi": "string (tarih formatı)",
  "piyasa_bilgileri": {
    "fiyat_tarihi": "string",
    "not": "string (detaylı açıklama)",
    "sifir_km": {
      "durum": "0 KM / Sıfır",
      "fiyat_araligi": "string (TL aralığı veya satılmıyor bilgisi)"
    },
    "ikinci_el_50000_km": {
      "durum": "İkinci El / ~50.000 km",
      "tahmini_model_yili": "string veya number",
      "tahmini_fiyat_araligi": "string (TL cinsinden)"
    },
    "ikinci_el_100000_km": {
      "durum": "İkinci El / ~100.000 km",
      "tahmini_model_yili": "string veya number",
      "tahmini_fiyat_araligi": "string (TL cinsinden)"
    }
  },
  "model_genel_bakis": {
    "one_cikan_olumlu_yonler": [
      {
        "baslik": "string (kısa başlık)",
        "aciklama": "string (detaylı açıklama)"
      }
      // En az 3 öğe
    ],
    "dikkat_edilmesi_gereken_genel_konular": [
      {
        "baslik": "string",
        "aciklama": "string",
        "tekrarlanma_sikligi": "Düşük | Orta | Yüksek",
        "maliyet_notu": "string (TL maliyeti veya 'Uygulanamaz')"
      }
      // En az 3 öğe
    ]
  },
  "motor_sanziman_varyantlari": [
    {
      "varyant_adi": "string (örn: 1.0 TSI 115 hp DSG)",
      "varyant_ozellikleri": "string (detaylı açıklama)",
      "varyanta_ozgu_olumlu_yonler": [
        "string",
        "string",
        "string"
        // En az 3 öğe
      ],
      "potansiyel_sorunlar_ve_maliyetler": [
        {
          "sorun_basligi": "string",
          "aciklama": "string (belirtiler ve detaylar)",
          "tekrarlanma_sikligi": "Düşük | Orta | Yüksek",
          "tahmini_tamir_maliyeti": "string (TL aralığı)"
        }
        // En az 2-3 sorun
      ]
    }
    // Tüm motor varyantları için tekrarlanır
  ]
}
```

## Önemli Notlar

1. **Piyasa Bilgileri**: Türkiye pazarına özel, TL cinsinden fiyatlandırma
2. **Tekrarlanma Sıklığı**: Sadece "Düşük", "Orta", "Yüksek" değerleri kullanılmalı
3. **Motor Varyantları**: İlgili model ve yıl için mevcut tüm motor/şanzıman kombinasyonları listelenmelidir
4. **Detay Seviyesi**: Her bölüm somut örnekler ve açıklamalar içermelidir
5. **Tarih Formatı**: "17 Aralık 2025" gibi Türkçe tarih formatı kullanılır

## Veri Kalitesi Kontrol Listesi

- [ ] Tüm fiyatlar TL cinsinden mi?
- [ ] En az 3 olumlu yön var mı?
- [ ] En az 3 dikkat edilmesi gereken konu var mı?
- [ ] Tüm motor varyantları listelenmiş mi?
- [ ] Her varyant için sorunlar ve maliyetler belirtilmiş mi?
- [ ] Tekrarlanma sıklıkları standart değerlerde mi?
- [ ] Açıklamalar yeterince detaylı mı?
