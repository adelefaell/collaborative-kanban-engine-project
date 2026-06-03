import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import React from "react"

import type { KanbanCard } from "../types"

interface CardProps {
  card: KanbanCard
  onOpenConflict: (card: KanbanCard) => void
  /** When true, renders a transparent ghost instead of the real card (used at drag origin) */
  ghost?: boolean
}

export const Card = React.memo(({ card, onOpenConflict, ghost }: CardProps) => {
  const { id, title, description, state } = card

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id,
      disabled:
        state.type === "pending" ||
        state.type === "conflict" ||
        state.type === "error",
    })

  //show a dim ghost placeholder while draggin
  if (isDragging && !ghost) {
    return (
      <div
        ref={setNodeRef}
        className="flex flex-col p-4 rounded border border-dashed border-slate-700 bg-slate-800/40 opacity-40 select-none min-h-22.5"
      />
    )
  }

  const style = ghost
    ? { transform: transform ? CSS.Translate.toString(transform) : undefined }
    : undefined

  let stateStyles =
    "border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-600"
  if (ghost) {
    stateStyles = "border-slate-600 bg-slate-800 shadow-xl cursor-grabbing"
  } else if (state.type === "pending") {
    stateStyles =
      "border-slate-700 bg-slate-800 opacity-50 border-dashed text-slate-400 pointer-events-none"
  } else if (state.type === "conflict") {
    stateStyles = "border-amber-600 bg-slate-800 cursor-pointer text-slate-200"
  } else if (state.type === "error") {
    stateStyles = "border-rose-600 bg-slate-800 text-slate-200"
  }

  return (
    <div
      ref={!ghost ? setNodeRef : undefined}
      style={style}
      className={`flex flex-col p-4 rounded border select-none ${stateStyles}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm leading-snug text-slate-100 line-clamp-2">
          {title}
        </h4>

        {!ghost && state.type === "idle" && (
          <div
            {...attributes}
            {...listeners}
            className="shrink-0 p-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing rounded"
            title="Drag to move"
          >
            ⠿
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-3">
        {description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/60 text-[10px] text-slate-500 font-mono">
        <span>{id}</span>

        {state.type === "pending" && (
          <span className="text-amber-400">saving…</span>
        )}

        {state.type === "conflict" && (
          <button
            type="button"
            onClick={() => onOpenConflict(card)}
            className="px-2 py-0.5 rounded border border-amber-700 bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 pointer-events-auto text-[10px]"
          >
            Resolve conflict
          </button>
        )}

        {state.type === "error" && (
          <span className="text-rose-400">sync error</span>
        )}
      </div>
    </div>
  )
})

Card.displayName = "Card"
