#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // --- İŞTE YENİ KISIM ---
    // Eklentileri burada kaydediyoruz (register)
    // 'path' eklentisini sildik, sadece bu ikisi.
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    // ---------------------------
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}