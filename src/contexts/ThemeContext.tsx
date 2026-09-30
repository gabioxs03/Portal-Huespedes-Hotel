import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextValue { 
  portalTheme: Theme
  adminTheme: Theme
  togglePortalTheme: () => void 
  toggleAdminTheme: () => void 
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const PORTAL_THEME_KEY = 'hotel-aura-portal-theme'
const ADMIN_THEME_KEY = 'hotel-aura-admin-theme'

function getInitialTheme(key: string): Theme {
  const savedTheme = localStorage.getItem(key)
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [portalTheme, setPortalTheme] = useState<Theme>(() => getInitialTheme(PORTAL_THEME_KEY))
  const [adminTheme, setAdminTheme] = useState<Theme>(() => getInitialTheme(ADMIN_THEME_KEY))

  useEffect(() => {
    localStorage.setItem(PORTAL_THEME_KEY, portalTheme)
  }, [portalTheme])

  useEffect(() => {
    localStorage.setItem(ADMIN_THEME_KEY, adminTheme)
  }, [adminTheme])

  const value = useMemo<ThemeContextValue>(() => ({ 
    portalTheme, 
    adminTheme,
    togglePortalTheme: () => setPortalTheme(current => current === 'light' ? 'dark' : 'light'),
    toggleAdminTheme: () => setAdminTheme(current => current === 'light' ? 'dark' : 'light')
  }), [portalTheme, adminTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme debe utilizarse dentro de ThemeProvider.')
  return context
}
