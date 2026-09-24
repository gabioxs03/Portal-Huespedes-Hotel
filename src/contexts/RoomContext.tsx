import { createContext, useContext, useMemo, type ReactNode } from 'react'

interface RoomContextValue {
  roomNumber: string | null
  isValidRoom: boolean
}

const RoomContext = createContext<RoomContextValue | undefined>(undefined)

const ROOM_NUMBER_PATTERN = /^\d{1,4}$/

function readRoomNumber(): string | null {
  const room = new URLSearchParams(window.location.search).get('room')?.trim()
  return room && ROOM_NUMBER_PATTERN.test(room) ? room : null
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const roomNumber = useMemo(readRoomNumber, [])
  const value = useMemo<RoomContextValue>(() => ({ roomNumber, isValidRoom: roomNumber !== null }), [roomNumber])

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoom(): RoomContextValue {
  const context = useContext(RoomContext)
  if (!context) throw new Error('useRoom debe utilizarse dentro de RoomProvider.')
  return context
}
