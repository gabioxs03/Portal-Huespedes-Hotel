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

  const inputClasses = "w-full bg-white dark:bg-[#0D1D2A] text-ink dark:text-ivory border border-stone dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-deepblue dark:focus:ring-champagne focus:border-transparent outline-none placeholder-steel/50 dark:placeholder-stone/30"
  const labelClasses = "block text-sm font-bold text-ink dark:text-ivory mb-1.5"

  return (
    <div className="bg-white dark:bg-[#123248] rounded-2xl shadow-luxury border border-stone dark:border-white/10 p-6 md:p-8">
      <h3 className="text-2xl font-display font-bold mb-6 text-deepblue dark:text-champagne">Configuración Institucional</h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        
        <div>
          <label className={labelClasses}>Nombre del Hotel</label>
          <input 
            type="text" 
            required 
            value={formData.hotelName}
            onChange={e => setFormData({ ...formData, hotelName: e.target.value })}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Mensaje de Bienvenida (Español)</label>
          <textarea 
            required 
            value={formData.welcomeMessage.es}
            onChange={e => setFormData({ ...formData, welcomeMessage: { ...formData.welcomeMessage, es: e.target.value } })}
            className={`${inputClasses} h-24`}
          />
        </div>

        <div>
          <label className={labelClasses}>Mensaje de Bienvenida (Inglés - Opcional)</label>
          <textarea 
            value={formData.welcomeMessage.en || ''}
            onChange={e => setFormData({ ...formData, welcomeMessage: { ...formData.welcomeMessage, en: e.target.value } })}
            className={`${inputClasses} h-24`}
          />
        </div>

        <div>
          <label className={labelClasses}>Logo URL (Opcional)</label>
          <input 
            type="text" 
            value={formData.logoUrl || ''}
            onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://ejemplo.com/logo.png"
            className={inputClasses}
          />
        </div>

        <div className="pt-6 border-t border-stone dark:border-white/10">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-deepblue dark:bg-champagne text-white dark:text-ink font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
