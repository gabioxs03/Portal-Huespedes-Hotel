import { useState } from 'react'
import type { HotelSettings } from '../../interfaces/types'
import { contentRepository } from '../../lib/contentRepository'

interface Props {
  settings: HotelSettings
  onSaved: () => void
}

export function SettingsPanel({ settings, onSaved }: Props) {
  const [formData, setFormData] = useState<HotelSettings>(settings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await contentRepository.saveSettings(formData)
      onSaved()
      alert('Configuración guardada exitosamente.')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Configuración Institucional</h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Hotel</label>
          <input 
            type="text" 
            required 
            value={formData.hotelName}
            onChange={e => setFormData({ ...formData, hotelName: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje de Bienvenida (Español)</label>
          <textarea 
            required 
            value={formData.welcomeMessage.es}
            onChange={e => setFormData({ ...formData, welcomeMessage: { ...formData.welcomeMessage, es: e.target.value } })}
            className="w-full border border-gray-300 rounded-md p-2.5 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje de Bienvenida (Inglés - Opcional)</label>
          <textarea 
            value={formData.welcomeMessage.en || ''}
            onChange={e => setFormData({ ...formData, welcomeMessage: { ...formData.welcomeMessage, en: e.target.value } })}
            className="w-full border border-gray-300 rounded-md p-2.5 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL (Opcional)</label>
          <input 
            type="text" 
            value={formData.logoUrl || ''}
            onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://ejemplo.com/logo.png"
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
