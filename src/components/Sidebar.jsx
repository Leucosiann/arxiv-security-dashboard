const TAG_COLORS = {
    'cs.CR': 'bg-gray-600 text-gray-200',
    'cs.AI': 'bg-purple-600/80 text-purple-100',
    'cs.LG': 'bg-blue-600/80 text-blue-100',
    'cs.PL': 'bg-green-600/80 text-green-100',
}

const DATE_FILTERS = [
    { id: 'all', label: 'Tümü' },
    { id: '24h', label: 'Son 24 Saat' },
    { id: 'week', label: 'Son 1 Hafta' },
    { id: 'month', label: 'Son 1 Ay' },
]

export default function Sidebar({
    allTags,
    selectedTags,
    onTagChange,
    dateFilter,
    onDateFilterChange,
    articleCount,
    totalCount,
}) {
    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            onTagChange(selectedTags.filter(t => t !== tag))
        } else {
            onTagChange([...selectedTags, tag])
        }
    }

    return (
        <div className="sticky top-24 space-y-6">
            {/* Stats */}
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-600">
                <div className="text-3xl font-bold text-white">{articleCount}</div>
                <div className="text-sm text-gray-400">
                    {articleCount === totalCount ? 'makale' : `/ ${totalCount} makale`}
                </div>
            </div>

            {/* Date Filters */}
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                    Tarih
                </h3>
                <div className="space-y-1">
                    {DATE_FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => onDateFilterChange(filter.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${dateFilter === filter.id
                                    ? 'bg-accent-purple/20 text-accent-purple'
                                    : 'text-gray-400 hover:bg-dark-600 hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tag Filters */}
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                    Kategoriler
                </h3>
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                        const isSelected = selectedTags.includes(tag)
                        const colorClass = TAG_COLORS[tag] || 'bg-gray-600 text-gray-200'

                        return (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                                        ? `${colorClass} ring-2 ring-white/30`
                                        : `${colorClass} opacity-60 hover:opacity-100`
                                    }`}
                            >
                                {tag}
                            </button>
                        )
                    })}
                </div>
                {selectedTags.length > 0 && (
                    <button
                        onClick={() => onTagChange([])}
                        className="mt-3 text-xs text-gray-500 hover:text-accent-purple transition-colors"
                    >
                        Filtreleri temizle
                    </button>
                )}
            </div>

            {/* Legend */}
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                    Renk Kodları
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-gray-600"></span>
                        <span className="text-gray-400">cs.CR - Kriptografi & Güvenlik</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-purple-600"></span>
                        <span className="text-gray-400">cs.AI - Yapay Zeka</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-blue-600"></span>
                        <span className="text-gray-400">cs.LG - Makine Öğrenimi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-green-600"></span>
                        <span className="text-gray-400">cs.PL - Programlama Dilleri</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
