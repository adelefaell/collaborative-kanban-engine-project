import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { useMemo, useState } from "react"

import { useConflictResolver } from "~/hooks/useConflictResolver"

import { COLUMNS } from "../api/boardApi"
import { useBoard } from "../hooks/useBoard"
import { useConflictEvents } from "../hooks/useConflictEvents"
import { useMoveCard } from "../hooks/useMoveCard"
import { Card } from "./Card"
import { Column } from "./Column"
import { ConflictModal } from "./ConflictModal"

export function Board() {
  useConflictEvents()

  const { cards, isLoading, error } = useBoard()
  const { mutate: moveCard } = useMoveCard()
  const { keepClientVersion, acceptServerVersion } = useConflictResolver()
  useConflictEvents()

  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const todoCards = useMemo(
    () => cards.filter((c) => c.columnId === "todo"),
    [cards],
  )
  const inprogressCards = useMemo(
    () => cards.filter((c) => c.columnId === "inprogress"),
    [cards],
  )
  const reviewCards = useMemo(
    () => cards.filter((c) => c.columnId === "review"),
    [cards],
  )
  const doneCards = useMemo(
    () => cards.filter((c) => c.columnId === "done"),
    [cards],
  )

  const conflictCard = useMemo(
    () => cards.find((c) => c.state.type === "conflict"),
    [cards],
  )

  const activeCard = useMemo(
    () => (activeCardId ? cards.find((c) => c.id === activeCardId) : null),
    [activeCardId, cards],
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCardId(null)

    if (!over) return

    const cardId = active.id as string
    const targetColumnId = over.id as string

    const card = cards.find((c) => c.id === cardId)
    if (!card) return

    if (card.columnId !== targetColumnId) {
      setTimeout(() => {
        moveCard({ cardId, targetColumnId })
      }, 0)
    }
  }

  const handleDragCancel = () => {
    setActiveCardId(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-3">
        <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading board…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-3 text-center p-6">
        <p className="text-base font-semibold text-slate-200">
          Failed to load board
        </p>
        <p className="text-sm text-slate-400 max-w-md">{error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => {
            const columnCards =
              col.id === "todo"
                ? todoCards
                : col.id === "inprogress"
                  ? inprogressCards
                  : col.id === "review"
                    ? reviewCards
                    : doneCards

            return (
              <Column
                key={col.id}
                column={col}
                cards={columnCards}
                onOpenConflict={(c) => keepClientVersion(c.id, c.columnId)}
              />
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div className="w-67.5 rotate-1 opacity-95">
              <Card card={activeCard} onOpenConflict={() => {}} ghost />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {conflictCard && (
        <ConflictModal
          card={conflictCard}
          onResolveClient={() =>
            keepClientVersion(conflictCard.id, conflictCard.columnId)
          }
          onResolveServer={() => {
            if (conflictCard.serverColumnId) {
              acceptServerVersion(conflictCard.id, conflictCard.serverColumnId)
            }
          }}
        />
      )}
    </div>
  )
}
