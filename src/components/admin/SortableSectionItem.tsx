import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ContentSection } from '../../interfaces/types'

interface Props {
  section: ContentSection
  onTogglePublish: (section: ContentSection) => void
  onSelectSection: (section: ContentSection) => void
  onDeleteSection: (section: ContentSection) => void
}

export function SortableSectionItem({ section, onTogglePublish, onSelectSection, onDeleteSection }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-mist/50 dark:hover:bg-white/5 transition-colors relative bg-white dark:bg-transparent">
      <div className="flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="text-steel dark:text-stone hover:text-deepblue dark:hover:text-champagne cursor-grab active:cursor-grabbing p-1 px-2 touch-none"
          title="Arrastrar para reordenar"
        >
          ☰
        </button>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist dark:bg-champagne/15 font-display text-xl text-deepblue dark:text-champagne">{section.icon}</div>
        <div>
          <p className="font-display text-xl font-bold text-ink dark:text-ivory leading-tight">{section.title.es}</p>
          <p className="text-xs text-steel dark:text-stone font-mono mt-1">/{section.slug}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button 
          onClick={() => onTogglePublish(section)} 
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${section.isPublished ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' : 'bg-mist text-steel border-stone dark:bg-white/5 dark:text-stone dark:border-white/10'}`}
        >
          {section.isPublished ? 'Visible' : 'Oculto'}
        </button>
        <button 
          onClick={() => onSelectSection(section)}
          className="bg-white dark:bg-[#0D1D2A] border border-stone dark:border-white/20 text-ink dark:text-ivory px-4 py-2 rounded-xl hover:bg-mist dark:hover:bg-white/10 transition-colors text-sm font-bold shadow-sm"
        >
          Contenidos →
        </button>
        <button 
          onClick={() => onDeleteSection(section)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Eliminar sección"
        >
          🗑️
        </button>
      </div>
    </li>
  )
}
