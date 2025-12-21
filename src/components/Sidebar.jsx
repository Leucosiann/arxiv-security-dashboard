
export default function Sidebar({
    activeView,
    setActiveView
}) {
    return (
        <aside className="w-64 border-r border-border-light dark:border-border-dark flex-shrink-0 flex flex-col justify-between hidden md:flex h-screen sticky top-0 bg-white dark:bg-[#18181b]">
            <div>
                <div className="h-24 flex items-center px-8">
                    <span className="material-symbols-outlined text-2xl mr-3 font-light">science</span>
                    <span className="font-semibold text-xl tracking-tight">ArxivTracker</span>
                </div>

                <div className="px-6 py-4 space-y-2">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium border shadow-sm transition-colors ${activeView === 'dashboard'
                                ? 'bg-gray-100 dark:bg-surface-dark text-gray-900 dark:text-white border-transparent dark:border-border-dark'
                                : 'text-text-muted-light dark:text-text-muted-dark hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-surface-dark border-transparent'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">dashboard</span>
                        <span className="text-base">Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActiveView('list')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium border shadow-sm transition-colors ${activeView === 'list'
                                ? 'bg-gray-100 dark:bg-surface-dark text-gray-900 dark:text-white border-transparent dark:border-border-dark'
                                : 'text-text-muted-light dark:text-text-muted-dark hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-surface-dark border-transparent'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">article</span>
                        <span className="text-base">Article List</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}
