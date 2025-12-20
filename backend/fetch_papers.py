#!/usr/bin/env python3
"""
Arxiv Security Papers Fetcher

Bu script Arxiv'den güvenlik ve yapay zeka kesişimindeki makaleleri çeker,
Google Gemini API ile Türkçe özetler oluşturur ve data.json dosyasını günceller.

Kullanım:
    python fetch_papers.py

Ortam Değişkenleri:
    GEMINI_API_KEY: Google Gemini API anahtarı
"""

import arxiv
import json
import os
from datetime import datetime, timedelta
from pathlib import Path
import time
import google.generativeai as genai
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Yapılandırma
MAX_RESULTS = 50  # Her çalışmada çekilecek maksimum makale
DAYS_LOOKBACK = 7  # Son kaç günün makalelerine bakılacak
DATA_FILE = Path(__file__).parent.parent / "public" / "data.json"

# Arxiv sorgusu: cs.CR (Security) VE (cs.AI VEYA cs.LG VEYA cs.PL)
ARXIV_QUERY = "cat:cs.CR AND (cat:cs.AI OR cat:cs.LG OR cat:cs.PL)"


def setup_gemini():
    """Gemini API'yi yapılandır."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("⚠️  GEMINI_API_KEY bulunamadı. Türkçe özetler oluşturulamayacak.")
        return None
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    return model


def generate_turkish_summary(model, title: str, abstract: str) -> str:
    """
    Makale başlığı ve abstract'ından Türkçe özet oluştur.
    Markdown formatında döndürür.
    """
    if not model:
        return abstract  # API yoksa orijinal abstract'ı döndür
    
    prompt = f"""Aşağıdaki akademik makale için Türkçe özet hazırla.

Kurallar:
1. Markdown formatında yaz (## Özet başlığı, madde işaretleri, **kalın** yazı kullan)
2. Makaleyi'nin ana katkısını, metodolojisini ve sonuçlarını özetle
3. Teknik terimleri Türkçe karşılıklarıyla birlikte kullan (örn: "Derin Öğrenme (Deep Learning)")
4. Maksimum 150 kelime olsun
5. Akademik ama anlaşılır bir dil kullan

Makale Başlığı: {title}

Abstract:
{abstract}

Türkçe Özet:"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"⚠️  Gemini API hatası: {e}")
        return abstract


def fetch_arxiv_papers(query: str, max_results: int, days_back: int) -> list:
    """
    Arxiv'den makaleleri çek.
    
    Args:
        query: Arxiv sorgu stringi
        max_results: Maksimum sonuç sayısı
        days_back: Son kaç günün makaleleri
    
    Returns:
        Makale listesi
    """
    print(f"🔍 Arxiv sorgusu: {query}")
    print(f"📅 Son {days_back} gün aranıyor...")
    
    # Tarih filtresi için cutoff
    cutoff_date = datetime.now() - timedelta(days=days_back)
    
    # Arxiv araması
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )
    
    papers = []
    client = arxiv.Client()
    
    for result in client.results(search):
        # Tarih kontrolü
        published = result.published.replace(tzinfo=None)
        if published < cutoff_date:
            continue
            
        # Kategorileri al
        categories = [cat for cat in result.categories]
        
        paper = {
            "id": result.entry_id.split("/")[-1],  # arxiv:2412.12345 -> 2412.12345
            "title": result.title.replace("\n", " "),
            "authors": [author.name for author in result.authors[:5]],  # İlk 5 yazar
            "published_date": published.strftime("%Y-%m-%d"),
            "tags": categories,
            "link": result.entry_id,
            "pdf_link": result.pdf_url,
            "content": {
                "en": result.summary.replace("\n", " "),
                "tr": ""  # Sonra doldurulacak
            }
        }
        papers.append(paper)
    
    print(f"✅ {len(papers)} makale bulundu")
    return papers


def load_existing_data() -> list:
    """Mevcut data.json dosyasını yükle."""
    if not DATA_FILE.exists():
        return []
    
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_data(papers: list):
    """Makaleleri data.json'a kaydet."""
    # Dizini oluştur
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(papers, f, ensure_ascii=False, indent=2)
    
    print(f"💾 {len(papers)} makale kaydedildi: {DATA_FILE}")


def merge_papers(existing: list, new: list) -> list:
    """
    Yeni makaleleri mevcut listeyle birleştir.
    Duplikasyonları önle ve tarihe göre sırala.
    """
    # Mevcut ID'leri al
    existing_ids = {p["id"] for p in existing}
    
    # Yeni makaleleri ekle
    merged = existing.copy()
    new_count = 0
    
    for paper in new:
        if paper["id"] not in existing_ids:
            merged.append(paper)
            new_count += 1
    
    # Tarihe göre sırala (yeniden eskiye)
    merged.sort(key=lambda x: x["published_date"], reverse=True)
    
    print(f"📊 {new_count} yeni makale eklendi")
    return merged


def main():
    """Ana fonksiyon."""
    print("=" * 60)
    print("🔐 Arxiv Security Papers Fetcher")
    print("=" * 60)
    
    # Gemini'yi ayarla
    model = setup_gemini()
    
    # Mevcut verileri yükle
    existing_papers = load_existing_data()
    print(f"📂 Mevcut makale sayısı: {len(existing_papers)}")
    
    # Yeni makaleleri çek
    new_papers = fetch_arxiv_papers(ARXIV_QUERY, MAX_RESULTS, DAYS_LOOKBACK)
    
    if not new_papers:
        print("ℹ️  Yeni makale bulunamadı")
        return
    
    # Mevcut ID'leri al
    existing_ids = {p["id"] for p in existing_papers}
    
    # Sadece yeni makaleler için Türkçe özet oluştur
    for i, paper in enumerate(new_papers):
        if paper["id"] in existing_ids:
            continue  # Zaten var, atla
            
        print(f"\n📝 [{i+1}/{len(new_papers)}] {paper['title'][:60]}...")
        
        # Türkçe özet oluştur
        turkish_summary = generate_turkish_summary(
            model, 
            paper["title"], 
            paper["content"]["en"]
        )
        paper["content"]["tr"] = turkish_summary
        
        # Rate limiting
        if model:
            time.sleep(1)  # API rate limit için bekle
    
    # Birleştir ve kaydet
    all_papers = merge_papers(existing_papers, new_papers)
    save_data(all_papers)
    
    print("\n" + "=" * 60)
    print("✅ İşlem tamamlandı!")
    print("=" * 60)


if __name__ == "__main__":
    main()
