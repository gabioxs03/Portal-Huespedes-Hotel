import type { ContentSection } from '../../interfaces/types'
import { contentRepository } from '../../lib/contentRepository'

interface Props {
  sections: ContentSection[]
  onSaved: () => void
  onSelectSection: (section: ContentSection) => void
}

export function SectionManager({ sections, onSaved, onSelectSection }: Props) {
  const handleTogglePublish = async (section: ContentSection) => {
    try {
      await contentRepository.saveSection({ ...section, isPublished: !section.isPublished })
      onSaved()
    } catch (e) {
      alert('Error actualizando estado de la sección')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return
    
    const newSections = [...sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap positions
    const tempPos = newSections[index].position
    newSections[index].position = newSections[targetIndex].position
    newSections[targetIndex].position = tempPos

    try {
      await contentRepository.saveSection(newSections[index])
      await contentRepository.saveSection(newSections[targetIndex])
      onSaved()
    } catch(e) {
      alert('Error reordenando secciones')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-800">Secciones del Portal</h3>
        <p className="text-sm text-gray-500 mt-1">Organiza y decide qué áreas son visibles para los huéspedes.</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {sections.map((section, index) => (
          <li key={section.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <button disabled={index === 0} onClick={() => handleMove(index, 'up')} className="text-gray-400 hover:text-blue-600 disabled:opacity-20 text-xs p-1" title="Subir">▲</button>
                <button disabled={index === sections.length - 1} onClick={() => handleMove(index, 'down')} className="text-gray-400 hover:text-blue-600 disabled:opacity-20 text-xs p-1" title="Bajar">▼</button>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 font-display text-xl text-blue-600">{section.icon}</div>
              <div>
                <p className="font-bold text-gray-800">{section.title.es}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">/{section.slug}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleTogglePublish(section)} 
                className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${section.isPublished ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
              >
                {section.isPublished ? 'Visible' : 'Oculto'}
              </button>
              <button 
                onClick={() => onSelectSection(section)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
              >
                Contenidos →
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
