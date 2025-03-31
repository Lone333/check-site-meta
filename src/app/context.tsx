"use client"

import { createContext, use, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GlobalContext = createContext<Record<string, any>>({})

export function LocalContextProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef({})
  return (
    <GlobalContext.Provider value={ref.current}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useStore = () => use(GlobalContext)

