"use client"

import { px } from "@/app/lib/unit";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { TabList } from "./TabRoot";
import { useAppNavigation } from "@/app/lib/searchParams";

export function TabsWithContent
  (
    { id, tabs, children, className, ...props }: {
      id: string,
      tabs: { label: ReactNode, content?: ReactNode }[],
      // children?: { label: ReactNode, content?: ReactNode }[],
      className?: string,
    } & ComponentProps<'div'>
  ) {
  const navigation = useAppNavigation()
  const [tabNum, setTab] = useState<number>(() => parseInt(navigation.get(id) ?? '0') || 0)
  
  const { saveContentRect } = useTabsContentHeighTransition(id, tabNum)

  // const tabCache = useRef(tabs.map(t => t.content));
  // const currentContent = tabCache.current[tabNum] ?? tabs[tabNum].content
  const currentContent = tabs[tabNum].content

  return (
    <>
      <TabList
        id={id}
        className={className}
        tabNum={tabNum}
        onTabChange={(_, index) => {
          saveContentRect()
          setTab(index)
          // if (!tabCache.current[index]) {
          //   tabCache.current[index] = tabs[index].content; // Cache the tab content
          // }
          navigation.softNavigate(id, index.toString())
        }}
        tabs={tabs}
        {...props}
      />
      {/* {tabs.map((tab, index) => tab.content)} */}
      {currentContent}
    </>
  )
}


// Use ID because virtual dom can't update sibling nodes accurately.
function useTabsContentHeighTransition(
  id: string,
  tabNum: number
) {
  const contentRect = useRef({ height: null as number | null })

  useEffect(() => {
    const tabContainer = document.getElementById(id)
    if (!tabContainer) return
    if (contentRect.current.height === null) return
    const content = tabContainer.nextSibling as HTMLDivElement
    const prev = contentRect.current.height
    const contentFirstChild = content.firstChild as HTMLDivElement
    const curr = contentFirstChild?.scrollHeight
    const delta = curr - prev;

    contentFirstChild?.animate?.([{ marginBottom: px(-delta) }, {}], {
      duration: Math.abs(delta),
      easing: "ease-out",
      composite: "add",
    })
  }, [tabNum, id])

  function saveContentRect() {
    const tabContainer = document.getElementById(id)
    if (!tabContainer) return
    contentRect.current.height = (tabContainer.nextSibling as HTMLDivElement)?.getBoundingClientRect?.().height ?? null
  }

  return { saveContentRect }
}