import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

import type { KanbanCard } from "../types"
import { BOARD_QUERY_KEY } from "./useBoard"

const CONFLICT_TRIGGER_KEY = ["conflict-trigger"] as const

export function useConflictEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const trigger = queryClient.getQueryData(CONFLICT_TRIGGER_KEY)

      if (!trigger) return

      // IMPORTANT: clear trigger so it behaves like an event
      queryClient.removeQueries({ queryKey: CONFLICT_TRIGGER_KEY })

      const cards = queryClient.getQueryData<KanbanCard[]>(BOARD_QUERY_KEY)
      if (!cards?.length) return

      const targetCard = cards.find(
        (c) => c.state.type !== "pending" && c.state.type !== "conflict",
      )

      if (!targetCard) return

      const columns = ["todo", "inprogress", "review", "done"]
      const clientCol = targetCard.columnId
      const serverCol = columns.find((c) => c !== clientCol)

      if (!serverCol) return

      queryClient.setQueryData<KanbanCard[]>(
        BOARD_QUERY_KEY,
        (old) =>
          old?.map((card) => {
            if (card.id !== targetCard.id) return card

            return {
              ...card,
              state: { type: "conflict" } as const,
              serverColumnId: serverCol,
              conflictData: {
                yourMove: {
                  from: "todo",
                  to: clientCol,
                },
                serverMove: {
                  from: "todo",
                  to: serverCol,
                },
              },
            }
          }) ?? [],
      )

      toast.warning("Conflict Event Triggered", {
        description: `Another user moved "${targetCard.title}" concurrently.`,
      })
    })

    return () => unsubscribe()
  }, [queryClient])
}
