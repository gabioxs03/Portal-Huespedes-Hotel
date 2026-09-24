export type ContentItemType = 'document' | 'external_link' | 'whatsapp' | 'phone' | 'email' | 'internal_page'
export type SupportedLanguage = 'es' | 'en'
export interface LocalizedText { es: string; en?: string }
export interface ContentSection { id: string; slug: string; title: LocalizedText; description?: LocalizedText; icon: string; position: number; isPublished: boolean }
export interface ContentItem { id: string; sectionId: string; title: LocalizedText; description?: LocalizedText; type: ContentItemType; targetUrl: string; icon: string; imageUrl?: string; position: number; isPublished: boolean; updatedAt: string }
export interface HotelSettings { hotelName: string; welcomeMessage: LocalizedText; logoUrl?: string }
export interface PortalContent { settings: HotelSettings; sections: ContentSection[]; items: ContentItem[] }
export interface ActivityLogEntry { id: string; itemTitle: string; action: 'created' | 'updated' | 'published' | 'unpublished' | 'file_replaced'; createdAt: string; actor?: string }
