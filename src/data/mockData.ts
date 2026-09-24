import type { PortalContent } from '../interfaces/types'

const pdf = (file: string) => `https://display.360net.com.ar/qr/upload/${file}`
const stamp = '2026-09-22T00:00:00Z'
const item = (id: string, sectionId: string, es: string, type: 'document' | 'external_link' | 'whatsapp' | 'phone' | 'email', targetUrl: string, icon: string, position: number, en?: string) => ({ id, sectionId, title: { es, en }, type, targetUrl, icon, position, isPublished: true, updatedAt: stamp })

export const initialPortalContent: PortalContent = {
  settings: { hotelName: 'Sheraton Tucumán', welcomeMessage: { es: 'Todo lo que necesita, a un toque de distancia.', en: 'Everything you need, just a touch away.' } },
  sections: [
    { id: 'services', slug: 'services', title: { es: 'Servicios', en: 'Services' }, description: { es: 'Atención para su estancia', en: 'Care for your stay' }, icon: '✦', position: 1, isPublished: true },
    { id: 'gastronomy', slug: 'gastronomy', title: { es: 'Gastronomía', en: 'Gastronomy' }, description: { es: 'Sabores para cada momento', en: 'Flavours for every moment' }, icon: '⌘', position: 2, isPublished: true },
    { id: 'contacts', slug: 'contacts', title: { es: 'Contactos', en: 'Contacts' }, description: { es: 'Estamos para asistirlo', en: 'We are here to assist you' }, icon: '◌', position: 3, isPublished: true },
    { id: 'information', slug: 'information', title: { es: 'Información General', en: 'General Information' }, description: { es: 'Todo sobre el hotel', en: 'Everything about the hotel' }, icon: 'i', position: 4, isPublished: true },
    { id: 'social', slug: 'social', title: { es: 'Redes Sociales', en: 'Social Media' }, description: { es: 'Novedades y experiencias', en: 'News and experiences' }, icon: '◎', position: 5, isPublished: true },
    { id: 'casino', slug: 'casino', title: { es: 'Casino Parque' }, description: { es: 'Entretenimiento a pocos pasos', en: 'Entertainment steps away' }, icon: '♢', position: 6, isPublished: true }
  ],
  items: [
    item('guest-service', 'services', 'Servicio al huésped', 'whatsapp', 'https://wa.me/5493815511000?text=Necesito%20informacion:', '✦', 1, 'Guest service'), item('maintenance', 'services', 'Mantenimiento', 'phone', 'tel:+543815511000', '⚒', 2, 'Maintenance'),
    item('gastro-hours', 'gastronomy', 'Horarios Gastronomía', 'document', pdf('6d8da5c73393dc5f27b12fca935d4b6b.pdf'), '◷', 1, 'Gastronomy hours'), item('lobby-menu', 'gastronomy', 'Carta Lobby Bar', 'document', pdf('37cb20a5397ffaf1c4cd315495e70aa5.pdf'), '⌘', 2, 'Lobby Bar menu'), item('wine-menu', 'gastronomy', 'Carta Vinos', 'document', pdf('53cc5df0594d9d507c2c7f6841b8e42b.pdf'), '◈', 3, 'Wine list'), item('mora-menu', 'gastronomy', 'Carta Mora', 'document', pdf('7e3910b158ded3e8fd9f0507ac1d0d40.pdf'), '⌘', 4, 'Mora menu'), item('pool-menu', 'gastronomy', 'Carta Pileta', 'document', pdf('b851407ca9b2919ab4fd66fa475240b8.pdf'), '⌘', 5, 'Pool menu'),
    item('reception', 'contacts', 'Recepción', 'whatsapp', 'https://wa.me/5493815511000?text=Necesito%20informacion:', '◌', 1, 'Reception'), item('sales', 'contacts', 'Ventas', 'email', 'mailto:ventas@soldelnoa.com?subject=Necesito%20información', '✉', 2, 'Sales'),
    item('pets', 'information', 'Reglamento para Mascotas', 'document', pdf('7ebce0c82379fb32275e744612f13eac.pdf'), '▤', 1, 'Pet policy'), item('general-info', 'information', 'Información General', 'document', pdf('b643396d818062050be56def3c1df204.pdf'), '▤', 2, 'General information'), item('laundry', 'information', 'Precios Lavandería', 'document', pdf('0f8f05f6dbac91366ae4b63baf9dcf61.pdf'), '▤', 3, 'Laundry prices'), item('channels', 'information', 'Grilla de Canales', 'external_link', 'https://display.360net.com.ar/qr/saltos/9e57b0c2b610bd35f6d5e8bba2d62d6d.php', '▤', 4, 'Channel guide'), item('club-lounge', 'information', 'Club Lounge', 'document', pdf('445bd6dd1ddb1b60d4a3876569d73fb0.pdf'), '▤', 5),
    item('hotel-instagram', 'social', 'Instagram · Hotel Sheraton', 'external_link', 'https://www.instagram.com/', '◎', 1), item('hotel-facebook', 'social', 'Facebook · Hotel Sheraton', 'external_link', 'https://www.facebook.com/', 'f', 2), item('mora-instagram', 'social', 'Instagram · Mora Bistró', 'external_link', 'https://www.instagram.com/', '◎', 3),
    item('casino-menu', 'casino', 'Menú Casino Parque', 'external_link', 'https://menu.360net.com.ar/menu/menu.php?r=17133936371895245306', '⌘', 1), item('casino-contact', 'casino', 'Contacto Casino', 'whatsapp', 'https://wa.me/543813196746', '◌', 2), item('casino-hours', 'casino', 'Horarios Casino', 'external_link', 'https://display.360net.com.ar/qr/promo.php?i=55f877a72b49cf351f0369f1029d539a', '◷', 3)
  ]
}
