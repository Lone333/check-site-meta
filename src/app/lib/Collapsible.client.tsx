"use client"

import { cn } from "lazy-cn"
import { useState, type ComponentProps, type CSSProperties, type ReactNode, type SVGProps } from "react"
import { CollapsibleRow } from "./Collapsible"

export function useExpandableList(arr: unknown[]) {
  const [expandedList, setExpandedList] = useState([...Array.from(arr, () => true)])
  const isExpanded = (index: number) => expandedList[index]
  const toggaleExpanse = (index: number) => {
    setExpandedList((prev) => {
      const copy = [...prev]
      copy[index] = !copy[index]
      return copy
    })
  }
  const expandAll = () => {
    setExpandedList([...Array.from(arr, () => true)])
  }
  const collapseAll = () => {
    setExpandedList([...Array.from(arr, () => false)])
  }

  return {
    isExpanded,
    toggaleExpanse,
    expandAll,
    collapseAll,
  }

}



export function ExpandableCard({ expanded, toggleExpanse, Label, Content, headerProps, ...props }: ComponentProps<"div"> & {
  expanded: boolean,
  toggleExpanse?: () => void,
  Label: ReactNode,
  Content: ReactNode,
  headerProps?: ComponentProps<"div">
}) {
  return (
    <div {...props} className={cn("border border-border rounded-md overflow-clip", props.className)}>
      <div {...headerProps} className={cn("bg-background flex", headerProps?.className)} >
        <button className="flex items-start gap-2 p-2 pl-3 grow leading-none"
          onClick={() => toggleExpanse?.()}
        >
          <MaterialSymbolsExpandMoreRounded className={cn("w-4 h-4 transition-all",
            expanded ? "rotate-180" : "rotate-0"
          )} />
          {Label}
        </button>
      </div>
      <CollapsibleRow data-opened={expanded}>
        {Content}
      </CollapsibleRow>
    </div>
  )
}

export function MaterialSymbolsExpandMoreRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 14.95q-.2 0-.375-.062t-.325-.213l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213T12 14.95"></path></svg>)
}