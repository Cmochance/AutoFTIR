import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HistoryItem {
  id: string
  fileName: string
  dataType: string
  createdAt: string
  style: string
  aiStatus: 'ok' | 'degraded'
  reportSummary: string
}

interface HistoryState {
  items: HistoryItem[]
  addItem: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void
  deleteItem: (id: string) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              createdAt: new Date().toISOString(),
              ...item,
            },
            ...state.items,
          ].slice(0, 100),
        })),
      deleteItem: (id) => set((state) => ({ items: state.items.filter((it) => it.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'scidata-history',
    },
  ),
)
