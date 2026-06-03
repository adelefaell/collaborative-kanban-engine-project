import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "sonner"

import { Board } from "./components/Board"
import { SimulatorControl } from "./components/SimulatorControl"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">
              Collaborative Kanban Engine
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimistic updates - Rollbacks - Conflict resolution
            </p>
          </div>
        </header>

        <main className="flex-1 flex flex-col px-6 py-6 gap-5 max-w-350 w-full mx-auto">
          <SimulatorControl />
          <Board />
        </main>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster richColors position="top-center" theme="dark" duration={3000} />
    </QueryClientProvider>
  )
}

export default App
