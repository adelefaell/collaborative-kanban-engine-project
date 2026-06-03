import { useDroppable } from "@dnd-kit/core"
import React from "react"

import type { KanbanCard, KanbanColumn } from "../types"
import { Card } from "./Card"

interface ColumnProps {
  column: KanbanColumn
  cards: KanbanCard[]
  onOpenConflict: (card: KanbanCard) => void
}

export const Column = React.memo(
  ({ column, cards, onOpenConflict }: ColumnProps) => {
    const { id, title } = column

    const { setNodeRef, isOver } = useDroppable({
      id: id,
    })

    const columnBg = isOver
      ? "bg-slate-800 border-slate-700"
      : "bg-slate-850 border-slate-800"

    return (
      <div
        ref={setNodeRef}
        className={`flex flex-col w-full min-w-67.5 max-w-90 h-[calc(100vh-220px)] min-h-100 p-4 rounded border ${columnBg}`}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                id === "todo"
                  ? "bg-slate-400"
                  : id === "inprogress"
                    ? "bg-amber-400"
                    : id === "review"
                      ? "bg-blue-400"
                      : "bg-emerald-400"
              }`}
            />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              {title}
            </h3>
          </div>
          <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
            {cards.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 border border-dashed border-slate-800 rounded p-4 text-center">
              <span className="text-xs text-slate-500">No cards</span>
            </div>
          ) : (
            cards.map((card) => (
              <Card key={card.id} card={card} onOpenConflict={onOpenConflict} />
            ))
          )}
        </div>
      </div>
    )
  },
)

Column.displayName = "Column"
