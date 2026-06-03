import { useQuery, useQueryClient } from "@tanstack/react-query"

import { boardApi } from "../api/boardApi"
import type { KanbanCard } from "../types"

export const BOARD_QUERY_KEY = ["board"] as const

export function useBoard() {
  const query = useQuery<KanbanCard[], Error>({
    queryKey: BOARD_QUERY_KEY,
    queryFn: boardApi.fetchCards,
    staleTime: Infinity, // Rely on mutations and simulated sync to update state
    refetchOnWindowFocus: false,
  })

  return {
    ...query,
    cards: query.data || [],
  }
}

export const CONFLICT_TRIGGER_KEY = ["conflict-trigger"] as const

export function useTriggerConflict() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.setQueryData(CONFLICT_TRIGGER_KEY, {
      ts: Date.now(),
    })
  }
}
