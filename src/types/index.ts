export type CardState =
  | { type: "idle" }
  | { type: "dragging" } // this state is not used cuz dragging is handled by the dnd-kit
  | { type: "pending" }
  | { type: "conflict" }
  | { type: "error" }

export interface KanbanCard {
  id: string
  title: string
  description: string
  columnId: string
  order: number
  state: CardState
  // Store the server's proposed column to allow conflict resolution
  serverColumnId?: string
  conflictData?: {
    yourMove: { from: string; to: string }
    serverMove: { from: string; to: string }
  }
}

export interface KanbanColumn {
  id: string
  title: string
}

export interface BoardState {
  cards: KanbanCard[]
}
