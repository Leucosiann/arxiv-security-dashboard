#!/usr/bin/env python3
"""
Arxiv Security Papers Fetcher

Bu script Arxiv'den güvenlik ve yapay zeka kesişimindeki makaleleri çeker,
Google Gemini API ile Türkçe özetler oluşturur ve data.json dosyasını günceller.
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
MAX_RESULTS = 10  # Kullanıcı isteği: 10 makale
DATA_FILE = Path(__file__).parent.parent / "public" / "data.json"

# Arxiv sorgusu
ARXIV_QUERY = "cat:cs.CR AND (cat:cs.AI OR cat:cs.LG OR cat:cs.PL)"

def setup_gemini():
    """Gemini API'yi yapılandır."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("⚠️  GEMINI_API_KEY bulunamadı.")
        return None
    
    genai.configure(api_key=api_key)
    # Reverting to gemini-2.5-flash-lite which works specifically for this task
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    return model

def generate_turkish_summary(model, title: str, abstract: str) -> str:
    """
    Yeni prompt ile Türkçe çeviri/özet oluştur.
    """
    if not model:
        return abstract
    
    # Kullanıcının verdiği YENİ PROMPT
    prompt = f"""Aşağıdaki akademik makale başlığını ve özetini Türkçeye çevir. Çeviri yaparken siber güvenlik, yapay zeka ve sistem analizi ile ilgili tüm teknik terimleri (örneğin: 'knowledge graph', 'reasoning', 'recall', 'exact retrieval', 'relation-first', 'persistent belief system' vb.) Türkçeleştirmeden, olduğu gibi İngilizce olarak kullan. Metnin geri kalanında resmi ve akademik bir dil tercih et, cümle yapısının akıcı ve profesyonel olmasını sağla.

Makale Başlığı: {title}

Abstract:
{abstract}

Çeviri:"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"⚠️  Gemini API hatası: {e}")
        return abstract

def fetch_arxiv_papers():
    """Arxiv'den makaleleri çek."""
    print(f"🔍 Arxiv sorgusu: {ARXIV_QUERY}")
    
    search = arxiv.Search(
        query=ARXIV_QUERY,
        max_results=MAX_RESULTS,
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )
    
    papers = []
    client = arxiv.Client()
    
    for result in client.results(search):
        published = result.published.replace(tzinfo=None)
        
        paper = {
            "id": result.entry_id.split("/")[-1],
            "title": result.title.replace("\n", " "),
            "authors": [author.name for author in result.authors[:5]],
            "published_date": published.strftime("%Y-%m-%d"),
            "tags": [cat for cat in result.categories],
            "link": result.entry_id,
            "pdf_link": result.pdf_url,
            "content": {
                "en": result.summary.replace("\n", " "),
                "tr": "" # Sonra doldurulacak
            }
        }
        papers.append(paper)
    
    return papers

def main():
    print("=" * 60)
    print("🔐 Arxiv Security Papers Fetcher (Revert UI, Keep Prompt)")
    print("=" * 60)
    
    model = setup_gemini()
    
    # Yeni makaleleri çek
    new_papers = fetch_arxiv_papers()
    print(f"✅ {len(new_papers)} makale bulundu.")
    
    # Çevirileri yap
    for i, paper in enumerate(new_papers):
        print(f"📝 [{i+1}/{len(new_papers)}] {paper['title'][:60]}...")
        
        turkish_summary = generate_turkish_summary(
            model, 
            paper["title"], 
            paper["content"]["en"]
        )
        paper["content"]["tr"] = turkish_summary
        
        if model:
            time.sleep(1.5) # Rate limit önlemi
    
    # Dosyaya kaydet (Eskileri siler - 'w' modu)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(new_papers, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"💾 {len(new_papers)} makale kaydedildi: {DATA_FILE}")
    print("=" * 60)

if __name__ == "__main__":
    main()
