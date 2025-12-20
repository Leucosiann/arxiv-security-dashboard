import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const TAG_COLORS = {
    'cs.CR': 'bg-gray-600/60 text-gray-300',
    'cs.AI': 'bg-purple-600/60 text-purple-200',
    'cs.LG': 'bg-blue-600/60 text-blue-200',
    'cs.PL': 'bg-green-600/60 text-green-200',
}

export default function ArticleCard({ article, defaultLang = 'tr' }) {
    const [lang, setLang] = useState(defaultLang)
    const [expanded, setExpanded] = useState(false)

    // Sync with global language toggle
    useEffect(() => {
        setLang(defaultLang)
    }, [defaultLang])

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const content = lang === 'tr' ? article.content.tr : article.content.en

    return (
        <article className="group bg-dark-700 rounded-2xl border border-dark-600 hover:border-dark-500 transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {article.tags.map(tag => (
                                <span
                                    key={tag}
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${TAG_COLORS[tag] || 'bg-gray-600/60 text-gray-300'}`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-semibold text-white group-hover:text-accent-purple transition-colors leading-tight mb-2">
                            <a
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline decoration-accent-purple/50"
                            >
                                {article.title}
                            </a>
                        </h2>

                        {/* Authors & Date */}
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="truncate max-w-[300px]">
                                {article.authors.join(', ')}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="whitespace-nowrap">{formatDate(article.published_date)}</span>
                        </div>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex-shrink-0">
                        <div className="flex bg-dark-800 rounded-lg p-0.5">
                            <button
                                onClick={() => setLang('tr')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'tr'
                                        ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                TR Özet
                            </button>
                            <button
                                onClick={() => setLang('en')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'en'
                                        ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                EN Abstract
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-4">
                <div
                    className={`markdown-content text-gray-300 text-sm leading-relaxed ${!expanded ? 'line-clamp-4' : ''
                        }`}
                >
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>

                {content.length > 300 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-3 text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
                    >
                        {expanded ? '← Küçült' : 'Devamını oku →'}
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-dark-800/50 border-t border-dark-600 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    arxiv:{article.id}
                </span>
                <div className="flex items-center gap-3">
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-accent-purple transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Arxiv
                    </a>
                    <a
                        href={article.pdf_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-accent-blue transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                    </a>
                </div>
            </div>
        </article>
    )
}
