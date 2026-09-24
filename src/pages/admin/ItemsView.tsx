import { useState, useRef } from 'react'
import type { ContentItem, ContentSection } from '../../interfaces/types'
import { contentRepository } from '../../lib/contentRepository'

export function ItemsView({
  items,
  sections,
  onRefresh
}: {
  items: ContentItem[]
  sections: ContentSection[]
  onRefresh: () => Promise<void>
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ContentItem>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id)
    setFormData(item)
  }

  const handleCreate = () => {
    setEditingId('new')
    setFormData({
      id: crypto.randomUUID(),
      sectionId: sections[0]?.id || '',
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      type: 'document',
      targetUrl: '',
      icon: '📄',
      position: items.length + 1,
      isPublished: true,
      updatedAt: new Date().toISOString()
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id || !formData.sectionId || !formData.title?.es || !formData.targetUrl) return
    setSaving(true)
    try {
      formData.updatedAt = new Date().toISOString()
      await contentRepository.saveItem(formData as ContentItem)
      await onRefresh()
      setEditingId(null)
      setFormData({})
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await contentRepository.uploadDocument(file)
      setFormData(prev => ({ ...prev, targetUrl: url }))
      alert('Archivo subido con éxito')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (editingId) {
    return (
      <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-sm border border-gray-100 max-w-2xl">
        <h3 className="text-xl font-bold mb-4">{editingId === 'new' ? 'Nuevo Contenido' : 'Editar Contenido'}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Sección *</label>
              <select required className="w-full border rounded p-2" value={formData.sectionId || ''} onChange={e => setFormData({ ...formData, sectionId: e.target.value })}>
                <option value="" disabled>Seleccione...</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.title.es}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tipo de Contenido *</label>
              <select required className="w-full border rounded p-2" value={formData.type || 'document'} onChange={e => setFormData({ ...formData, type: e.target.value as ContentItem['type'] })}>
                <option value="document">Documento PDF</option>
                <option value="external_link">Enlace Externo</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Teléfono</option>
                <option value="email">Email</option>
                <option value="internal_page">Página Interna</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Título (ES) *</label>
              <input required type="text" className="w-full border rounded p-2" value={formData.title?.es || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title!, es: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Título (EN)</label>
              <input type="text" className="w-full border rounded p-2" value={formData.title?.en || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title!, en: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Destino (URL, teléfono, etc.) *</label>
            <div className="flex gap-2">
              <input required type="text" className="flex-1 border rounded p-2" value={formData.targetUrl || ''} onChange={e => setFormData({ ...formData, targetUrl: e.target.value })} placeholder="Ej: https://... o +549..." />
              {formData.type === 'document' && (
                <>
                  <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 whitespace-nowrap">
                    {uploading ? 'Subiendo...' : 'Subir PDF'}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Icono (Emoji)</label>
              <input type="text" className="w-full border rounded p-2" value={formData.icon || ''} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Posición</label>
              <input required type="number" className="w-full border rounded p-2" value={formData.position || 0} onChange={e => setFormData({ ...formData, position: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublished" checked={formData.isPublished || false} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} />
            <label htmlFor="isPublished" className="text-sm font-semibold">Publicado (Visible)</label>
          </div>
          <div className="flex gap-2 pt-4">
            <button disabled={saving || uploading} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
            <button disabled={saving || uploading} type="button" onClick={handleCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      </form>
    )
  }

  const getSectionName = (id: string) => sections.find(s => s.id === id)?.title.es || 'Desconocida'

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Contenidos</h2>
        <button onClick={handleCreate} disabled={sections.length === 0} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">+ Nuevo Contenido</button>
      </div>
      {sections.length === 0 && <p className="text-red-500 mb-4 text-sm">Debes crear al menos una sección antes de agregar contenido.</p>}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold">Sección</th>
              <th className="p-3 font-semibold">Pos</th>
              <th className="p-3 font-semibold">Icono</th>
              <th className="p-3 font-semibold">Título (ES)</th>
              <th className="p-3 font-semibold">Tipo</th>
              <th className="p-3 font-semibold">Estado</th>
              <th className="p-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.sort((a,b) => {
              if (a.sectionId !== b.sectionId) return a.sectionId.localeCompare(b.sectionId)
              return a.position - b.position
            }).map(item => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-sm font-medium text-gray-700">{getSectionName(item.sectionId)}</td>
                <td className="p-3">{item.position}</td>
                <td className="p-3 text-xl">{item.icon}</td>
                <td className="p-3">{item.title.es}</td>
                <td className="p-3 text-sm text-gray-500">{item.type}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {item.isPublished ? 'Publicado' : 'Oculto'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline text-sm">Editar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No hay contenidos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
