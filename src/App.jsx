import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import Sidebar from './components/Sidebar'
import ArticleCard from './components/ArticleCard'
import SearchBar from './components/SearchBar'

function App() {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [dateFilter, setDateFilter] = useState('all')
    const [globalLang, setGlobalLang] = useState('tr')

    // Fetch data on mount
    useEffect(() => {
        fetch('./data.json')
            .then(res => {
                if (!res.ok) throw new Error('Veri yüklenemedi')
                return res.json()
            })
            .then(data => {
                setArticles(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    // Extract all unique tags (except cs.CR which is always present)
    const allTags = useMemo(() => {
        const tags = new Set()
        articles.forEach(article => {
            article.tags.forEach(tag => tags.add(tag))
        })
        return Array.from(tags).sort()
    }, [articles])

    // Fuse.js search setup
    const fuse = useMemo(() => {
        return new Fuse(articles, {
            keys: ['title', 'content.en', 'content.tr', 'authors'],
            threshold: 0.3,
            ignoreLocation: true,
        })
    }, [articles])

    // Filter articles
    const filteredArticles = useMemo(() => {
        let result = articles

        // Search filter
        if (searchQuery.trim()) {
            result = fuse.search(searchQuery).map(r => r.item)
        }

        // Tag filter
        if (selectedTags.length > 0) {
            result = result.filter(article =>
                selectedTags.every(tag => article.tags.includes(tag))
            )
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date()
            const filterDate = new Date()

            switch (dateFilter) {
                case '24h':
                    filterDate.setDate(now.getDate() - 1)
                    break
                case 'week':
                    filterDate.setDate(now.getDate() - 7)
                    break
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1)
                    break
            }

            result = result.filter(article => {
                const articleDate = new Date(article.published_date)
                return articleDate >= filterDate
            })
        }

        // Sort by date (newest first)
        return [...result].sort((a, b) =>
            new Date(b.published_date) - new Date(a.published_date)
        )
    }, [articles, searchQuery, selectedTags, dateFilter, fuse])

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Makaleler yükleniyor...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-2">⚠️ Hata</div>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-600">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                <span className="text-xl">🔐</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Arxiv Security</h1>
                                <p className="text-xs text-gray-500">AI & Güvenlik Makaleleri</p>
                            </div>
                        </div>

                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />

                        {/* Global language toggle */}
                        <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-1">
                            <button
                                onClick={() => setGlobalLang('tr')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${globalLang === 'tr'
                                        ? 'bg-accent-purple text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                TR
                            </button>
                            <button
                                onClick={() => setGlobalLang('en')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${globalLang === 'en'
                                        ? 'bg-accent-blue text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                EN
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="w-64 flex-shrink-0">
                        <Sidebar
                            allTags={allTags}
                            selectedTags={selectedTags}
                            onTagChange={setSelectedTags}
                            dateFilter={dateFilter}
                            onDateFilterChange={setDateFilter}
                            articleCount={filteredArticles.length}
                            totalCount={articles.length}
                        />
                    </aside>

                    {/* Feed */}
                    <main className="flex-1 min-w-0">
                        {filteredArticles.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">📭</div>
                                <p className="text-gray-400">Sonuç bulunamadı</p>
                                <p className="text-gray-600 text-sm mt-2">
                                    Farklı filtreler veya arama terimleri deneyin
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredArticles.map(article => (
                                    <ArticleCard
                                        key={article.id}
                                        article={article}
                                        defaultLang={globalLang}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default App
