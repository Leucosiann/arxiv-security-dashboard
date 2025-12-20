# 🔐 Arxiv Security Dashboard

Arxiv'den güvenlik ve yapay zeka kesişimindeki makaleleri otomatik olarak çeken, Türkçe özetler üreten ve GitHub Pages'te yayınlayan modern bir dashboard.

![Dashboard Screenshot](docs/screenshot.png)

## ✨ Özellikler

- **🔍 Akıllı Arama**: Fuse.js ile başlık ve içerikte fuzzy search
- **🏷️ Kategori Filtreleme**: cs.AI, cs.LG, cs.PL etiketlerine göre filtreleme
- **📅 Tarih Filtreleme**: Son 24 saat, hafta veya ay bazlı görüntüleme
- **🌐 TR/EN Toggle**: Her makale için Türkçe özet ve İngilizce abstract geçişi
- **📝 Markdown Desteği**: Türkçe özetler markdown formatında render edilir
- **🌙 Dark Mode**: Premium "Linear" tarzı koyu tema

## 🚀 Hızlı Başlangıç

### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç: http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

## 🤖 Otomatik Güncelleme (CI/CD)

Bu proje her gece otomatik olarak:
1. Arxiv'den yeni makaleleri çeker
2. Google Gemini ile Türkçe özetler oluşturur
3. `data.json` dosyasını günceller
4. GitHub Pages'e deploy eder

### Kurulum

1. **GitHub Secrets** ayarla:
   - `GEMINI_API_KEY`: Google Gemini API anahtarın

2. **GitHub Pages** aktif et:
   - Settings → Pages → Source: GitHub Actions

### Manuel Tetikleme

Actions sekmesinden "Fetch Papers and Deploy" workflow'unu manuel olarak çalıştırabilirsiniz.

## 📁 Proje Yapısı

```
├── .github/workflows/
│   └── deploy.yml        # CI/CD pipeline
├── backend/
│   ├── fetch_papers.py   # Arxiv fetcher + Gemini özet
│   └── requirements.txt  # Python bağımlılıkları
├── public/
│   └── data.json         # Makale verileri
├── src/
│   ├── components/
│   │   ├── ArticleCard.jsx
│   │   ├── SearchBar.jsx
│   │   └── Sidebar.jsx
│   ├── App.jsx
│   └── index.css
└── README.md
```

## 🔧 Arxiv Sorgusu

Kullanılan sorgu:
```
cat:cs.CR AND (cat:cs.AI OR cat:cs.LG OR cat:cs.PL)
```

Bu sorgu:
- ✅ **cs.CR** (Cryptography and Security) kategorisindeki makaleleri seçer
- ✅ **VE** bunların içinden cs.AI, cs.LG veya cs.PL kategorilerinden en az birini de içerenleri filtreler

## 🛠️ Teknolojiler

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Fuse.js (arama)
- react-markdown

**Backend:**
- Python 3.11
- arxiv (API client)
- google-generativeai (Gemini)

**Deployment:**
- GitHub Actions
- GitHub Pages

## 📄 Lisans

MIT License
