import { useState } from 'react'
import type { ContentSection } from '../../interfaces/types'
import { contentRepository } from '../../lib/contentRepository'

export function SectionsView({
  sections,
  onRefresh
}: {
  sections: ContentSection[]
  onRefresh: () => Promise<void>
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ContentSection>>({})
  const [saving, setSaving] = useState(false)

  const handleEdit = (section: ContentSection) => {
    setEditingId(section.id)
    setFormData(section)
  }

  const handleCreate = () => {
    setEditingId('new')
    setFormData({
      id: crypto.randomUUID(),
      slug: '',
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      icon: '📁',
      position: sections.length + 1,
      isPublished: true
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id || !formData.slug || !formData.title?.es) return
    setSaving(true)
    try {
      await contentRepository.saveSection(formData as ContentSection)
      await onRefresh()
      setEditingId(null)
      setFormData({})
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (editingId) {
    return (
      <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-sm border border-gray-100 max-w-2xl">
        <h3 className="text-xl font-bold mb-4">{editingId === 'new' ? 'Nueva Sección' : 'Editar Sección'}</h3>
        <div className="space-y-4">
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
            <label className="block text-sm font-semibold mb-1">Slug * (Ej: gastronomia)</label>
            <input required type="text" className="w-full border rounded p-2" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
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
            <button disabled={saving} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
            <button disabled={saving} type="button" onClick={handleCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Secciones</h2>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nueva Sección</button>
      </div>
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold">Pos</th>
              <th className="p-3 font-semibold">Icono</th>
              <th className="p-3 font-semibold">Título (ES)</th>
              <th className="p-3 font-semibold">Slug</th>
              <th className="p-3 font-semibold">Estado</th>
              <th className="p-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sections.sort((a,b) => a.position - b.position).map(section => (
              <tr key={section.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{section.position}</td>
                <td className="p-3 text-2xl">{section.icon}</td>
                <td className="p-3">{section.title.es}</td>
                <td className="p-3 text-sm text-gray-500">{section.slug}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${section.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {section.isPublished ? 'Publicado' : 'Oculto'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => handleEdit(section)} className="text-blue-600 hover:underline text-sm">Editar</button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No hay secciones registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
