import { useEffect, useState } from "react"

import type { KanbanCard } from "../types"

interface ConflictModalProps {
  card: KanbanCard
  onResolveClient: () => void
  onResolveServer: () => void
}

export function ConflictModal({
  card,
  onResolveClient,
  onResolveServer,
}: ConflictModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(8)

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onResolveServer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onResolveServer])

  if (!card.conflictData) return null

  const { yourMove, serverMove } = card.conflictData

  const getColName = (id: string) => {
    const names: Record<string, string> = {
      todo: "Todo",
      inprogress: "In Progress",
      review: "Review",
      done: "Done",
    }
    return names[id] || id
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded shadow-xl overflow-hidden">
        <div className="bg-amber-900/10 border-b border-slate-800 p-5">
          <h3 className="text-base font-bold text-slate-100">
            Concurrent Edit Conflict Detected
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Another collaborator moved Card: {card.title} (ID: {card.id})
          </p>
        </div>

        <div className="p-5 border-b border-slate-800 text-xs text-slate-400">
          {card.description}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-950">
          <div className="flex flex-col justify-between p-4 rounded border border-slate-800 bg-slate-900">
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">
                Your Version
              </div>
              <div className="text-xs text-slate-400 mb-4">
                Move from{" "}
                <span className="font-mono text-slate-300">
                  {getColName(yourMove.from)}
                </span>{" "}
                to{" "}
                <span className="font-mono text-white font-semibold">
                  {getColName(yourMove.to)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onResolveClient}
              className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Keep My Move
            </button>
          </div>

          <div className="flex flex-col justify-between p-4 rounded border border-slate-800 bg-slate-900">
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">
                Server Version
              </div>
              <div className="text-xs text-slate-400 mb-4">
                Move from{" "}
                <span className="font-mono text-slate-300">
                  {getColName(serverMove.from)}
                </span>{" "}
                to{" "}
                <span className="font-mono text-white font-semibold">
                  {getColName(serverMove.to)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onResolveServer}
              className="w-full py-2 px-3 rounded bg-slate-850 border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium text-xs transition-colors"
            >
              Accept Server Move
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Auto resolving in{" "}
            <strong className="text-white">{secondsLeft}s</strong> (will keep
            Server Version)
          </span>

          <div className="w-32 bg-slate-800 h-1.5 rounded overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / 8) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
