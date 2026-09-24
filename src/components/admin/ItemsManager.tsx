import { useState } from 'react'
import type { ContentItem, ContentSection, ContentItemType } from '../../interfaces/types'
import { contentRepository } from '../../lib/contentRepository'

interface Props {
  section: ContentSection
  items: ContentItem[]
  onSaved: () => void
  onBack: () => void
}

export function ItemsManager({ section, items, onSaved, onBack }: Props) {
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

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

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === items.length - 1) return
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const tempPos = newItems[index].position
    newItems[index].position = newItems[targetIndex].position
    newItems[targetIndex].position = tempPos
    try {
      await contentRepository.saveItem(newItems[index])
      await contentRepository.saveItem(newItems[targetIndex])
      onSaved()
    } catch(e) {
      alert('Error reordenando')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold px-2 py-1 bg-white border border-gray-200 rounded">←</button>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Contenidos: {section.title.es}</h3>
          </div>
        </div>
        {!editingItem && (
          <button onClick={handleCreate} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm">
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
        <ul className="divide-y divide-gray-100">
          {items.length === 0 && <li className="p-8 text-center text-gray-500">No hay contenidos en esta sección.</li>}
          {items.map((item, index) => (
            <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-0.5">
                  <button disabled={index === 0} onClick={() => handleMove(index, 'up')} className="text-gray-400 hover:text-blue-600 disabled:opacity-20 text-xs p-1" title="Subir">▲</button>
                  <button disabled={index === items.length - 1} onClick={() => handleMove(index, 'down')} className="text-gray-400 hover:text-blue-600 disabled:opacity-20 text-xs p-1" title="Bajar">▼</button>
                </div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100 text-lg">{item.icon}</div>
                <div>
                  <p className="font-bold text-gray-800">{item.title.es}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{item.type} • {item.targetUrl}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button onClick={() => handleTogglePublish(item)} className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${item.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {item.isPublished ? 'Visible' : 'Oculto'}
                </button>
                <button onClick={() => handleEdit(item)} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-sm font-semibold">Editar</button>
              </div>
            </li>
          ))}
        </ul>
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

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Título (Español)</label>
          <input type="text" required value={formData.title.es} onChange={e => setFormData({...formData, title: {...formData.title, es: e.target.value}})} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Título (Inglés - Opcional)</label>
          <input type="text" value={formData.title.en || ''} onChange={e => setFormData({...formData, title: {...formData.title, en: e.target.value}})} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Contenido</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ContentItemType})} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-blue-500">
            <option value="external_link">Enlace Web</option>
            <option value="document">Documento (PDF)</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Teléfono</option>
            <option value="email">Correo Electrónico</option>
            <option value="internal_page">Página Interna</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Icono (Emoji)</label>
          <input type="text" required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {formData.type === 'document' ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Archivo PDF</label>
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded p-2 text-sm" required={!formData.targetUrl} />
          {formData.targetUrl && !file && <p className="text-xs text-gray-500 mt-1">Ya hay un documento subido. Sube uno nuevo para reemplazarlo.</p>}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Destino (URL, Teléfono, Email, etc.)</label>
          <input type="text" required value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} placeholder={formData.type === 'whatsapp' ? 'https://wa.me/...' : formData.type === 'phone' ? 'tel:...' : formData.type === 'email' ? 'mailto:...' : 'https://...'} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-blue-500" />
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-semibold transition-colors">Cancelar</button>
        <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
          {isSaving ? 'Guardando...' : 'Guardar Ítem'}
        </button>
      </div>
    </form>
  )
}
