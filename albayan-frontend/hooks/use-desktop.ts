import * as React from "react"

const DESKTOP_BREAKPOINT = 1024

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function useIsDesktop() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches,
    () => false
  )
}