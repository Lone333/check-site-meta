/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { cn } from "lazy-cn"
import { useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode, type SVGProps } from "react"
import { CollapsibleRow } from "./Collapsible"
import { px } from "./unit"

export function useExpandableList(arr: boolean[], opts?: {
  onChange?: (arr: boolean[]) => void
  // onToggle?: (index: number, arr: boolean[]) => void
  // onExpandAll?: (arr: boolean[]) => void
  // onCollapseAll?: (arr: boolean[]) => void
}) {
  const [expandedList, setExpandedList] = useState([...Array.from(arr)])
  const isExpanded = (index: number) => expandedList[index]
  const toggaleExpanse = (index: number) => {
    setExpandedList((prev) => {
      const copy = [...prev]
      copy[index] = !copy[index]
      opts?.onChange?.(copy)
      // opts?.onToggle?.(index, copy)
      return copy
    })
  }
  const expandAll = () => {
    const newArr = [...Array.from(arr, () => true)]
    setExpandedList(newArr)
    opts?.onChange?.(newArr)
    // opts?.onExpandAll?.(newArr)
  }
  const collapseAll = () => {
    const newArr = [...Array.from(arr, () => false)]
    setExpandedList(newArr)
    opts?.onChange?.(newArr)
    // opts?.onCollapseAll?.(newArr)
  }

  return {
    isExpanded,
    toggaleExpanse,
    expandAll,
    collapseAll,
  }

}

export function ExpandableAdvancedCard({ expanded, toggleExpanse, Label, Content, headerProps, zIndex, className, ...props }: ComponentProps<"div"> & {
  expanded?: boolean,
  toggleExpanse?: () => void,
  Label: ReactNode,
  Content: ReactNode,
  headerProps?: ComponentProps<"div">,
  zIndex?: number,
}) {
  const [opened, setOpened] = useState(expanded ?? false)

  const isExpanded = expanded ?? opened
  const toggleOpen = () => (expanded !== undefined) ? toggleExpanse?.() ?? setOpened(!opened) : setOpened(!opened)

  return (
    <div className="grow">
      <div {...props} className={cn(className)}>
        <div {...headerProps} className={cn("flex sticky top-(--header-offset)", headerProps?.className)} style={{ zIndex }}>
          <div className="bg-(--bg) grow pt-2 min-w-0">
            <div className="border-x border-t border-border bg-background-card rounded-t-md">

              {/* Button have py which will be overlapped by Bottom Rounded Piece */}
              <button className={cn(
                "flex items-start gap-2 py-2 pl-3 grow min-w-0 w-full text-nowrap overflow-clip",
                "text-foreground-muted font-medium"
              )}
                onClick={() => toggleOpen()}
              >
                <MaterialSymbolsExpandMoreRounded className={cn("w-4 h-4 transition-all shrink-0",
                  isExpanded ? "rotate-180" : "rotate-0"
                )} />
                {Label}
              </button>

            </div>
          </div>
        </div>


        {/* Wrapper to pass background color to child */}
        <div className="border-x  border-border overflow-clip bg-(--bg)"
          style={{
            "--bg": "var(--color-background)",
          }}
        >
          <CollapsibleRow data-opened={isExpanded}>
            <div className="pb-2">
              {Content}
            </div>
          </CollapsibleRow>
        </div>
      </div>

      {/* Bottom Rounded Piece | -mt-2 is required to overlap parent | relative zIndex is required to overlap top piece*/}
      <div className="relative bg-(--bg)" /** This is required to match background color that overlaps top piece */
        style={{ zIndex }}>
        <div className="h-2 grow rounded-b-md border-b border-x border-border -mt-2 transition-[background]"
          style={{
            background: isExpanded ? "var(--color-background)" : "var(--color-background-card)",
          }}
        />
      </div>
    </div>

  )
}

export function MaterialSymbolsExpandMoreRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 14.95q-.2 0-.375-.062t-.325-.213l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213T12 14.95"></path></svg>)
}

export function useContentHeighTransition(
  deps: any[],
) {
  const targetRef = useRef<HTMLElement | null>(null)
  const contentRect = useRef({ height: null as number | null })

  useEffect(() => {
    if (!targetRef.current) return
    const content = targetRef.current
    const prev = contentRect.current.height
    const curr = content.clientHeight
    if (!prev) return
    const delta = curr - prev
    if (delta === 0) return
    content.animate([{ marginBottom: px(-delta) }, {}], {
      duration: 300,
      easing: 'ease-out',
      fill: 'both',
    })
    


  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  function saveContentRect() {
    if (!targetRef.current) return
    contentRect.current.height = targetRef.current.clientHeight
  }

  return {
    targetRef,
    saveContentRect,
  }

}