import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionCard } from '../components/ActionCard'
import { useRoom } from '../contexts/RoomContext'
import { useTheme } from '../contexts/ThemeContext'

const actions = [
  { key: 'services', icon: '✦', featured: true }, { key: 'gastronomy', icon: '⌘' },
  { key: 'contacts', icon: '◌' }, { key: 'information', icon: 'i' },
  { key: 'social', icon: '◎' }, { key: 'casino', icon: '♢' },
  { key: 'parking', icon: '⌁' }, { key: 'wifi', icon: '◒' }
] as const

export function HomePage() {
  const { t, i18n } = useTranslation()
  const { roomNumber, isValidRoom } = useRoom()
  const { portalTheme: theme, togglePortalTheme: toggleTheme } = useTheme()
  const [selectedAction, setSelectedAction] = useState('services')
  const switchLanguage = () => { void i18n.changeLanguage(i18n.resolvedLanguage?.startsWith('es') ? 'en' : 'es') }
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0D1D2A' : '#F7F5F0')
  }, [theme])

  return <main className="min-h-screen bg-ivory text-ink transition-colors duration-300 dark:bg-[#0D1D2A] dark:text-ivory"><div className="mx-auto max-w-md px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
    <header className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-champagne/70 bg-ink font-display text-xl font-semibold text-champagne shadow-sm dark:bg-champagne dark:text-ink">S</span><span className="font-display text-2xl font-semibold tracking-tight">{t('brand')}</span></div><div className="flex items-center gap-2"><button type="button" onClick={toggleTheme} aria-label={t(`theme.${theme === 'light' ? 'dark' : 'light'}`)} className="grid h-9 w-9 place-items-center rounded-full border border-stone bg-white text-deepblue transition hover:border-champagne dark:border-white/15 dark:bg-white/5 dark:text-champagne">{theme === 'light' ? '☾' : '☀'}</button><button type="button" onClick={switchLanguage} className="rounded-full border border-stone bg-white px-3 py-2 text-xs font-bold tracking-wide text-deepblue transition hover:border-champagne dark:border-white/15 dark:bg-white/5 dark:text-ivory" aria-label={t('language')}>{t('language')}</button></div></header>
    <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#123248] px-6 py-8 text-ivory shadow-luxury"><div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-champagne/35" /><div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-champagne/10" /><div className="absolute bottom-0 left-6 h-px w-20 bg-champagne/70" /><p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-champagne">{t('home.eyebrow')}</p>{isValidRoom ? <><h1 className="relative mt-3 max-w-72 font-display text-[2.55rem] font-semibold leading-[0.9]">{t('home.welcome', { room: roomNumber })}</h1><div className="relative mt-7 flex items-center gap-3 text-xs text-stone"><span className="h-px w-8 bg-champagne" />Private guest portal</div></> : <><h1 className="relative mt-3 font-display text-4xl font-semibold leading-none">{t('home.invalidRoom')}</h1><p className="relative mt-4 text-sm leading-relaxed text-stone">{t('home.invalidRoomDescription')}</p></>}</section>
    {isValidRoom && <section className="mt-9"><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-deepblue/75 dark:text-champagne">{t('home.quickAccess')}</p><h2 className="mt-2 max-w-80 font-display text-3xl font-semibold leading-[1.05]">{t('home.intro')}</h2><div className="mt-6 grid grid-cols-2 gap-3">{actions.map(action => <ActionCard key={action.key} icon={action.icon} selected={selectedAction === action.key} label={t(`actions.${action.key}`)} description={t(`actionDescriptions.${action.key}`)} onClick={() => setSelectedAction(action.key)} />)}</div></section>}
  </div></main>
}
