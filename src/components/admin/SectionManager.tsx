import { useMemo, useState } from 'react'
import type { ContentSection } from '../../interfaces/types'
import { contentRepository } from '../../lib/contentRepository'
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor, TouchSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { SortableSectionItem } from './SortableSectionItem'

interface Props {
  sections: ContentSection[]
  onSaved: () => void
  onSelectSection: (section: ContentSection) => void
}

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function SectionManager({ sections, onSaved, onSelectSection }: Props) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newSectionIcon, setNewSectionIcon] = useState('📁')
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.position - b.position)
  }, [sections])

  const handleTogglePublish = async (section: ContentSection) => {
    try {
      await contentRepository.saveSection({ ...section, isPublished: !section.isPublished })
      onSaved()
    } catch (e) {
      alert('Error actualizando estado de la sección')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedSections.findIndex((s) => s.id === active.id)
      const newIndex = sortedSections.findIndex((s) => s.id === over.id)
      
      const reordered = arrayMove(sortedSections, oldIndex, newIndex)
      
      const updates = reordered.map((section, index) => {
        const newPosition = index + 1
        if (section.position !== newPosition) {
          return contentRepository.saveSection({ ...section, position: newPosition })
        }
        return null
      }).filter(Boolean)
      
      if (updates.length > 0) {
        try {
          await Promise.all(updates)
          onSaved()
        } catch(e) {
          alert('Error reordenando secciones')
        }
      }
    }
  }

  const handleCreateSection = async (proceedToContent: boolean) => {
    if (!newSectionTitle.trim()) return
    setIsSaving(true)
    try {
      const newSection: ContentSection = {
        id: crypto.randomUUID(),
        slug: generateSlug(newSectionTitle),
        title: { es: newSectionTitle },
        icon: newSectionIcon,
        position: sections.length + 1,
        isPublished: true
      }
      
      await contentRepository.saveSection(newSection)
      onSaved()
      
      setShowAddModal(false)
      setNewSectionTitle('')
      setNewSectionIcon('📁')
      
      if (proceedToContent) {
        onSelectSection(newSection)
      }
    } catch (e) {
      alert('Error creando la sección')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSection = async (section: ContentSection) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la sección "${section.title.es}" y todo su contenido? Esta acción no se puede deshacer.`)) {
      try {
        await contentRepository.deleteSection(section.id)
        onSaved()
      } catch (e) {
        alert('Error al eliminar la sección')
      }
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-[#123248] rounded-2xl shadow-luxury border border-stone dark:border-white/10 overflow-hidden relative">
        <div className="p-6 border-b border-stone dark:border-white/10 bg-mist/50 dark:bg-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h3 className="text-xl font-display font-bold text-ink dark:text-ivory">Secciones del Portal</h3>
            <p className="text-sm text-steel dark:text-stone mt-1">Organiza y decide qué áreas son visibles para los huéspedes. Arrastra las secciones usando el icono ☰ para reordenarlas.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-deepblue dark:bg-champagne text-white dark:text-ink px-5 py-2.5 rounded-xl hover:opacity-90 transition-colors font-bold shadow-sm text-sm whitespace-nowrap shrink-0"
          >
            + Agregar Sección
          </button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-stone dark:divide-white/10">
              {sortedSections.length === 0 ? (
                <li className="p-8 text-center text-steel dark:text-stone font-medium">No hay secciones todavía.</li>
              ) : (
                sortedSections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    onTogglePublish={handleTogglePublish}
                    onSelectSection={onSelectSection}
                    onDeleteSection={handleDeleteSection}
                  />
                ))
              )}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#123248] rounded-2xl shadow-luxury max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-stone dark:border-white/10">
            <h3 className="text-2xl font-display font-bold text-ink dark:text-champagne mb-5">Nueva Sección</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink dark:text-ivory mb-1.5">Nombre de la sección *</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="Ej: Spa & Wellness"
                  className="w-full bg-white dark:bg-[#0D1D2A] text-ink dark:text-ivory border border-stone dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-deepblue dark:focus:ring-champagne focus:border-transparent outline-none placeholder-steel/50 dark:placeholder-stone/30"
                  value={newSectionTitle} 
                  onChange={e => setNewSectionTitle(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink dark:text-ivory mb-1.5">Icono (Emoji)</label>
                <input 
                  type="text" 
                  placeholder="Ej: 💆‍♀️"
                  className="w-full bg-white dark:bg-[#0D1D2A] text-ink dark:text-ivory border border-stone dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-deepblue dark:focus:ring-champagne focus:border-transparent outline-none placeholder-steel/50 dark:placeholder-stone/30"
                  value={newSectionIcon} 
                  onChange={e => setNewSectionIcon(e.target.value)} 
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button 
                disabled={isSaving || !newSectionTitle.trim()}
                onClick={() => handleCreateSection(true)} 
                className="w-full bg-deepblue dark:bg-champagne text-white dark:text-ink font-bold py-3 px-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                Crear y Añadir Contenido
              </button>
              <button 
                disabled={isSaving || !newSectionTitle.trim()}
                onClick={() => handleCreateSection(false)} 
                className="w-full bg-white dark:bg-transparent border border-stone dark:border-white/20 text-ink dark:text-ivory font-bold py-3 px-4 rounded-xl hover:bg-mist dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
              >
                Crear sección vacía
              </button>
              <button 
                disabled={isSaving}
                onClick={() => setShowAddModal(false)} 
                className="w-full text-steel dark:text-stone font-semibold py-2 px-4 rounded-xl hover:bg-mist dark:hover:bg-white/5 transition-colors mt-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
