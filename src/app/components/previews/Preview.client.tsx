"use client"

import { useAppNavigation } from "@/app/lib/searchParams"
import { TabList } from "@/app/module/tab/TabRoot"
import { cn } from "lazy-cn"
import { useSearchParams } from "next/navigation"
import { useEffect, type ComponentProps, type CSSProperties, type ReactNode } from "react"

export function PreviewFrame(
  { className, themes, themeId, ...props }: ComponentProps<"div"> & {
    themeId: string,
    themes?: Record<string, CSSProperties> & { "default": CSSProperties }
  }
) {
  const sp = useSearchParams()
  const themeKey = sp.get(themeId)

  const theme = (() => {
    if (!themes) return props.style
    if (!themeKey) return themes?.default
    if (themeKey in themes) return themes?.[themeKey]
    else return themes?.default
  })()

  return (<div {...props}
    className={cn(
      "bg-(--bg)",
      "text-(--fg)",
      "font-[family-name:var(--font)]",
      "w-full flex flex-col rounded-lg overflow-hidden p-8",
      "z-20",
      className
    )}
    style={{ ...theme, ...props.style }}
  />)
}

export function PreviewThemeSwitcher(props: {
  themeId: string,
  themes: { key: string, icon: ReactNode }[]
}) {
  const nav = useAppNavigation()
  const spTheme = props.themes?.findIndex((item) => item.key === nav.get(props.themeId)) ?? 0
  return (
    <TabList
      key={props.themeId}
      className="tab-item:p-1.5 tab-item:px-2 text-lg p-1"
      tabNum={spTheme < 0 ? 0 : spTheme}
      onTabChange={(tab, index) => {
        nav.softNavigate(props.themeId, props.themes?.[index]?.key)
      }}
      tabs={props.themes.map(({ key, icon }) => ({ label: icon }))}
    />
  )
}