import { useEffect, useState } from 'react'
import { contentRepository } from '../../lib/contentRepository'
import type { PortalContent, ContentSection } from '../../interfaces/types'
import { SettingsPanel } from './SettingsPanel'
import { SectionManager } from './SectionManager'
import { ItemsManager } from './ItemsManager'

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [content, setContent] = useState<PortalContent | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'sections'>('sections')
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null)

  const loadData = () => {
    contentRepository.getAdmin().then(setContent).catch(console.error)
  }

  useEffect(() => { loadData() }, [])

  if (!content) return <div className="p-10 text-center font-semibold text-gray-500">Cargando datos del dashboard...</div>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800">
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">Portal Admin</h2>
          <p className="text-xs text-gray-400 mt-1">Gestión de Contenidos</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => { setActiveTab('sections'); setSelectedSection(null) }} 
            className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'sections' && !selectedSection ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Secciones
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setSelectedSection(null) }} 
            className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Configuración
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout} 
            className="w-full px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'settings' && <SettingsPanel settings={content.settings} onSaved={loadData} />}
          {activeTab === 'sections' && !selectedSection && <SectionManager sections={content.sections} onSaved={loadData} onSelectSection={setSelectedSection} />}
          {activeTab === 'sections' && selectedSection && <ItemsManager section={selectedSection} items={content.items.filter(i => i.sectionId === selectedSection.id)} onSaved={loadData} onBack={() => setSelectedSection(null)} />}
        </div>
      </main>
    </div>
  )
}
