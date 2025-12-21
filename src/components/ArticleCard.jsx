import { useState, useMemo } from 'react'

export default function ArticleCard({ article }) {
    const [lang, setLang] = useState('tr')
    const [isExpanded, setIsExpanded] = useState(false)

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()

        // Check if yesterday
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const isYesterday = date.toDateString() === yesterday.toDateString()

        if (isToday) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        if (isYesterday) return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    // Parse Turkish content to separate Title and Abstract
    const trContent = useMemo(() => {
        const text = article.content.tr || ""
        // Regex matches "Makale Başlığı: [capturing group]" and "Özet: [capturing group]"
        // Case insensitive, handles Markdown bolding (**...**)
        const titleMatch = text.match(/(?:Makale Başlığı|Article Title)[:\s]*\**\s*(.*?)\s*\**(?:$|\n)/i)
        const abstractMatch = text.match(/(?:Özet|Abstract)[:\s]*\**\s*([\s\S]*)/i)

        return {
            title: titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : "",
            abstract: abstractMatch ? abstractMatch[1].replace(/\*\*/g, '').trim() : text
        }
    }, [article.content.tr])

    // Determine what to display
    const displayTitle = (lang === 'tr' && trContent.title) ? trContent.title : article.title
    const displayAbstract = lang === 'tr'
        ? (trContent.abstract || article.content.tr)
        : article.content.en

    // Clean up markdown artifacts for display if needed
    const cleanAbstract = displayAbstract?.replace(/\*\*/g, '').replace(/##/g, '')

    return (
        <div className="group relative flex flex-col md:flex-row md:items-start justify-between p-6 rounded-2xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark hover:shadow-md transition-all duration-300">
            <div className="flex-1 md:pr-8">
                <div className="flex items-center space-x-3 mb-2">
                    {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                            {tag}
                        </span>
                    ))}
                    <span className="text-xs text-text-muted-light dark:text-text-muted-dark font-mono">
                        {article.id}
                    </span>
                    <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        • {formatDate(article.published_date)}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4">
                    <a href={article.link} target="_blank" rel="noreferrer">
                        {displayTitle}
                    </a>
                </h3>

                <div
                    className={`text-sm text-text-muted-light dark:text-text-muted-dark cursor-pointer transition-all ${isExpanded ? '' : 'line-clamp-3'}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    title="Click to expand/collapse"
                >
                    {cleanAbstract}
                </div>
                {!isExpanded && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Read more
                    </button>
                )}
                {isExpanded && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Show less
                    </button>
                )}
            </div>

            <div className="flex items-center mt-4 md:mt-0 space-x-6 flex-shrink-0">
                <div className="flex space-x-2">
                    {/* EN Button */}
                    <button
                        onClick={() => setLang('en')}
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${lang === 'en'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                                : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        EN
                    </button>

                    {/* TR Button */}
                    <button
                        onClick={() => setLang('tr')}
                        disabled={!article.content.tr}
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${lang === 'tr'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                                : (article.content.tr
                                    ? 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'
                                    : 'border border-gray-300 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 line-through bg-transparent')
                            }`}
                    >
                        TR
                    </button>
                </div>

                <a
                    href={article.pdf_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">arrow_outward</span>
                </a>
            </div>
        </div>
    )
}
