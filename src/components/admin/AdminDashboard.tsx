import { useEffect, useState } from 'react'
import { contentRepository } from '../../lib/contentRepository'
import type { PortalContent, ContentSection } from '../../interfaces/types'
import { SettingsPanel } from './SettingsPanel'
import { SectionManager } from './SectionManager'
import { ItemsManager } from './ItemsManager'
import { useTheme } from '../../contexts/ThemeContext'

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [content, setContent] = useState<PortalContent | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'sections'>('sections')
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null)
  const { adminTheme: theme, toggleAdminTheme: toggleTheme } = useTheme()

  const loadData = () => {
    contentRepository.getAdmin().then(setContent).catch(console.error)
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0D1D2A' : '#F7F5F0')
  }, [theme])

  if (!content) return <div className="p-10 text-center font-semibold text-steel dark:text-stone min-h-screen bg-ivory dark:bg-[#0D1D2A]">Cargando datos del dashboard...</div>

  return (
      <div className="min-h-screen bg-ivory dark:bg-[#0D1D2A] flex flex-col md:flex-row text-ink dark:text-ivory font-sans">
        <aside className="w-full md:w-64 bg-white dark:bg-[#123248] border-r border-stone dark:border-white/10 flex flex-col shadow-sm z-10 shrink-0">
        <div className="p-6 border-b border-stone dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-deepblue dark:text-champagne">Portal Admin</h2>
            <p className="text-xs text-steel dark:text-stone mt-1 font-semibold uppercase tracking-wider">Gestión</p>
          </div>
          <button type="button" onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full border border-stone bg-white text-deepblue dark:border-white/15 dark:bg-white/5 dark:text-champagne" aria-label="Cambiar tema">{theme === 'light' ? '☾' : '☀'}</button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('sections'); setSelectedSection(null) }} 
            className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'sections' && !selectedSection ? 'bg-deepblue text-white dark:bg-champagne dark:text-ink' : 'text-ink dark:text-ivory hover:bg-mist dark:hover:bg-white/5'}`}
          >
            Secciones
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setSelectedSection(null) }} 
            className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-deepblue text-white dark:bg-champagne dark:text-ink' : 'text-ink dark:text-ivory hover:bg-mist dark:hover:bg-white/5'}`}
          >
            Configuración
          </button>
        </nav>
        <div className="p-4 border-t border-stone dark:border-white/10">
          <button 
            onClick={onLogout} 
            className="w-full px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {activeTab === 'settings' && <SettingsPanel settings={content.settings} onSaved={loadData} />}
          {activeTab === 'sections' && !selectedSection && <SectionManager sections={content.sections} onSaved={loadData} onSelectSection={setSelectedSection} />}
          {activeTab === 'sections' && selectedSection && <ItemsManager section={selectedSection} items={content.items.filter(i => i.sectionId === selectedSection.id)} onSaved={loadData} onBack={() => setSelectedSection(null)} />}
        </div>
      </main>
    </div>
  )
}
