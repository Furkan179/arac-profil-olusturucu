# 🚗 AI Vehicle Profile Generator

An AI-powered desktop application that automatically generates 
structured vehicle profiles using **Google Gemini 2.5 Flash**.

Built with Tauri + React for cross-platform desktop deployment.

## ✨ Features
- 🤖 **AI-Powered Analysis** — Gemini 2.5 Flash generates detailed vehicle profiles
- 📊 **Batch Processing** — Upload Excel file, auto-generate JSON for each vehicle
- 💾 **Structured Output** — Market data, engine variants, known issues per vehicle
- ⚡ **Production Ready** — Rate limit protection with retry mechanism
- 🖥️ **Desktop App** — Cross-platform via Tauri 2 (Rust backend)

## 🏗️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Desktop | Tauri 2 (Rust) |
| AI | Google Gemini 2.5 Flash API |
| Data Processing | xlsx, JSON |
| UI | Tailwind CSS |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Google Gemini API Key

### Installation
```bash
git clone https://github.com/Furkan179/arac-profil-olusturucu.git
cd arac-profil-olusturucu
npm install
cp .env.example .env
# Add your Gemini API key to .env
npm run tauri dev
```

## 📋 Output Format
```json
{
  "brand": "BMW",
  "model": "3 Series",
  "year": 2020,
  "market_info": { ... },
  "engine_variants": [
    {
      "variant": "320i",
      "known_issues": [...]
    }
  ]
}
```

## 🤝 Contributing
Pull requests are welcome!

## 📝 License
MIT
