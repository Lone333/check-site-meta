"use client"

import { cn } from "lazy-cn"
import { useState, type ComponentProps } from "react"

export function ExpandableErrorStack({ stack, ...props }: { stack: string } & ComponentProps<"div">) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div {...props} className={cn("text-sm", props.className)}>
      <button onClick={() => setExpanded(!expanded)} className="text-blue-500 font-medium">Show Error Stack </button>
      <div className="grid grid-rows-[0fr] opened:grid-rows-[1fr] transition-[grid-template-rows] duration-300 overflow-hidden" data-opened={expanded ? "" : undefined}>
        <div className="min-h-0">
          <pre className="text-xs card p-3 bg-background mt-2">{stack}</pre>
        </div>
      </div>
    </div>
  )
}