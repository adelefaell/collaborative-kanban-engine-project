import type { KanbanCard, KanbanColumn } from "../types"

export const COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "Todo" },
  { id: "inprogress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
]

const INITIAL_CARDS: KanbanCard[] = [
  {
    id: "card-1",
    title: "Implement optimistic updates",
    description: "Ensure drag motions respond with 0ms visual latency.",
    columnId: "todo",
    order: 0,
    state: { type: "idle" },
  },
  {
    id: "card-2",
    title: "Setup TanStack Query",
    description:
      "Configure QueryClientProvider and fetch board state without useEffect.",
    columnId: "todo",
    order: 1,
    state: { type: "idle" },
  },
  {
    id: "card-3",
    title: "Handle concurrent conflicts",
    description:
      "Implement a modal allowing user to resolve client vs server position discrepancies.",
    columnId: "inprogress",
    order: 0,
    state: { type: "idle" },
  },
  {
    id: "card-4",
    title: "Design premium glassmorphic UI",
    description:
      "Make the board visually stunning with neon colors, dark theme, and rich animations.",
    columnId: "inprogress",
    order: 1,
    state: { type: "idle" },
  },
  {
    id: "card-5",
    title: "Add performance benchmark suite",
    description: "Support rendering 2000 cards with buttery smooth dragging.",
    columnId: "review",
    order: 0,
    state: { type: "idle" },
  },
  {
    id: "card-6",
    title: "Write documentation",
    description:
      "Explain optimistic updates, conflict resolution, and trade-offs in README.",
    columnId: "done",
    order: 0,
    state: { type: "idle" },
  },
]

const STORAGE_KEY = "kanban_board_cards"

// Simulation Settings
export interface SimulatorSettings {
  errorRate: number // 0 to 1 (default 0.20)
  minLatency: number // ms
  maxLatency: number // ms
  autoConflictEnabled: boolean
}

const DEFAULT_SETTINGS: SimulatorSettings = {
  errorRate: 0.2,
  minLatency: 600,
  maxLatency: 1200,
  autoConflictEnabled: false,
}

const SETTINGS_STORAGE_KEY = "kanban_simulator_settings"

export const getSettings = (): SimulatorSettings => {
  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // ignore
    }
  }
  return DEFAULT_SETTINGS
}

export const saveSettings = (settings: SimulatorSettings) => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export const getStoredCards = (): KanbanCard[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // ignore
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CARDS))
  return INITIAL_CARDS
}

export const saveStoredCards = (cards: KanbanCard[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export const generateBulkCards = (count: number = 2000): KanbanCard[] => {
  const columns = ["todo", "inprogress", "review", "done"]
  const bulkCards: KanbanCard[] = []

  const existing = getStoredCards().filter((c) => !c.id.startsWith("bulk-"))
  bulkCards.push(...existing)

  const startId = existing.length
  const cardsToGenerate = count - existing.length

  for (let i = 0; i < cardsToGenerate; i++) {
    const colId = columns[i % columns.length]
    const id = `bulk-${startId + i}`
    bulkCards.push({
      id,
      title: `Task #${startId + i} - Benchmark Item`,
      description: `Auto-generated card to test virtual rendering and @dnd-kit layout calculations under heavy load.`,
      columnId: colId,
      order: Math.floor(i / columns.length),
      state: { type: "idle" },
    })
  }

  saveStoredCards(bulkCards)
  return bulkCards
}

export const resetToDefaultCards = (): KanbanCard[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CARDS))
  return INITIAL_CARDS
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock API endpoints
export const boardApi = {
  fetchCards: async (): Promise<KanbanCard[]> => {
    const settings = getSettings()
    const latency =
      Math.floor(
        Math.random() * (settings.maxLatency - settings.minLatency + 1),
      ) + settings.minLatency
    await delay(latency)
    return getStoredCards()
  },

  moveCard: async (
    cardId: string,
    targetColumnId: string,
  ): Promise<KanbanCard> => {
    const settings = getSettings()
    const latency =
      Math.floor(
        Math.random() * (settings.maxLatency - settings.minLatency + 1),
      ) + settings.minLatency
    await delay(latency)

    if (Math.random() < settings.errorRate) {
      throw new Error(`Server failed to persist card move for card ${cardId}`)
    }

    const cards = getStoredCards()
    const cardIndex = cards.findIndex((c) => c.id === cardId)

    if (cardIndex === -1) {
      throw new Error("Card not found on server.")
    }

    const updatedCard = {
      ...cards[cardIndex],
      columnId: targetColumnId,
      state: { type: "idle" } as const,
    }

    cards[cardIndex] = updatedCard
    saveStoredCards(cards)

    return updatedCard
  },
}
