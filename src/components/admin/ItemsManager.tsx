import { useState, useMemo } from 'react'
import type { ContentItem, ContentSection, ContentItemType } from '../../interfaces/types'
import { contentRepository } from '../../lib/contentRepository'
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor, TouchSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { SortableItemRow } from './SortableItemRow'

interface Props {
  section: ContentSection
  items: ContentItem[]
  onSaved: () => void
  onBack: () => void
}

export function ItemsManager({ section, items, onSaved, onBack }: Props) {
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.position - b.position)
  }, [items])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item)
  }

  const handleCreate = () => {
    setEditingItem({
      id: crypto.randomUUID(),
      sectionId: section.id,
      title: { es: '', en: '' },
      type: 'external_link',
      targetUrl: '',
      icon: '📄',
      position: items.length > 0 ? Math.max(...items.map(i => i.position)) + 1 : 1,
      isPublished: true,
      updatedAt: new Date().toISOString()
    })
  }

  const handleTogglePublish = async (item: ContentItem) => {
    try {
      await contentRepository.saveItem({ ...item, isPublished: !item.isPublished })
      onSaved()
    } catch (e) {
      alert('Error actualizando estado')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex((s) => s.id === active.id)
      const newIndex = sortedItems.findIndex((s) => s.id === over.id)
      
      const reordered = arrayMove(sortedItems, oldIndex, newIndex)
      
      const updates = reordered.map((item, index) => {
        const newPosition = index + 1
        if (item.position !== newPosition) {
          return contentRepository.saveItem({ ...item, position: newPosition })
        }
        return null
      }).filter(Boolean)
      
      if (updates.length > 0) {
        try {
          await Promise.all(updates)
          onSaved()
        } catch(e) {
          alert('Error reordenando ítems')
        }
      }
    }
  }

  const handleDeleteItem = async (item: ContentItem) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el contenido "${item.title.es}"? Esta acción no se puede deshacer.`)) {
      try {
        await contentRepository.deleteItem(item.id)
        onSaved()
      } catch (e) {
        alert('Error al eliminar el contenido')
      }
    }
  }

  return (
    <div className="bg-white dark:bg-[#123248] rounded-2xl shadow-luxury border border-stone dark:border-white/10 overflow-hidden">
      <div className="p-6 border-b border-stone dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-mist/50 dark:bg-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-steel dark:text-stone hover:text-ink dark:hover:text-ivory font-bold px-4 py-2 bg-white dark:bg-[#0D1D2A] border border-stone dark:border-white/20 rounded-xl shadow-sm transition-colors">← Volver</button>
          <div>
            <h3 className="text-xl font-display font-bold text-ink dark:text-ivory break-words line-clamp-2">Contenidos: {section.title.es}</h3>
          </div>
        </div>
        {!editingItem && (
          <button onClick={handleCreate} className="bg-deepblue dark:bg-champagne text-white dark:text-ink font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-colors shadow-sm text-sm whitespace-nowrap self-start sm:self-auto shrink-0">
            + Nuevo Ítem
          </button>
        )}
      </div>

      {editingItem ? (
        <ItemForm 
          item={editingItem} 
          onSave={async (updated) => {
            await contentRepository.saveItem(updated)
            onSaved()
            setEditingItem(null)
          }}
          onCancel={() => setEditingItem(null)}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-stone dark:divide-white/10">
              {sortedItems.length === 0 && <li className="p-8 text-center text-steel dark:text-stone font-medium">No hay contenidos en esta sección.</li>}
              {sortedItems.map((item) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  onTogglePublish={handleTogglePublish}
                  onEdit={handleEdit}
                  onDelete={handleDeleteItem}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function ItemForm({ item, onSave, onCancel }: { item: ContentItem, onSave: (i: ContentItem) => Promise<void>, onCancel: () => void }) {
  const [formData, setFormData] = useState<ContentItem>(item)
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let finalUrl = formData.targetUrl
      if (formData.type === 'document' && file) {
        finalUrl = await contentRepository.uploadDocument(file)
      }
      await onSave({ ...formData, targetUrl: finalUrl, updatedAt: new Date().toISOString() })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClasses = "w-full bg-white dark:bg-[#0D1D2A] text-ink dark:text-ivory border border-stone dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-deepblue dark:focus:ring-champagne focus:border-transparent outline-none placeholder-steel/50 dark:placeholder-stone/30"
  const labelClasses = "block text-sm font-bold text-ink dark:text-ivory mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Título (Español)</label>
          <input type="text" required value={formData.title.es} onChange={e => setFormData({...formData, title: {...formData.title, es: e.target.value}})} className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Título (Inglés - Opcional)</label>
          <input type="text" value={formData.title.en || ''} onChange={e => setFormData({...formData, title: {...formData.title, en: e.target.value}})} className={inputClasses} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Tipo de Contenido</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ContentItemType})} className={inputClasses}>
            <option value="external_link">Enlace Web</option>
            <option value="document">Documento (PDF)</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Teléfono</option>
            <option value="email">Correo Electrónico</option>
            <option value="internal_page">Página Interna</option>
          </select>
        </div>
        <div>
          <label className={labelClasses}>Icono (Emoji)</label>
          <input type="text" required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className={inputClasses} />
        </div>
      </div>

      {formData.type === 'document' ? (
        <div>
          <label className={labelClasses}>Archivo PDF</label>
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mist dark:file:bg-white/10 file:text-deepblue dark:file:text-champagne hover:file:bg-stone dark:hover:file:bg-white/20`} required={!formData.targetUrl} />
          {formData.targetUrl && !file && <p className="text-xs text-steel dark:text-stone mt-2 font-medium">Ya hay un documento subido. Sube uno nuevo para reemplazarlo.</p>}
        </div>
      ) : (
        <div>
          <label className={labelClasses}>Destino (URL, Teléfono, Email, etc.)</label>
          <input type="text" required value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} placeholder={formData.type === 'whatsapp' ? 'https://wa.me/...' : formData.type === 'phone' ? 'tel:...' : formData.type === 'email' ? 'mailto:...' : 'https://...'} className={inputClasses} />
        </div>
      )}

      <div className="pt-6 border-t border-stone dark:border-white/10 flex items-center justify-end gap-3 flex-wrap">
        <button type="button" onClick={onCancel} className="px-5 py-3 text-steel dark:text-stone hover:bg-mist dark:hover:bg-white/5 rounded-xl font-bold transition-colors w-full sm:w-auto">Cancelar</button>
        <button type="submit" disabled={isSaving} className="bg-deepblue dark:bg-champagne text-white dark:text-ink font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto">
          {isSaving ? 'Guardando...' : 'Guardar Ítem'}
        </button>
      </div>
    </form>
  )
}
