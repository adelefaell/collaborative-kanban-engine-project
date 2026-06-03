import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { boardApi } from "../api/boardApi"
import type { KanbanCard } from "../types"
import { BOARD_QUERY_KEY } from "./useBoard"

interface MoveCardParams {
  cardId: string
  targetColumnId: string
  // If forcing client's version after conflict
  isForcePush?: boolean
}

export function useMoveCard() {
  const queryClient = useQueryClient()

  return useMutation<
    KanbanCard,
    Error,
    MoveCardParams,
    { previousCards: KanbanCard[] | undefined }
  >({
    mutationFn: async ({ cardId, targetColumnId }) => {
      return boardApi.moveCard(cardId, targetColumnId)
    },

    onMutate: async ({ cardId, targetColumnId }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY })

      const previousCards =
        queryClient.getQueryData<KanbanCard[]>(BOARD_QUERY_KEY)

      if (previousCards) {
        const updatedCards = previousCards.map((card) => {
          if (card.id === cardId) {
            return {
              ...card,
              columnId: targetColumnId,
              state: { type: "pending" } as const,
              conflictData: undefined,
              serverColumnId: undefined,
            }
          }
          return card
        })

        // Maintain sort or just place at the bottom of the target column
        // Here, we update the cache immediately
        queryClient.setQueryData<KanbanCard[]>(BOARD_QUERY_KEY, updatedCards)
      }

      return { previousCards }
    },

    onSuccess: (_data, variables) => {
      queryClient.setQueryData<KanbanCard[]>(BOARD_QUERY_KEY, (old) => {
        if (!old) return []
        return old.map((card) => {
          if (card.id === variables.cardId) {
            return {
              ...card,
              columnId: variables.targetColumnId,
              state: { type: "idle" } as const,
              conflictData: undefined,
              serverColumnId: undefined,
            }
          }
          return card
        })
      })

      const cards = queryClient.getQueryData<KanbanCard[]>(BOARD_QUERY_KEY)
      const card = cards?.find((c) => c.id === variables.cardId)
      if (card && !variables.isForcePush) {
        toast.success("Move Saved", {
          description: `Card "${card.title}" successfully moved.`,
        })
      }
    },

    onError: (_err, variables, context) => {
      const oldCard = context?.previousCards?.find(
        (c) => c.id === variables.cardId,
      )
      const cardTitle = oldCard?.title || "Unknown Card"

      // Rollback to previous state
      if (context?.previousCards) {
        queryClient.setQueryData<KanbanCard[]>(
          BOARD_QUERY_KEY,
          context.previousCards,
        )
      }

      queryClient.setQueryData<KanbanCard[]>(BOARD_QUERY_KEY, (old) => {
        if (!old) return []
        return old.map((card) => {
          if (card.id === variables.cardId) {
            return {
              ...card,
              state: { type: "error" } as const,
            }
          }
          return card
        })
      })

      setTimeout(() => {
        queryClient.setQueryData<KanbanCard[]>(BOARD_QUERY_KEY, (old) => {
          if (!old) return []
          return old.map((card) => {
            if (card.id === variables.cardId && card.state.type === "error") {
              return { ...card, state: { type: "idle" } as const }
            }
            return card
          })
        })
      }, 3000)

      const toColumnName =
        variables.targetColumnId === "inprogress"
          ? "In Progress"
          : variables.targetColumnId === "todo"
            ? "Todo"
            : variables.targetColumnId === "review"
              ? "Review"
              : "Done"

      toast.error("Update Rejected", {
        description: `Card "${cardTitle}" could not be moved to ${toColumnName} because the server rejected the update.`,
      })
    },
  })
}
