"use client"

import { createContext, use, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GlobalContext = createContext<Record<string, any>>({})


/**
 * Local context provider which purpose is to "save" state between components without using global state management libraries.
 * It is like localStorage but without the need to store data in the browser.
 * It only persists data in memory.
 * 
 * Ref objects are mutable, so you can "save" the state in the ref object for it to be used in next "mount".
 * It does not reflect changes. It is like a snapshot of the state.
 * It's ability is only limited to "save" and "query". Not "react" to changes.
 */
export function LocalContextProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef({})
  return (
    <GlobalContext.Provider value={ref.current}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useStore = () => use(GlobalContext)

