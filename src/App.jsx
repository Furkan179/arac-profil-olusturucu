import { useState, useEffect, useRef } from 'react';
// AŞAĞIDAKİ YENİ İMPORTLARI EKLE
import { generateVehicleProfile, API_KEY } from './services/aiService';
import { downloadJsonFile } from './utils/jsonUtils';
import { styles } from './styles/appStyles';

function App() {
  // --- State ---
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');
  const [yil, setYil] = useState('');
  const [aiOutput, setAiOutput] = useState('Oluşturulan JSON data burada görünecek...');
  const [debugOutput, setDebugOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isJsonReady, setIsJsonReady] = useState(false);
  const [vehicleQueue, setVehicleQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  // --- Refs ---
  const currentIndexRef = useRef(0);
  const folderHandleRef = useRef(null);
  const processedCountRef = useRef(0);

  // Bu sabit kalsın (rate limit bekleme süresi)
  const RATE_LIMIT_WAIT = 3000; // 3 saniye



  // --- AI İsteği ---
  const runAiGeneration = async (marka, model, yil, retryCount = 0) => {
    if (!marka || !model || !yil) {
      setAiOutput('❌ Lütfen tüm araç bilgilerini girin.');
      setIsJsonReady(false);
      return null;
    }

    setIsLoading(true);
    setIsJsonReady(false);
    setAiOutput('🤖 AI isteği gönderiliyor...');

    const json = await generateVehicleProfile(marka, model, yil);

    if (json) {
      setAiOutput(json);
      setIsJsonReady(true);
    } else {
      setIsJsonReady(false);
    }
    setIsLoading(false);
  };

  // --- Manuel Gönder ---
  const handleSendClick = async () => {
    await runAiGeneration(marka, model, yil);
  };

  // --- Manuel Kaydet ---
  const handleSaveClick = async () => {
    if (!isJsonReady || !aiOutput) return;
    const filename = marka && model && yil ? `${marka}${model}-${yil}.json` : 'arac_profil.json';
    const success = await downloadJsonFile(aiOutput, filename);
    setSaveStatus(success ? 'success' : 'error');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // --- Dosya Yükleme ---
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text
          .replace(/\r\n/g, '\n')
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);

        const vehicles = lines
          .map(line => {
            const parts = line.split(/[,;\t]/).map(p => p.trim());
            const [vMarka, vModel, vYil] = parts;
            return { 
              marka: vMarka || '', 
              model: vModel || '', 
              yil: vYil || '' 
            };
          })
          .filter(v => v.marka && v.model && v.yil);

        if (vehicles.length === 0) {
          alert('⚠️ Dosyada geçerli araç bilgisi bulunamadı!\n\nFormat: marka,model,yil\nÖrnek: BMW,M3,2020');
          return;
        }

        setVehicleQueue(vehicles);
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        processedCountRef.current = 0;
        folderHandleRef.current = null;
        setSelectedFolder(null);

        setMarka(vehicles[0].marka);
        setModel(vehicles[0].model);
        setYil(vehicles[0].yil);
        
        setProcessStatus(`✅ ${vehicles.length} araç yüklendi. Başlat butonuna basın.`);
        setAiOutput('▶️ Başlat butonuna basarak işlemi başlatabilirsiniz.\n\n📥 Her araç için JSON dosyası otomatik olarak indirme klasörünüze kaydedilecek.');
        setIsJsonReady(false);
        
      } catch (err) {
        alert('❌ Dosya okuma hatası: ' + err.message);
        console.error('File upload error:', err);
      }
    };

    reader.onerror = () => {
      alert('❌ Dosya okunamadı');
    };

    reader.readAsText(file);
  };

  // --- ÇEKİRDEK İŞLEM ---
  const processCurrentVehicle = async () => {
    const i = currentIndexRef.current;
    
    if (i >= vehicleQueue.length) {
      setProcessStatus(`🎉 Tamamlandı! ${processedCountRef.current}/${vehicleQueue.length} araç işlendi`);
      setIsProcessing(false);
      setMarka('');
      setModel('');
      setYil('');
      setAiOutput('✅ Tüm araçlar işlendi. Dosyalar tarayıcı indirme klasörünüze kaydedildi.');
      return;
    }

    setIsProcessing(true);
    setIsJsonReady(false);

    const vehicle = vehicleQueue[i];

    try {
      if (i > 0) {
        setProcessStatus(`⏳ API koruması için ${RATE_LIMIT_WAIT/1000}s bekleniyor...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WAIT));
      }

      setMarka(vehicle.marka);
      setModel(vehicle.model);
      setYil(vehicle.yil);
      setProcessStatus(`🔄 İşleniyor: ${vehicle.marka} ${vehicle.model} (${i+1}/${vehicleQueue.length})`);

      const jsonContent = await generateVehicleProfile(
        vehicle.marka,
        vehicle.model,
        vehicle.yil
      );

      if (!jsonContent) {
        throw new Error('AI yanıt veremedi (3 deneme sonuç vermedi)');
      }

      if (autoSave) {
        setProcessStatus('💾 Kaydediliyor...');
        const filename = `${vehicle.marka}_${vehicle.model}_${vehicle.yil}.json`
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_.-]/g, '');
        
        const saved = await downloadJsonFile(jsonContent, filename);
        
        if (!saved) {
          throw new Error('Dosya kaydedilemedi');
        }
        
        processedCountRef.current++;
        setAiOutput(jsonContent);
        setIsJsonReady(true);
        setProcessStatus(`✅ Kaydedildi: ${vehicle.marka} ${vehicle.model} (${processedCountRef.current}/${vehicleQueue.length})`);
      } else {
        processedCountRef.current++;
        setAiOutput(jsonContent);
        setIsJsonReady(true);
        setProcessStatus(`✅ Oluşturuldu: ${vehicle.marka} ${vehicle.model} (${processedCountRef.current}/${vehicleQueue.length})`);
      }

      await new Promise(resolve => setTimeout(resolve, 800));

    } catch (error) {
      console.error(`❌ İşlem hatası (${vehicle.marka} ${vehicle.model}):`, error);
      const errorMsg = error.message || 'Bilinmeyen hata';
      setProcessStatus(`❌ Hata: ${vehicle.marka} ${vehicle.model} - ${errorMsg}`);
      setAiOutput(`⚠️ ATLANDI: ${vehicle.marka} ${vehicle.model} ${vehicle.yil}\n\nHata: ${errorMsg}\n\nSıradaki araca geçiliyor...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const next = i + 1;
    currentIndexRef.current = next;
    setCurrentIndex(next);

    if (next < vehicleQueue.length) {
      setTimeout(() => processCurrentVehicle(), 1000);
    } else {
      setProcessStatus(`🎉 Tamamlandı! ${processedCountRef.current}/${vehicleQueue.length} araç başarıyla işlendi`);
      setIsProcessing(false);
      setMarka('');
      setModel('');
      setYil('');
      setAiOutput(`✅ İşlem tamamlandı!\n\n✓ ${processedCountRef.current} araç başarıyla kaydedildi\n✗ ${vehicleQueue.length - processedCountRef.current} araç atlandı\n\nTüm dosyalar indirme klasörünüze kaydedildi.`);
    }
  };

  useEffect(() => {
    if (!API_KEY || API_KEY === 'demo-key-123') {
      setProcessStatus('⚠️ API anahtarı bulunamadı! .env dosyasına VITE_GOOGLE_API_KEY ekleyin.');
    }
  }, [API_KEY]);

  // --- RENDER ---
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚗 Araç Profil Jenerätörü</h2>

        <div style={styles.formGroup}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Marka:</label>
            <input
              type="text"
              value={marka}
              onChange={(e) => setMarka(e.target.value)}
              disabled={isProcessing}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Model:</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isProcessing}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Yıl:</label>
            <input
              type="text"
              value={yil}
              onChange={(e) => setYil(e.target.value)}
              disabled={isProcessing}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleSendClick}
            disabled={isLoading || isProcessing}
            style={{
              ...styles.button,
              ...(isLoading || isProcessing ? styles.buttonDisabled : styles.buttonPrimary)
            }}
          >
            {isLoading ? '⏳ İşleniyor...' : '🔄 Data Oluştur'}
          </button>

          <button
            onClick={handleSaveClick}
            disabled={!isJsonReady || isProcessing}
            style={{
              ...styles.button,
              ...(!isJsonReady || isProcessing ? styles.buttonDisabled : styles.buttonSuccess)
            }}
          >
            💾 Kaydet
          </button>

          <button
            onClick={processCurrentVehicle}
            disabled={isProcessing || vehicleQueue.length === 0 || currentIndex >= vehicleQueue.length}
            style={{
              ...styles.button,
              ...(isProcessing || vehicleQueue.length === 0 || currentIndex >= vehicleQueue.length
                ? styles.buttonDisabled
                : styles.buttonWarning)
            }}
          >
            {isProcessing ? '⏳ İşleniyor...' : '▶️ Toplu İşlemi Başlat'}
          </button>
        </div>

        <div style={styles.toggleContainer}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              disabled={isProcessing}
              style={styles.checkbox}
            />
            <span style={styles.toggleText}>
              Otomatik Kaydetme {autoSave ? '✅' : '❌'}
            </span>
          </label>
        </div>

        {saveStatus && (
          <div style={{
            ...styles.statusBadge,
            ...(saveStatus === 'success' ? styles.statusSuccess : styles.statusError)
          }}>
            {saveStatus === 'success' ? '✅ Kaydedildi!' : '❌ Kaydetme hatası'}
          </div>
        )}

        <div style={styles.outputSection}>
          <pre style={styles.jsonOutput}>{aiOutput}</pre>
        </div>

        {debugOutput && (
          <details style={styles.debugSection}>
            <summary style={styles.debugSummary}>🔍 Debug Bilgileri</summary>
            <pre style={styles.debugContent}>{debugOutput}</pre>
          </details>
        )}

        <div style={styles.batchSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Toplu İşlem</h3>
            <label style={styles.fileInputLabel}>
              <span style={styles.uploadIcon}>📎</span>
              <span style={styles.uploadText}>CSV/TXT Dosyası Seç</span>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                disabled={isProcessing}
                style={styles.fileInput}
              />
            </label>
          </div>

          {vehicleQueue.length > 0 && (
            <div style={styles.batchInfo}>
              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>🚗</span>
                  <span style={styles.statLabel}>Toplam:</span>
                  <span style={styles.statValue}>{vehicleQueue.length}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>✅</span>
                  <span style={styles.statLabel}>İşlenen:</span>
                  <span style={styles.statValue}>{Math.min(currentIndex, vehicleQueue.length)}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>⏳</span>
                  <span style={styles.statLabel}>Kalan:</span>
                  <span style={styles.statValue}>{Math.max(0, vehicleQueue.length - currentIndex)}</span>
                </div>
              </div>

              <div style={styles.statusBadge}>
                {processStatus}
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>No</th>
                      <th style={styles.tableHeader}>Marka</th>
                      <th style={styles.tableHeader}>Model</th>
                      <th style={styles.tableHeader}>Yıl</th>
                      <th style={styles.tableHeader}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleQueue.map((v, i) => (
                      <tr
                        key={i}
                        style={{
                          ...styles.tableRow,
                          ...(i === currentIndex && isProcessing ? styles.tableRowActive : {})
                        }}
                      >
                        <td style={styles.tableCell}>{i + 1}</td>
                        <td style={styles.tableCell}>{v.marka}</td>
                        <td style={styles.tableCell}>{v.model}</td>
                        <td style={styles.tableCell}>{v.yil}</td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.statusIndicator,
                            ...(i < currentIndex ? styles.statusCompleted :
                               (i === currentIndex && isProcessing) ? styles.statusProcessing :
                               styles.statusPending)
                          }}>
                            {i < currentIndex ? '✓ Tamamlandı' :
                             (i === currentIndex && isProcessing) ? '⏳ İşleniyor' :
                             '⏸️ Bekliyor'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// styles objesini BU DOSYADAN kaldırdık. Artık styles, src/styles/appStyles.js dosyasından geliyor.
export default App;

