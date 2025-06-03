"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { cn } from "lazy-cn"
import { recentSuggestionsLocal } from "@/app/lib/localstorage"
import { useAppNavigation } from "@/app/lib/searchParams"

export function RecentSuggestions(props: {
  hidden: boolean,
}) {
  const { hidden } = props
  const [recent, setRecent] = useState<string[] | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!props.hidden) setRecent(recentSuggestionsLocal.get())
    // console.log(props.hidden)
  }, [props.hidden])

  const onClear = () => {
    setIsDeleting(true)
    const recentContainer = document.getElementById('recentGrid') as HTMLDivElement
    const rect = recentContainer.getBoundingClientRect()
    const anim = recentContainer.animate([
      { height: `${ rect.height }px` },
      { height: '0px' },
    ], {
      fill: 'forwards',
      duration: 400,
      easing: 'ease-in-out',
    })
    anim.onfinish = () => {
      setRecent(recentSuggestionsLocal.clear())
      setIsDeleting(false)
      setTimeout(() => anim.cancel(), 10)
    }
  }

  const suggestionList = (recent ?? []).length < 5 ? suggestions : []

  // const INITIAL_DELAY = 500
  const INITIAL_DELAY = 0
  const INTERVAL = 75
  const CLOSING_INTERVAL = 20

  return (
    <div className={cn("transition-opacity opacity-0", recent !== null ? "opacity-100" : "")}>
      <div className="grid grid-rows-[1fr] closed:grid-rows-[0fr] group overflow-hidden transition-[grid-template-rows] duration-500" data-closed={((recent === null) || hidden) ? "" : undefined}>
        <div className={cn("min-h-0 min-w-0 transition-all duration-500 delay-200", hidden && "opacity-0 -translate-y-10")}>

          <div id="recentGrid" className="min-h-0 min-w-0 overflow-hidden">
            {
              !!recent?.length && (<>
                <div className={cn("mt-10 text-base text-foreground-muted pb-2 transition-all")}>
                  <div className="text-foreground-muted-3 fadeInFromLeft-0">
                    recent <button className="hover:underline text-[size:inherit] font-normal" onClick={onClear}>(clear)</button>
                  </div>
                </div>
                {recent?.map((url, i) => {
                  const transitionDelayMs = isDeleting
                    ? ((recent.length - i) * CLOSING_INTERVAL)
                    : hidden ? ((recent.length - i + suggestionList.length + 1) * CLOSING_INTERVAL) : (i * INTERVAL + INITIAL_DELAY)
                  return (
                    <SuggestionGoToUrlButton key={i} value={url}
                      className={cn(
                        "fadeInFromLeft-0 transition-[opacity,_translate,_color]! flex z-50",
                        (hidden || isDeleting) && "opacity-0 -translate-x-10"
                      )}
                      style={{
                        animationDelay: `${ i * INTERVAL + INITIAL_DELAY }ms`,
                        transitionDelay: `${ transitionDelayMs }ms, ${ transitionDelayMs }ms, 0ms`
                      }}
                    />
                  )
                })}
              </>)
            }
          </div>
          {
            !!suggestionList.length && <>
              <div className={cn("mt-10 text-base text-foreground-muted pb-2 transition-[asdf]")}>
                <div className="text-foreground-muted-3 fadeInFromLeft-200">suggested</div>
              </div>

              {suggestionList.map((url, i) => {
                const transitionDelayMs = hidden ? ((suggestionList.length - i) * CLOSING_INTERVAL) : ((i + 1 + (recent?.length ?? 0)) * INTERVAL + INITIAL_DELAY)
                return (
                  <SuggestionGoToUrlButton key={i} value={url}
                    className={cn(
                      "fadeInFromLeft-0 transition-[opacity,_translate] z-50",
                      hidden && "opacity-0 -translate-x-10"
                    )}
                    style={{
                      animationDelay: `${ (i + (recent?.length ?? 0)) * INTERVAL + INITIAL_DELAY }ms`,
                      transitionDelay: `${ transitionDelayMs }ms, ${ transitionDelayMs }ms, 0ms`
                    }}
                  />
                )
              })}
            </>
          }
        </div>
      </div>
    </div>
  )
}


const suggestions = [
  'localhost:3000',
  'localhost:8080',
  'notion.so',
  'vercel.com',
  'linear.app',
]


function SuggestionGoToUrlButton({ value, className, ...props }: ComponentProps<"button"> & {
  value: string,
}) {
  const nav = useAppNavigation()

  return (
    <button {...props}
      onClick={() => nav.navigate('url', value)}
      className={cn("min-w-0 flex text-start break-all py-1.5 text-foreground-muted/80 hover:text-foreground font-medium max-w-full", className)}
    >
      <div className="text-nowrap overflow-ellipsis overflow-hidden">{value}</div>
      <div className="font-mono shrink-0 pl-1 text-[0.5rem] self-center">{'->'}</div>
    </button>
  )
}