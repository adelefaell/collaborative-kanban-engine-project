type EventMap = {
  "simulate-conflict": undefined
}

class SimpleEmitter<TEvents extends Record<string, unknown>> {
  private listeners: {
    [K in keyof TEvents]?: Array<(payload: TEvents[K]) => void>
  } = {}

  on<K extends keyof TEvents>(
    event: K,
    listener: TEvents[K] extends undefined
      ? () => void
      : (payload: TEvents[K]) => void,
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event]?.push(listener)

    return () => this.off(event, listener)
  }

  off<K extends keyof TEvents>(
    event: K,
    listener: Function,
  ) {
    const listeners = this.listeners[event]
    if (!listeners) return

    this.listeners[event] = listeners.filter((l) => l !== listener)
  }

  emit<K extends keyof TEvents>(
    event: K,
    ...args: TEvents[K] extends undefined ? [] : [TEvents[K]]
  ) {
    const listeners = this.listeners[event]
    if (!listeners) return

    const copy = [...listeners]

    for (const listener of copy) {
      try {
        listener(...args)
      } catch (err) {
        console.error(`Error in event listener for ${String(event)}:`, err)
      }
    }
  }
}

export const emitter = new SimpleEmitter<EventMap>()