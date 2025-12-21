import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import Sidebar from './components/Sidebar'
import ArticleCard from './components/ArticleCard'
import { format, isToday, isYesterday, subDays } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function App() {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeView, setActiveView] = useState('dashboard')

    const [searchQuery, setSearchQuery] = useState('')
    const [dateRange, setDateRange] = useState(undefined)

    // Pagination
    const [page, setPage] = useState(1)
    const ITEMS_PER_PAGE = 5

    useEffect(() => {
        fetch('./data.json')
            .then(res => res.json())
            .then(data => {
                setArticles(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    // Stats Logic
    const stats = useMemo(() => {
        const total = articles.length
        const todayCount = articles.filter(a => isToday(new Date(a.published_date))).length

        // Category counts
        const cats = { 'cs.LG': 0, 'cs.AI': 0, 'cs.PL': 0 }
        articles.forEach(a => {
            a.tags.forEach(t => {
                if (cats[t] !== undefined) cats[t]++
            })
        })

        return { total, todayCount, cats }
    }, [articles])

    // Filtering
    const fuse = useMemo(() => new Fuse(articles, {
        keys: ['title', 'content.en', 'content.tr', 'authors', 'id'],
        threshold: 0.3,
    }), [articles])

    const filteredArticles = useMemo(() => {
        let result = articles

        if (searchQuery.trim()) {
            result = fuse.search(searchQuery).map(r => r.item)
        }

        if (dateRange?.from) {
            const from = new Date(dateRange.from)
            from.setHours(0, 0, 0, 0)
            const to = dateRange.to ? new Date(dateRange.to) : new Date(from)
            to.setHours(23, 59, 59, 999)

            result = result.filter(article => {
                const date = new Date(article.published_date)
                return date >= from && date <= to
            })
        }

        return result.sort((a, b) => new Date(b.published_date) - new Date(a.published_date))
    }, [articles, searchQuery, dateRange, fuse])

    const displayedArticles = filteredArticles.slice(0, page * ITEMS_PER_PAGE)

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-gray-900 dark:text-white">Loading...</div>

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-gray-200 dark:selection:bg-gray-700 selection:text-black dark:selection:text-white">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-24 flex items-center justify-between px-10 bg-background-light dark:bg-background-dark z-10 flex-shrink-0">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h1>
                        <p className="text-text-muted-light dark:text-text-muted-dark text-sm mt-1">Welcome back, here is your daily summary.</p>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Search */}
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted-light dark:text-text-muted-dark text-xl group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors">search</span>
                            <input
                                className="bg-transparent border-b border-gray-300 dark:border-gray-700 py-2.5 pl-10 pr-4 text-base focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 w-64 placeholder-text-muted-light dark:placeholder-text-muted-dark text-gray-900 dark:text-gray-100 transition-colors"
                                placeholder="Search papers..."
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Date Filter (Custom Add) */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${dateRange ? 'bg-gray-100 dark:bg-surface-dark text-gray-900 dark:text-white border-transparent' : 'border-gray-300 dark:border-gray-700 text-text-muted-light dark:text-text-muted-dark hover:text-gray-900 dark:hover:text-white'}`}>
                                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    <span>{dateRange?.from ? (dateRange.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}` : format(dateRange.from, 'MMM d')) : 'Date'}</span>
                                    {dateRange && <span className="ml-1 text-xs" onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }}>✕</span>}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={1}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 bg-background-light dark:bg-background-dark">

                    {/* Stats Section (Dashboard Only) */}
                    {activeView === 'dashboard' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* New Articles Card */}
                                <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-border-light dark:border-border-dark flex flex-col justify-between h-48 shadow-sm">
                                    <div>
                                        <h3 className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">New Articles Today</h3>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-6xl font-light text-gray-900 dark:text-white tracking-tighter">{stats.todayCount}</span>
                                            <span className="ml-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                                                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-gray-900 dark:bg-white h-1.5 rounded-full" style={{ width: `${Math.min((stats.todayCount / 10) * 100, 100)}%` }}></div>
                                    </div>
                                </div>

                                {/* Total Analyzed Card */}
                                <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-border-light dark:border-border-dark flex flex-col justify-between h-48 shadow-sm">
                                    <div>
                                        <h3 className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Total Analyzed</h3>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-6xl font-light text-gray-900 dark:text-white tracking-tighter">{stats.total.toLocaleString()}</span>
                                            <span className="ml-4 text-sm font-medium text-text-muted-light dark:text-text-muted-dark">
                                                Articles processed
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        <div className="h-2 w-2 rounded-full bg-gray-900 dark:bg-white"></div>
                                        <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                                        <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Tag Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                {[
                                    { id: 'cs.LG', name: 'Machine Learning', count: stats.cats['cs.LG'] },
                                    { id: 'cs.AI', name: 'Artificial Intelligence', count: stats.cats['cs.AI'] },
                                    { id: 'cs.PL', name: 'Programming Lang', count: stats.cats['cs.PL'] }
                                ].map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-transparent hover:border-border-light dark:hover:border-border-dark transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-1">{cat.name}</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{cat.id}</span>
                                        </div>
                                        <span className="text-3xl font-light text-gray-900 dark:text-gray-100">{cat.count || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Feed */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4">
                            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Latest Feed</h2>
                            <div className="flex space-x-4">
                                <button className="text-sm font-medium text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-0.5">All</button>
                                <button className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:text-gray-900 dark:hover:text-white transition-colors">By Date</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {displayedArticles.length === 0 ? (
                                <div className="text-center py-10 text-text-muted-light dark:text-text-muted-dark">No articles found matching criteria.</div>
                            ) : (
                                displayedArticles.map(article => (
                                    <ArticleCard key={article.id} article={article} />
                                ))
                            )}
                        </div>

                        {displayedArticles.length < filteredArticles.length && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-6 py-3 text-sm font-medium border border-border-light dark:border-border-dark rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors text-text-muted-light dark:text-text-muted-dark"
                                >
                                    Load More Articles
                                </button>
                            </div>
                        )}
                    </div>

                    <footer className="mt-8 text-center text-xs text-text-muted-light dark:text-text-muted-dark pb-8">
                        © 2025 ArxivTracker. Built for Semantic Security Analysis.
                    </footer>
                </div>
            </main>
        </div>
    )
}
