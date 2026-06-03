import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { KanbanCard } from "~/types"

import { BOARD_QUERY_KEY } from "./useBoard"
import { useMoveCard } from "./useMoveCard"

export function useConflictResolver() {
  const queryClient = useQueryClient()
  const { mutate: moveCard } = useMoveCard()

  const keepClientVersion = (cardId: string, clientColumnId: string) => {
    moveCard({
      cardId,
      targetColumnId: clientColumnId,
      isForcePush: true,
    })

    toast.info("Conflict Resolved", {
      description: "Applied your version of the card.",
    })
  }

  const acceptServerVersion = (cardId: string, serverColumnId: string) => {
    queryClient.setQueryData<KanbanCard[]>(BOARD_QUERY_KEY, (old) => {
      if (!old) return []

      return old.map((card) => {
        if (card.id === cardId) {
          return {
            ...card,
            columnId: serverColumnId,
            state: { type: "idle" } as const,
            conflictData: undefined,
            serverColumnId: undefined,
          }
        }
        return card
      })
    })

    toast.info("Conflict Resolved", {
      description: "Applied server version of the card.",
    })
  }

  return {
    keepClientVersion,
    acceptServerVersion,
  }
}
