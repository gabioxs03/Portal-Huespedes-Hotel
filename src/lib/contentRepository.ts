import { initialPortalContent } from '../data/mockData'
import type { ContentItem, ContentSection, HotelSettings, PortalContent } from '../interfaces/types'
import { isSupabaseConfigured, supabase } from './supabase'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const localKey = 'hotel-portal-content'

function localContent(): PortalContent {
  const saved = localStorage.getItem(localKey)
  return saved ? JSON.parse(saved) as PortalContent : clone(initialPortalContent)
}

function persist(content: PortalContent) { localStorage.setItem(localKey, JSON.stringify(content)) }

function sectionFromRow(row: Record<string, unknown>): ContentSection {
  return { id: String(row.id), slug: String(row.slug), title: { es: String(row.title_es), en: row.title_en ? String(row.title_en) : undefined }, description: row.description_es ? { es: String(row.description_es), en: row.description_en ? String(row.description_en) : undefined } : undefined, icon: String(row.icon ?? '•'), position: Number(row.position), isPublished: Boolean(row.is_published) }
}

function itemFromRow(row: Record<string, unknown>): ContentItem {
  return { id: String(row.id), sectionId: String(row.section_id), title: { es: String(row.title_es), en: row.title_en ? String(row.title_en) : undefined }, description: row.description_es ? { es: String(row.description_es), en: row.description_en ? String(row.description_en) : undefined } : undefined, type: row.type as ContentItem['type'], targetUrl: String(row.target_url), icon: String(row.icon ?? '•'), imageUrl: row.image_url ? String(row.image_url) : undefined, position: Number(row.position), isPublished: Boolean(row.is_published), updatedAt: String(row.updated_at) }
}

export const contentRepository = {
  async getPublic(): Promise<PortalContent> {
    if (!supabase) return localContent()
    const [settingsResult, sectionsResult, itemsResult] = await Promise.all([
      supabase.from('hotel_settings').select('*').limit(1).maybeSingle(),
      supabase.from('content_sections').select('*').eq('is_published', true).order('position'),
      supabase.from('content_items').select('*').eq('is_published', true).order('position')
    ])
    if (settingsResult.error || sectionsResult.error || itemsResult.error) throw new Error('No se pudo cargar el contenido publicado.')
    const settingsRow = settingsResult.data as Record<string, unknown> | null
    return {
      settings: settingsRow ? { hotelName: String(settingsRow.hotel_name), welcomeMessage: { es: String(settingsRow.welcome_es), en: settingsRow.welcome_en ? String(settingsRow.welcome_en) : undefined }, logoUrl: settingsRow.logo_url ? String(settingsRow.logo_url) : undefined } : clone(initialPortalContent.settings),
      sections: (sectionsResult.data as Record<string, unknown>[]).map(sectionFromRow),
      items: (itemsResult.data as Record<string, unknown>[]).map(itemFromRow)
    }
  },
  async getAdmin(): Promise<PortalContent> {
    if (!supabase) return localContent()
    const [settingsResult, sectionsResult, itemsResult] = await Promise.all([supabase.from('hotel_settings').select('*').limit(1).maybeSingle(), supabase.from('content_sections').select('*').order('position'), supabase.from('content_items').select('*').order('position')])
    if (settingsResult.error || sectionsResult.error || itemsResult.error) throw new Error('No se pudo cargar el dashboard.')
    const settingsRow = settingsResult.data as Record<string, unknown> | null
    return { settings: settingsRow ? { hotelName: String(settingsRow.hotel_name), welcomeMessage: { es: String(settingsRow.welcome_es), en: settingsRow.welcome_en ? String(settingsRow.welcome_en) : undefined }, logoUrl: settingsRow.logo_url ? String(settingsRow.logo_url) : undefined } : clone(initialPortalContent.settings), sections: (sectionsResult.data as Record<string, unknown>[]).map(sectionFromRow), items: (itemsResult.data as Record<string, unknown>[]).map(itemFromRow) }
  },
  async saveItem(item: ContentItem): Promise<void> {
    if (!supabase) { const content = localContent(); const index = content.items.findIndex(current => current.id === item.id); if (index >= 0) content.items[index] = item; else content.items.push(item); persist(content); return }
    const payload = { section_id: item.sectionId, title_es: item.title.es, title_en: item.title.en || null, description_es: item.description?.es || null, description_en: item.description?.en || null, type: item.type, target_url: item.targetUrl, icon: item.icon, image_url: item.imageUrl || null, position: item.position, is_published: item.isPublished }
    const { error } = await supabase.from('content_items').upsert({ id: item.id, ...payload })
    if (error) throw new Error(error.message)
  },
  async saveSection(section: ContentSection): Promise<void> {
    if (!supabase) { const content = localContent(); const index = content.sections.findIndex(current => current.id === section.id); if (index >= 0) content.sections[index] = section; else content.sections.push(section); persist(content); return }
    const { error } = await supabase.from('content_sections').upsert({ id: section.id, slug: section.slug, title_es: section.title.es, title_en: section.title.en || null, description_es: section.description?.es || null, description_en: section.description?.en || null, icon: section.icon, position: section.position, is_published: section.isPublished })
    if (error) throw new Error(error.message)
  },
  async deleteItem(itemId: string): Promise<void> {
    if (!supabase) {
      const content = localContent()
      content.items = content.items.filter(i => i.id !== itemId)
      persist(content)
      return
    }
    const { error } = await supabase.from('content_items').delete().eq('id', itemId)
    if (error) throw new Error(error.message)
  },
  async deleteSection(sectionId: string): Promise<void> {
    if (!supabase) { 
      const content = localContent()
      content.sections = content.sections.filter(s => s.id !== sectionId)
      content.items = content.items.filter(i => i.sectionId !== sectionId)
      persist(content)
      return 
    }
    await supabase.from('content_items').delete().eq('section_id', sectionId)
    const { error } = await supabase.from('content_sections').delete().eq('id', sectionId)
    if (error) throw new Error(error.message)
  },
  async saveSettings(settings: HotelSettings): Promise<void> {
    if (!supabase) { const content = localContent(); content.settings = settings; persist(content); return }
    const { error } = await supabase.from('hotel_settings').upsert({ id: 1, hotel_name: settings.hotelName, welcome_es: settings.welcomeMessage.es, welcome_en: settings.welcomeMessage.en || null, logo_url: settings.logoUrl || null })
    if (error) throw new Error(error.message)
  },
  async uploadDocument(file: File): Promise<string> {
    if (!supabase) return URL.createObjectURL(file)
    const safeName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const { error } = await supabase.storage.from('public-content').upload(`documents/${safeName}`, file, { upsert: false, contentType: file.type })
    if (error) throw new Error(error.message)
    return supabase.storage.from('public-content').getPublicUrl(`documents/${safeName}`).data.publicUrl
  },
  async signIn(email: string, password: string) {
    if (!supabase) {
      if (email === 'admin@hotel.com' && password === '123456') {
        localStorage.setItem('mock_admin_auth', 'true')
        return
      }
      throw new Error('Credenciales inválidas. En modo local usa admin@hotel.com / 123456')
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw new Error(error.message)
  },
  async signOut() { 
    if (!supabase) {
      localStorage.removeItem('mock_admin_auth')
      return
    }
    await supabase.auth.signOut() 
  },
  async isAuthenticated() { 
    if (!supabase) {
      return localStorage.getItem('mock_admin_auth') === 'true'
    }
    const { data } = await supabase.auth.getSession(); return Boolean(data.session) 
  },
  isConfigured: isSupabaseConfigured
}
