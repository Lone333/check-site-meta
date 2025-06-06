"use client"

import { getVersion } from "@/app/lib/version"
import { cn } from "lazy-cn"
import { useEffect, useState, type ComponentProps } from "react"
import { FormButton, MaterialSymbolsCloseRounded } from "../inputs/InputForm"
import { isDev, isHosted } from "@/app/lib/env"


export function AppDescription({ closed, version, ...props}: ComponentProps<"section"> & { closed: boolean, version: string }) {

  const [ignored, setIgnored] = useState<null | boolean>(null)

  // TODO: Add a way to expand the description again, e.g. a button to reset the localStorage item.

  useEffect(() => {
    // Check if the user has closed the description before
    const closed = localStorage.getItem("app-description-closed")
    if (closed) {
      setIgnored(true)
    } else {
      setIgnored(false)
    }

    // Cleanup function to remove the event listener
    return () => {
      // No cleanup needed for this effect
    }
  }, [])

  // Handle close button click
  const handleClose = () => {
    setIgnored(true)
    localStorage.setItem("app-description-closed", "true")
  }

  const isClosed = ignored || closed || ignored === null || (!isHosted && !isDev)

  return (
    <section {...props} className={cn("grid-rows-animate-data-closed duration-700 group no-overflow-anchor fadeIn-0 self-stretch")}
      data-closed={isClosed ? "" : undefined}
    >
      <div className="min-h-0">
        <div className="pt-8 my-4 ">

          <div className="rounded-2xl h-60 bg-background-muted border border-foreground-muted-3/25 fcol-row/stretch overflow-hidden relative">
            {/* <FormButton className="absolute p-1 top-2 right-2 z-10" type="button" onClick={handleClose}>
              <MaterialSymbolsCloseRounded className="w-5 h-5" />
            </FormButton> */}

            {/* Window */}
            <div className="bg-background ml-15 mt-15 fcol-end rounded-tl-2xl border-t-[0.15rem] border-l-[0.15rem] border-foreground-muted-3/35 overflow-hidden shadow-2xl shadow-shadow">
              {/* Title Bar */}
              <div className="p-3 bg-background-muted-2 frow-between/center">
                <div className="frow-1.5">
                  <div className="size-3 rounded-full bg-foreground-muted-3/50" />
                  <div className="size-3 rounded-full bg-foreground-muted-3/50" />
                  <div className="size-3 rounded-full bg-foreground-muted-3/50" />
                </div>

                <div className="leading-0 font-bold text-[1rem] text-foreground-muted-3/75 pr-30">
                  Terminal – zsh
                </div>
              </div>
              <pre className="p-2 px-4 font-mono text-xl text-foreground-muted min-h-0 min-w-0 overflow-clip contain-inline-size">
                <span>~ % npx check-site-meta 3000</span>
                <br />
                <br />
                <span className="text-foreground-muted-3">
                  {`   - Check Site Meta ${ version }
   - Using Next.js 15.2.3
   - Local: http://localhost:3050
   - Starting... 🚀

 ✓ Ready in 340ms
 ? Do you want to open the browser? (Y/n) `}
                </span>
              </pre>
            </div>
          </div>
          <div className={cn("min-w-0 text-start py-1.5 text-foreground-muted/80 font-medium max-w-full text-pretty mt-1")}>
            Run locally for full and offline access — including localhost. Requires <a className="underline" target="_blank" href="https://nodejs.org/en/download">Node.js</a>.
            {/* <br /> */}
            {/* *Hosted version is available for quick checks and may not work properly. */}
          </div>
        </div>
      </div>
    </section>
  )
}