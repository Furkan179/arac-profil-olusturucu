/**
 * Metinden JSON çıkarmayı dener - Tüm yöntemler
 */
export const extractJsonFromText = (text) => {
  if (!text || typeof text !== 'string') {
    console.warn('⚠️ extractJsonFromText: Geçersiz input');
    return null;
  }

  // Trim işlemi
  const trimmed = text.trim();

  // Metod 1: Direkt JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    console.log('✅ Direkt JSON parse başarılı');
    return parsed;
  } catch (e) {
    // Devam et
  }

  // Metod 2: ```json ... ``` code fence
  const fencePatterns = [
    /```json\s*([\s\S]*?)```/i,
    /```\s*([\s\S]*?)```/,
  ];

  for (const pattern of fencePatterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        console.log('✅ Code fence içinden JSON parse edildi');
        return parsed;
      } catch (e) {
        console.warn('⚠️ Code fence parse hatası:', e.message);
      }
    }
  }

  // Metod 3: İlk { ... } objesini bul (nested objects destekli)
  let braceCount = 0;
  let startIdx = -1;
  
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '{') {
      if (braceCount === 0) startIdx = i;
      braceCount++;
    } else if (trimmed[i] === '}') {
      braceCount--;
      if (braceCount === 0 && startIdx !== -1) {
        try {
          const jsonStr = trimmed.substring(startIdx, i + 1);
          const parsed = JSON.parse(jsonStr);
          console.log('✅ Nested object extraction başarılı');
          return parsed;
        } catch (e) {
          console.warn('⚠️ Object extraction parse hatası:', e.message);
        }
        startIdx = -1; // Devam et, başka JSON olabilir
      }
    }
  }

  // Metod 4: Basit { ... } arama (fallback)
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonStr = trimmed.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      console.log('✅ Basit extraction başarılı');
      return parsed;
    } catch (e) {
      console.warn('⚠️ Basit extraction hatası:', e.message);
    }
  }

  console.error('❌ Tüm JSON extraction yöntemleri başarısız');
  console.error('📄 İlk 500 karakter:', trimmed.substring(0, 500));
  return null;
};

/**
 * JSON içeriğini dosya olarak indirir
 */
export const downloadJsonFile = async (content, filename) => {
  try {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('❌ Dosya kaydetme hatası:', error);
    return false;
  }
};