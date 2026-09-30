import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { contentRepository } from '../lib/contentRepository'
import type { ContentItem, ContentSection, PortalContent } from '../interfaces/types'
import { useRoom } from '../contexts/RoomContext'
import { useTheme } from '../contexts/ThemeContext'

const text = (value: { es: string; en?: string }, language: string) => language.startsWith('en') ? value.en || value.es : value.es

export function PortalPage() {
  const { i18n } = useTranslation()
  const { roomNumber } = useRoom()
  const { portalTheme: theme, togglePortalTheme: toggleTheme } = useTheme()
  const [content, setContent] = useState<PortalContent | null>(null)
  const [selected, setSelected] = useState<ContentSection | null>(null)
  const [document, setDocument] = useState<ContentItem | null>(null)
  const [error, setError] = useState('')
  const language = i18n.resolvedLanguage || 'es'

  useEffect(() => {
    window.document.documentElement.classList.toggle('dark', theme === 'dark')
    window.document.documentElement.dataset.theme = theme
    window.document.documentElement.style.colorScheme = theme
    window.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0D1D2A' : '#F7F5F0')
  }, [theme])

  useEffect(() => { void contentRepository.getPublic().then(setContent).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No se pudo conectar con el portal.')) }, [])
  const items = useMemo(() => selected && content ? content.items.filter(item => item.sectionId === selected.id && item.isPublished).sort((a, b) => a.position - b.position) : [], [content, selected])
  const switchLanguage = () => { void i18n.changeLanguage(language.startsWith('es') ? 'en' : 'es') }
  const openItem = (item: ContentItem) => { if (item.type === 'document') setDocument(item); else window.open(item.targetUrl, item.type === 'internal_page' ? '_self' : '_blank', 'noopener,noreferrer') }

  if (error) return <main className="grid min-h-screen place-items-center bg-ivory p-6 text-center text-ink"><div><p className="font-display text-3xl">Portal temporalmente no disponible</p><p className="mt-3 text-sm text-steel">{error}</p></div></main>
  if (!content) return <main className="grid min-h-screen place-items-center bg-ivory text-deepblue">Cargando experiencia…</main>

  return (
      <main className="min-h-screen bg-ivory text-ink dark:bg-[#0D1D2A] dark:text-ivory">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <header className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-champagne/70 bg-ink font-display text-xl font-semibold text-champagne">{content.settings.logoUrl ? <img src={content.settings.logoUrl} alt="" className="h-full w-full object-cover" /> : 'S'}</span>
              <span className="font-display text-2xl font-semibold tracking-tight">{content.settings.hotelName}</span>
            </a>
            <div className="flex gap-2">
              <button type="button" onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full border border-stone bg-white text-deepblue dark:border-white/15 dark:bg-white/5 dark:text-champagne" aria-label="Cambiar tema">{theme === 'light' ? '☾' : '☀'}</button>
              <button type="button" onClick={switchLanguage} className="rounded-full border border-stone bg-white px-3 text-xs font-bold text-deepblue dark:border-white/15 dark:bg-white/5 dark:text-ivory">{language.startsWith('es') ? 'EN' : 'ES'}</button>
            </div>
          </header>
          
          {!selected ? (
            <>
              <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#123248] px-6 py-8 text-ivory shadow-luxury">
                <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-champagne/35" />
                <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-champagne">{language.startsWith('en') ? 'Your stay, at your pace' : 'Su estancia, a su ritmo'}</p>
                <h1 className="relative mt-3 font-display text-4xl font-semibold leading-none">{roomNumber ? (language.startsWith('en') ? `Welcome to Room ${roomNumber}` : `Bienvenido a la Habitación ${roomNumber}`) : (language.startsWith('en') ? 'Welcome' : 'Bienvenido')}</h1>
                <p className="relative mt-5 max-w-xl text-sm leading-relaxed text-stone">{text(content.settings.welcomeMessage, language)}</p>
              </section>
              <section className="mt-9">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-deepblue/75 dark:text-champagne">{language.startsWith('en') ? 'Hotel guide' : 'Guía del hotel'}</p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {content.sections.filter(section => section.isPublished).sort((a, b) => a.position - b.position).map(section => (
                    <button key={section.id} type="button" onClick={() => setSelected(section)} className="min-h-40 rounded-[1.45rem] border border-stone bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-champagne dark:border-white/10 dark:bg-white/5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-mist font-display text-xl text-deepblue dark:bg-champagne/15 dark:text-champagne">{section.icon}</span>
                      <span className="mt-5 block font-display text-2xl font-semibold leading-none">{text(section.title, language)}</span>
                      <span className="mt-2 block text-xs leading-relaxed text-steel dark:text-stone">{section.description && text(section.description, language)}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="mt-8">
              <button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-deepblue dark:text-champagne">← {language.startsWith('en') ? 'Back' : 'Volver'}</button>
              <div className="mt-5 rounded-[2rem] bg-[#123248] px-6 py-7 text-ivory shadow-luxury">
                <span className="text-2xl text-champagne">{selected.icon}</span>
                <h1 className="mt-3 font-display text-4xl font-semibold leading-none">{text(selected.title, language)}</h1>
                <p className="mt-3 text-sm text-stone">{selected.description && text(selected.description, language)}</p>
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(item => (
                  <button key={item.id} type="button" onClick={() => openItem(item)} className="flex w-full items-center gap-4 rounded-2xl border border-stone bg-white p-4 text-left shadow-sm transition hover:border-champagne dark:border-white/10 dark:bg-white/5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist font-display text-lg text-deepblue dark:bg-champagne/15 dark:text-champagne">{item.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{text(item.title, language)}</span>
                      {item.description && <span className="mt-1 block text-xs text-steel dark:text-stone">{text(item.description, language)}</span>}
                    </span>
                    <span className="text-champagne">↗</span>
                  </button>
                ))}
                {items.length === 0 && <p className="rounded-2xl bg-mist p-5 text-center text-sm text-steel dark:bg-white/5 col-span-full">{language.startsWith('en') ? 'No content available.' : 'No hay contenido disponible.'}</p>}
              </div>
            </section>
          )}
        </div>
        
        {document && (
          <div className="fixed inset-0 z-10 bg-ink/80 p-3">
            <div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white">
              <div className="flex items-center justify-between p-4">
                <span className="font-semibold text-ink">{text(document.title, language)}</span>
                <button type="button" onClick={() => setDocument(null)} className="rounded-full px-3 py-1 text-sm text-deepblue">Cerrar</button>
              </div>
              <iframe title={text(document.title, language)} src={document.targetUrl} className="min-h-0 flex-1 border-0" />
              <a className="p-4 text-center text-sm font-semibold text-deepblue" href={document.targetUrl} target="_blank" rel="noreferrer">Abrir documento en otra pestaña ↗</a>
            </div>
          </div>
        )}
      </main>
  )
}
