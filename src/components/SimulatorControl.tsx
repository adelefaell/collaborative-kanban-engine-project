import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  generateBulkCards,
  getSettings,
  resetToDefaultCards,
  saveSettings,
} from "../api/boardApi"
import { useBoard, useTriggerConflict } from "../hooks/useBoard"

export function SimulatorControl() {
  const queryClient = useQueryClient()
  const { data: cards = [] } = useBoard()

  const triggerConflict = useTriggerConflict()

  const [errorRate, setErrorRate] = useState(20)
  const [latency, setLatency] = useState(600)

  useEffect(() => {
    const s = getSettings()
    setErrorRate(Math.round(s.errorRate * 100))
    setLatency(s.minLatency)
  }, [])

  const persist = (err: number, lat: number) => {
    saveSettings({
      errorRate: err / 100,
      minLatency: lat,
      maxLatency: lat,
      autoConflictEnabled: false,
    })
  }

  const handleSlider = (type: "error" | "latency", val: number) => {
    if (type === "error") {
      setErrorRate(val)
      persist(val, latency)
    } else {
      setLatency(val)
      persist(errorRate, val)
    }
  }

  const handleLoadBulk = () => {
    generateBulkCards(2000)
    queryClient.invalidateQueries()
    toast.info("2,000 tasks loaded", {
      description: "Drag cards to test performance.",
    })
  }

  const handleReset = () => {
    resetToDefaultCards()
    queryClient.invalidateQueries()
    toast.success("Board reset", {
      description: "Restored default tasks.",
    })
  }

  const total = cards.length
  const pending = cards.filter((c) => c.state.type === "pending").length
  const conflicts = cards.filter((c) => c.state.type === "conflict").length

  return (
    <div className="w-full border border-slate-800 rounded bg-slate-800/30 p-4">
      <div className="flex flex-wrap gap-6 items-start">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Board state
          </p>
          <div className="text-xs font-mono text-slate-300 space-y-0.5">
            <div className="flex gap-3">
              <span className="text-slate-500">Cards</span>
              <span>{total}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500">Saving</span>
              <span className={pending > 0 ? "text-amber-400" : ""}>
                {pending}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500">Conflicts</span>
              <span className={conflicts > 0 ? "text-amber-500" : ""}>
                {conflicts}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-45 space-y-2">
          <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Latency — {latency}ms
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-8 shrink-0">Delay</span>
            <input
              type="range"
              min="100"
              max="3000"
              step="100"
              value={latency}
              onChange={(e) => handleSlider("latency", Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 min-w-45 space-y-2">
          <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Fail rate — <span className="text-rose-400">{errorRate}%</span>
          </p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={errorRate}
            onChange={(e) => handleSlider("error", Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-35">
          <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Actions
          </p>
          <button
            type="button"
            onClick={triggerConflict}
            className="px-3 py-1.5 text-xs rounded bg-amber-700/30 border border-amber-700/60 text-amber-300 hover:bg-amber-700/50 font-medium"
          >
            Trigger conflict
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleLoadBulk}
              className="flex-1 px-2 py-1.5 text-xs rounded bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 font-medium"
            >
              Load 2k
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-2 py-1.5 text-xs rounded bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
