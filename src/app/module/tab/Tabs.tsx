"use client"

import { px } from "@/app/lib/unit";
import { createContext, use, useEffect, useRef, useState, type ComponentProps, type JSX, type ReactElement, type ReactNode, type RefObject } from "react";
import { TabList } from "./TabRoot";
import { useAppNavigation } from "@/app/lib/searchParams";


const TabsContentContext = createContext(null as ReactNode)

export function TabsWithContent
  (
    { id, tabs, children, className, ...props }: {
      id: string,
      tabs: { label: ReactNode, content?: ReactNode }[],
      className?: string,
      children?: ReactNode
    } & Omit<ComponentProps<'div'>, 'children'>
  ) {
  const navigation = useAppNavigation()
  const [tabNum, setTab] = useState(() => parseInt(navigation.get(id) ?? '0') || 0)
  const currentContent = tabs[tabNum].content

  const ref = useRef<HTMLDivElement>(null)
  const { triggerHeightChange } = useContentHeightAnimation(
    // When will the content height change?
    [tabNum],

    // How to get the content ref?
    () => ref.current?.nextElementSibling,

    // Callback when the state changes.
    (id: string, index: number) => {
      setTab(index)
      navigation.softNavigate(id, index.toString())
    }
  )

  return (
    <>
      <TabList
        id={id}
        ref={ref}
        className={className}
        tabNum={tabNum}
        onTabChange={(_, index) => triggerHeightChange(id, index)}
        tabs={tabs}
        {...props}
      />
      <TabsContentContext value={currentContent}>
        {children}
      </TabsContentContext>
    </>
  )
}

export function TabContent() {
  const content = use(TabsContentContext)
  return <>{content}</>
}


function useContentHeightAnimation<T extends any[]>(
  deps: any[],
  ref:
    RefObject<HTMLDivElement>
    | (() => Element | null | undefined), // Handled in getContentRef
  onStateChange?: (...args: T) => any
) {
  const contentRect = useRef({ height: null as number | null })

  // Allows targetin content height using direct ref or relative ref.
  // - direct ref:   ref = useRef() type shit
  // - relative ref: ref = () => ref.current.nextSiblingElement type shit
  const getContentRef = () => (typeof ref === 'function' ? ref() : ref.current);

  useEffect(() => {
    const content = getContentRef()
    if (!content) return
    const contentLastElement = content.lastElementChild as HTMLDivElement | null
    if (!contentLastElement) return
    const prev = contentRect.current.height ?? 0
    const curr = content.getBoundingClientRect?.().height ?? null
    const delta = curr - prev;

    contentLastElement.animate?.([{ marginBottom: px(-delta) }, {}], {
      duration: Math.abs(delta),
      easing: "ease-out",
      composite: "add",
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const saveContentHeight = () => {
    const content = getContentRef()
    if (!content) return
    contentRect.current.height = content.getBoundingClientRect?.().height ?? null
  }

  function triggerHeightChange(...args: T) {
    saveContentHeight()
    if (onStateChange) {
      onStateChange(...args)
    }
  }

  return { saveContentHeight, triggerHeightChange }
}