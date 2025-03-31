"use client"

import { use, useEffect, useState, useTransition, type ComponentProps, type ReactNode, type SVGProps } from "react"
import { CollapsibleRow } from "@/app/lib/Collapsible"
import { ExpandableAdvancedCard } from "@/app/lib/Collapsible.client"
import { cn } from "lazy-cn"
import { getSitemapAction, type GetSitemapActionResponse } from "./Sitemap.action"
import { TabList } from "@/app/module/tab/TabRoot"
import { tab } from "@/app/module/tab/tab-primitives"
import { SourceHeader } from "./Sitemap"
import { TextInputCard, TextInputIconStart } from "../inputs/TextInput"
import { formatDate } from "@/app/lib/date"
import { SitemapUrlList } from "./SitemapUrl.client"
import { SitemapIndexList } from "./SitemapIndex.client"
import { HomeErrorCard, type ParsedError2 } from "@/app/module/error/ErrorCard"
import { useStore } from "@/app/context"
import { useSearchParams } from "next/navigation"

export function SitemapCategoryCollapsible(
  props: {
    header: ReactNode,
    children?: ReactNode,
  }
) {
  const [expanded, setExpanded] = useState(true)
  return (
    <>
      <SourceHeader onClick={() => setExpanded(!expanded)} data-opened={expanded ? "" : undefined} className="px-5 py-2 h-9 sticky top-0 rounded-none bg-background-card z-[1002]">
        {props.header}
      </SourceHeader>
      <CollapsibleRow data-opened={expanded} className="" style={{
        "--header-offset": `calc(var(--spacing) * ${ 9 })`, // 9 from header height, 1 from content padding
      }}>
        {props.children}
      </CollapsibleRow>
    </>
  )
}

function useSitemapStore(id: string) {
  const store = useStore()
  const globalSitemapStore = store['sitemap'] ??= {
    id: Math.random().toString(36).slice(2)
  }
  const sitemapStore = globalSitemapStore[id] ??= {
    id: Math.random().toString(36).slice(2)
  }

  return sitemapStore as {
    expanded?: boolean,
    sitemapData?: GetSitemapActionResponse
  }
}



export function SitemapFileCard(props: {
  id: string,
  fullUrl: string,
  title: string,
  lastModified?: string
  defaultClosed?: boolean
  headerProps?: ComponentProps<"div">
  depth?: number
  topOffset?: number
}) {
  const store = useSitemapStore(props.id)
  const [isExpanded, _setIsExpanded] = useState(store.expanded ?? false)
  const setIsExpanded = (expanded: boolean) => {
    store.expanded = expanded
    _setIsExpanded(expanded)
  }

  const [isPending, startTransition] = useTransition()
  const [sitemapData, setSitemapData] = useState<GetSitemapActionResponse>(store.sitemapData ?? undefined)
  const { urls: rawUrls, sitemaps: rawSitemaps } = sitemapData?.validated.res ?? { urls: [], sitemaps: [] }
  function fetchAndSetData() {
    setError(undefined)
    // setSitemapData(undefined)
    // store.sitemapData = undefined
    startTransition(async () => {
      const res = await getSitemapAction(props.fullUrl)
      startTransition(() => {
        if (res.data) {
          setSitemapData(res.data)
          store.sitemapData = res.data
          setError(undefined)
        }
        if (res.error) {
          setError(res.error)
        }
      })
    })
  }
  const [error, setError] = useState<ParsedError2>()


  // Messages
  const messages = sitemapData?.validated.messages ?? []
  const errors = sitemapData?.validated.messages.filter(a => a[0] === "error") ?? []
  const warns = sitemapData?.validated.messages.filter(a => a[0] === "warn") ?? []
  const infos = sitemapData?.validated.messages.filter(a => a[0] === "info") ?? []

  // Views
  const [isRaw, setIsRaw] = useState(false)

  // Content Render Control
  const [largeContentRendered, setLargeContentRendered] = useState(store.expanded ?? false)
  useEffect(() => {
    if (largeContentRendered) setIsExpanded(true)
  }, [largeContentRendered])
  
  useEffect(() => {
    if (!!sitemapData && isExpanded) setLargeContentRendered(true)
  }, [sitemapData])


  return <ExpandableAdvancedCard

    toggleExpanse={() => {
      if (!sitemapData && !isExpanded) {
        setIsExpanded(true)
        fetchAndSetData()
      }
      // If previously isExpanded is true, then set isExpanded to false | then ontransitionend, setLargeContentRendered to false to hide the content
      if (isExpanded) {
        setIsExpanded(false)
      } else {
        // If previously isExpanded is false, and data is already fetched, then setLargeContentRendered to true to show the content
        // But if data is not fetched, then fetch the data and setLargeContentRendered to true but use useEffect to setIsExpanded to true to delay the animation
        if (sitemapData) {
          setLargeContentRendered(true)
        }
      }
    }}

    expanded={isExpanded}

    // ZIndex has to be top to bottom (100 > 0) so that the parent-most will be on top. So that parent doesn't stay below of list of childrens.
    zIndex={100 - (10 + (props.depth ?? 0))}

    style={{
      '--header-offset': `calc((var(--spacing) * ${ 9 }) + (var(--spacing) * ${ props.topOffset ?? 0 }) + ${ props.topOffset ? "(var(--spacing) * 2)" : "0px" })`,
      // 
    }}

    onTransitionEnd={(e) => {
      if (e.target === e.currentTarget?.children[1]?.children[0]) {
        const collapsingElement = e.currentTarget?.children[1]?.children[0] as HTMLDivElement
        if ('opened' in collapsingElement.dataset === false) {
          setLargeContentRendered(false)
        }
      }
    }}

    Label={
      <div className={cn(
        "flex items-start gap-1 grow group text-start -my-2 py-2 h-8.5",
        props.lastModified ? "h-12" : "h-8.5",
      )}>
        <TdesignSitemap className="size-4 text-foreground-muted mt-0.25 shrink-0" />
        <div className="flex flex-col grow">
          <div className="flex">
            <div className={cn(
              "font-normal text-sm text-start break-word grow overflow-clip overflow-ellipsis",
              sitemapData
                ? "text-foreground"
                : "text-foreground-muted-2 italic",
            )}>
              {props.title}
            </div>
            <div
              role="button"
              onClick={e => {
                e.stopPropagation()
                fetchAndSetData()
              }}
              className="-my-1 p-1 opacity-0 group-hover:opacity-60 hover:opacity-100 shrink-0">
              <MaterialSymbolsRefresh className="size-4 text-foreground-muted mt-0.25" />
            </div>
            <div role="button"
              onClick={e => {
                e.stopPropagation()
                window.open(props.fullUrl, "_blank")
              }}
              className="-my-1 p-1 opacity-0 group-hover:opacity-60 hover:opacity-100 shrink-0">
              <RiExternalLinkLine className="size-4 text-foreground-muted mt-0.25 " />
            </div>
          </div>
          {props.lastModified && (
            <div className="text-xxs text-foreground-muted-2 font-normal">
              Last updated: {formatDate(props.lastModified, 'mediumDate')}
            </div>
          )}
        </div>

      </div>
    }
    Content={
      <div className="text-xs text-foreground-body flex flex-col text-start">

        <CollapsibleRow data-opened={!!error}>
          <HomeErrorCard error={error} />
        </CollapsibleRow>

        <CollapsibleRow data-opened={isPending && !sitemapData}>
          <div className="p-3 px-4 text-foreground-muted-2 italic animate-pulse">Fetching {props.fullUrl}...</div>
        </CollapsibleRow>

        <CollapsibleRow
          data-opened={!!sitemapData && !!largeContentRendered}
          className="opacity-0 opened:opacity-100">
          {largeContentRendered && (
            <div className="flex flex-col gap-2 py-2">
              <div className="flex gap-2 px-2 items-center text-xxs">
                <TabList
                  className="shrink-0 text-xxs p-1 tab-item:py-0 tab-item:items-center tab-item:flex tab-item:px-3.5 tab-card h-9"
                  tabNum={isRaw ? 1 : 0}
                  tabs={[tab("Table"), tab("Raw")]}
                  onTabChange={(l, i, e) => setIsRaw(i === 1)}
                />
                <CardDetailButton
                  className="h-7 px-3 button-card disabled:*:animate-spin"
                  disabled={isPending}
                  onClick={() => fetchAndSetData()}>
                  <MaterialSymbolsRefresh className="size-4" />
                </CardDetailButton>

                {/* Status Bar */}
                {sitemapData?.validated.isIndex
                  ?
                  <>
                    <div className="badge-violet px-3 py-1 rounded-full ">
                      Sitemap Index
                    </div>
                    <div className="badge-gray px-3 py-1 rounded-full ">
                      {sitemapData?.validated.res.sitemaps?.length ?? 0} Sitemaps
                    </div>
                  </>
                  :
                  <>
                    <div className="badge-teal px-3 py-1 rounded-full ">
                      Sitemap
                    </div>
                    <div className="badge-gray px-3 py-1 rounded-full ">
                      {sitemapData?.validated.res.urls?.length ?? 0} URLs
                    </div>
                  </>
                }
                {errors.length > 0 && (
                  <div className="text-red-400 px-1">
                    {errors.length} Errors
                  </div>
                )}
                {warns.length > 0 && (
                  <div className=" text-amber-500 px-1">
                    {warns.length} Warnings
                  </div>
                )}
                {infos.length > 0 && (
                  <div className="text-slate-500 px-1">
                    {warns.length} Infos
                  </div>
                )}
              </div>

              {/* Error Messages Goes Here */}
              {messages.length > 0 && (
                <div className="flex flex-col">
                  {messages.map((message, i) => {
                    if (message[0] === 'error') return <div key={i} className={cn("py-1.5 px-3 bg-red-500/10 text-red-400/80 flex items-center gap-1")}><MaterialSymbolsErrorRounded /> {message[1]}</div>
                    if (message[0] === 'warn') return <div key={i} className={cn("py-1.5 px-3 bg-amber-500/10 text-amber-400/80 flex items-center gap-1")}><MaterialSymbolsErrorRounded /> {message[1]}</div>
                    if (message[0] === 'info') return <div key={i} className={cn("py-1.5 px-3 bg-foreground-muted/10 text-foreground-muted/80 flex items-center gap-1")}><MaterialSymbolsErrorRounded /> {message[1]}</div>
                  })}
                </div>
              )}

              <div>
                {/* For Raw */}
                <CollapsibleRow data-opened={isRaw}>
                  <div className="px-2">
                    <div className="border border-border rounded-md overflow-hidden">
                      <pre className="p-2  bg-background overflow-auto max-h-120">
                        {sitemapData?.sitemap.raw}
                      </pre>
                    </div>
                  </div>
                </CollapsibleRow>

                <CollapsibleRow data-opened={!isRaw}>

                  {/* Sitemap Indexes */}
                  {rawSitemaps && rawSitemaps.length > 0 && (
                    <SitemapIndexList
                      id={props.id}
                      indexes={rawSitemaps}
                      depth={(props.depth ?? 0) + 1}
                      topOffset={(props.topOffset ?? 0) + (props.lastModified ? 12 : 8.5)}
                      lastModified={props.lastModified}
                    />
                  )}

                  {/* Sitemap URLS */}
                  {rawUrls && rawUrls.length > 0 && (
                    <SitemapUrlList
                      urls={rawUrls}
                      fullUrl={props.fullUrl}
                    />
                  )}
                </CollapsibleRow>
              </div>
            </div>
          )}
        </CollapsibleRow>
      </div>
    }
  />
}



function SortIconTableHeader(props: {
  status: "asc" | "desc" | null,
}) {
  return <>
    {props.status === "asc" && <MdiSortReverseVariant />}
    {props.status === "desc" && <MdiSortVariant />}
  </>
}


function CardDetailButton(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "text-nowrap text-xs text-foreground-muted bg-background-button hover:bg-background-button-hover p-2 px-4 flex items-center gap-1 rounded-lg",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-opacity",
        "select-none",
        props.className
      )}
    />
  )
}

// -- CONTROLSS

export function ListSearchInputField(props: {
  search: string,
  setSearch: (s: string) => void
}) {
  return (
    <div className="px-2 pb-2 pt-0.5">
      <div className={cn("w-full transition-all duration-500 pb-0.5 max-w-xl",)}>
        <TextInputCard>
          <TextInputIconStart>
            <MaterialSymbolsSearchRounded className="w-4 h-4" />
          </TextInputIconStart>
          <input
            autoComplete="offOFFFFFOFOFOFOFFFF"
            autoSave="off"
            value={props.search}
            onChange={e => props.setSearch(e.target.value)}
            placeholder="  search..."
            className={cn("w-full h-9 outline-0")}
          />
        </TextInputCard>
      </div>
    </div>
  )
}
export function ListPaginationMenu(props: {
  entriesCount: number,
  LIMIT: number,
  page: number,
  totalPages: number,
  nextPage: () => void,
  prevPage: () => void,
  hasNextPage: boolean,
  hasPrevPage: boolean,
}) {
  const { entriesCount, LIMIT, page, totalPages, nextPage, prevPage } = props
  if (
    totalPages <= 1 ||
    (entriesCount ?? 0) <= LIMIT
  ) return null;
  return (
    <div className="flex gap-1 pt-2 justify-end items-center">
      {(entriesCount ?? 0) > LIMIT && (
        <div className=" px-1 text-foreground-muted-2">Only {LIMIT} entries are shown out of {entriesCount}</div>
      )}
      {totalPages > 1 && (
        <>
          <CardDetailButton
            onClick={() => prevPage()}
            className="px-3"
            disabled={!props.hasPrevPage}
          >
            ◀
          </CardDetailButton>
          <CardDetailButton className="pointer-events-none bg-transparent px-3">
            {page} / {totalPages}
          </CardDetailButton>
          <CardDetailButton
            onClick={() => nextPage()}
            className="px-3"
            disabled={!props.hasNextPage}
          >
            ▶
          </CardDetailButton>
        </>
      )}
    </div>
  )
}
// -- CONTROLSS END




export function TdesignSitemap(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from TDesign Icons by TDesign - https://github.com/Tencent/tdesign-icons/blob/main/LICENSE */}<path fill="currentColor" d="M5.5 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M2 5.5a3.5 3.5 0 0 1 6.855-1h6.29A3.502 3.502 0 0 1 22 5.5a3.5 3.5 0 0 1-6.855 1h-6.29q-.105.35-.276.665l8.256 8.256a3.5 3.5 0 1 1-1.414 1.414L7.165 8.579q-.315.172-.665.276v6.29A3.502 3.502 0 0 1 5.5 22a3.5 3.5 0 0 1-1-6.855v-6.29A3.5 3.5 0 0 1 2 5.5M18.5 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m0 13a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m-13 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3"></path></svg>)
}
export function MaterialSymbolsSearchRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"></path></svg>)
}
export function MaterialSymbolsRefresh(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12t1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20"></path></svg>)
}
export function RiExternalLinkLine(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Remix Icon by Remix Design - https://github.com/Remix-Design/RemixIcon/blob/master/License */}<path fill="currentColor" d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm11-3v8h-2V6.413l-7.793 7.794l-1.414-1.414L17.585 5H13V3z"></path></svg>)
}
export function MdiSortReverseVariant(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M3 11h12v2H3m0 5v-2h18v2M3 6h6v2H3Z"></path></svg>)
}
export function MdiSortVariant(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M3 13h12v-2H3m0-5v2h18V6M3 18h6v-2H3z"></path></svg>)
}
export function MaterialSymbolsErrorRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"></path></svg>)
}