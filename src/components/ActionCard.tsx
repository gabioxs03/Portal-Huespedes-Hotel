import type { ReactNode } from 'react'

interface ActionCardProps { icon: ReactNode; label: string; description: string; selected?: boolean; onClick?: () => void }

export function ActionCard({ icon, label, description, selected = false, onClick }: ActionCardProps) {
  return <button type="button" onClick={onClick} aria-pressed={selected} className={`group relative flex min-h-44 flex-col items-start justify-between overflow-hidden rounded-3xl border p-5 text-left transition duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne ${selected ? 'border-[#1B4665] bg-[#1B4665] text-[#F7F5F0] shadow-luxury dark:border-champagne/45' : 'border-stone bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:border-champagne/70 dark:bg-[#16354A] dark:text-ivory'}`}>
    <span aria-hidden="true" className={`grid h-11 w-11 place-items-center rounded-2xl text-lg ${selected ? 'bg-champagne text-ink' : 'bg-mist text-deepblue dark:bg-white/10 dark:text-champagne'}`}>{icon}</span>
    <span><span className="block text-[15px] font-semibold leading-tight">{label}</span><span className={`mt-1.5 block text-xs leading-snug ${selected ? 'text-white/90' : 'text-deepblue/85 dark:text-stone'}`}>{description}</span></span>
    <span aria-hidden="true" className={`absolute right-5 top-5 text-lg transition-transform group-hover:translate-x-0.5 ${selected ? 'text-champagne' : 'text-deepblue dark:text-champagne'}`}>↗</span>
  </button>
}
