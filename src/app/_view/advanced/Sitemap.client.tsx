"use client"

import { useState, useTransition, type ComponentProps, type ReactNode, type SVGProps } from "react"
import { CollapsibleRow } from "@/app/lib/Collapsible"
import { ExpandableAdvancedCard } from "@/app/lib/Collapsible.client"
import { cn } from "lazy-cn"
import { getSitemapAction, type GetSitemapActionResponse } from "./Sitemap.action"
import { MaterialSymbolsOpenInNew } from "../inputs/InputForm"
import { useAppNavigation } from "@/app/lib/searchParams"
import { TabList } from "@/app/module/tab/TabRoot"
import { tab } from "@/app/module/tab/tab-primitives"
import { SourceHeader } from "./Sitemap"

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




export function SitemapFileCard(props: {
  fullUrl: string,
  title: string,
  lastModified?: string
  defaultClosed?: boolean
  headerProps?: ComponentProps<"div">
  depth?: number
  topOffset?: number
}) {
  const navigation = useAppNavigation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [sitemapData, setSitemapData] = useState<GetSitemapActionResponse>()
  const [search, setSearch] = useState('')
  const [sorts, setSorts] = useState<Record<string, "asc" | "desc" | null>>({
    url: null,
    lastmod: null,
    freq: null,
    priority: null,
  })
  const toggleSort = (key: "url" | "lastmod" | "freq" | "priority") => {
    setSorts({
      url: key === "url" ? (sorts.url === "asc" ? "desc" : sorts.url === "desc" ? null : "asc") : null,
      lastmod: key === "lastmod" ? (sorts.lastmod === "asc" ? "desc" : sorts.lastmod === "desc" ? null : "asc") : null,
      freq: key === "freq" ? (sorts.freq === "asc" ? "desc" : sorts.freq === "desc" ? null : "asc") : null,
      priority: key === "priority" ? (sorts.priority === "asc" ? "desc" : sorts.priority === "desc" ? null : "asc") : null,
    })
  }
  const processedUrls = sitemapData?.validated.res.urls
    ?.filter(a => search ? (
      a.loc.includes(search)
      || a.lastmod?.includes(search)
      || a.changefreq?.includes(search)
      || String(a.priority)?.includes(search)
    ) : true)
    .toSorted((a, b) => {
      if (sorts.url === "asc") return a.loc.localeCompare(b.loc)
      if (sorts.url === "desc") return b.loc.localeCompare(a.loc)
      if (sorts.lastmod === "asc") return a.lastmod?.localeCompare(b.lastmod ?? a.lastmod) ?? 0
      if (sorts.lastmod === "desc") return b.lastmod?.localeCompare(a.lastmod ?? b.lastmod) ?? 0
      if (sorts.freq === "asc") return a.changefreq?.localeCompare(b.changefreq ?? a.changefreq) ?? 0
      if (sorts.freq === "desc") return b.changefreq?.localeCompare(a.changefreq ?? b.changefreq) ?? 0
      if (sorts.priority === "asc") return (a.priority ?? 0) - (b.priority ?? 0)
      if (sorts.priority === "desc") return (b.priority ?? 0) - (a.priority ?? 0)
      return 0
    })

  const processedSitemaps = sitemapData?.validated.res.sitemaps
    ?.filter(a => search ? (a.loc.includes(search) || a.lastmod?.includes(search)) : true)
    .toSorted((a, b) => {
      if (sorts.url === "asc") return a.loc.localeCompare(b.loc)
      if (sorts.url === "desc") return b.loc.localeCompare(a.loc)
      if (sorts.lastmod === "asc") return a.lastmod?.localeCompare(b.lastmod ?? a.lastmod) ?? 0
      if (sorts.lastmod === "desc") return b.lastmod?.localeCompare(a.lastmod ?? b.lastmod) ?? 0
      return 0
    })

  const entries = processedUrls ?? processedSitemaps ?? []
  const entriesCount = entries.length

  // Limits and Paginations
  const LIMIT = 20
  const [page, setPage] = useState(1)
  const hasNextPage = page * LIMIT < entries.length;
  const hasPrevPage = page > 1;
  const totalPages = Math.ceil(entriesCount / LIMIT)
  const nextPage = () => {
    if (hasNextPage) setPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (hasPrevPage) setPage((prev) => prev - 1);
  };
  const paginatedSitemaps = processedSitemaps?.slice((page - 1) * LIMIT, page * LIMIT) ?? []
  const paginatedURLs = processedUrls?.slice((page - 1) * LIMIT, page * LIMIT) ?? []

  // Messages
  const messages = sitemapData?.validated.messages ?? []
  const errors = sitemapData?.validated.messages.filter(a => a[0] === "error") ?? []
  const warns = sitemapData?.validated.messages.filter(a => a[0] === "warn") ?? []
  const infos = sitemapData?.validated.messages.filter(a => a[0] === "info") ?? []

  // Views
  const [isRaw, setIsRaw] = useState(false)
  const toggleRaw = () => setIsRaw(!isRaw)

  // Content Render Control
  const [largeContentRendered, setLargeContentRendered] = useState(false)


  return <ExpandableAdvancedCard

    toggleExpanse={() => {
      if (!sitemapData && !isExpanded) {
        startTransition(async () => {
          const res = await getSitemapAction(props.fullUrl)
          startTransition(() => {
            if (res.data) {
              setSitemapData(res.data)
              setLargeContentRendered(true)
            }
            if (res.error) console.error(res.error)
          })
        })
      }
      if (!isExpanded) {
        setLargeContentRendered(true)
      }
      setIsExpanded(!isExpanded)
    }}
    expanded={isExpanded}

    // ZIndex has to be top to bottom (100 > 0) so that the parent-most will be on top. So that parent doesn't stay below of list of childrens.
    zIndex={100 - (10 + (props.depth ?? 0))}

    style={{
      '--header-offset': `calc((var(--spacing) * ${ 9 }) + (var(--spacing) * ${ props.topOffset ?? 0 }) + ${ props.topOffset ? "(var(--spacing) * 2)" : "0px" })`,
    }}
    onTransitionEnd={(e) => {
      if (e.target === e.currentTarget?.children[1]?.children[0]) {
        const collapsingElement = e.currentTarget?.children[1]?.children[0] as HTMLDivElement
        console.log('opened' in collapsingElement.dataset)
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
              "font-normal text-sm text-start break-word grow",
              sitemapData
                ? "text-foreground"
                : "text-foreground-muted-2 italic",
            )}>
              {props.title}
            </div>
            <div role="button"
              onClick={e => {
                e.stopPropagation()
                startTransition(async () => {
                  const res = await getSitemapAction(props.fullUrl)
                  startTransition(() => {
                    if (res.data) setSitemapData(res.data)
                    if (res.error) console.error(res.error)
                  })
                })
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
              Last updated: {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(props.lastModified))}
            </div>
          )}
        </div>

      </div>
    }
    Content={
      <div className="text-xs text-foreground-body flex flex-col text-start">

        <CollapsibleRow data-opened={isPending && !sitemapData}>
          <div className="p-3 px-4 text-foreground-muted-2 italic animate-pulse">Fetching {props.fullUrl}...</div>
        </CollapsibleRow>

        <CollapsibleRow
          data-opened={!!sitemapData}
          className="opacity-0 opened:opacity-100">
          {largeContentRendered && (
            <div className="flex flex-col gap-2 py-2">
              <div className="flex gap-1 px-2 items-center">
                <CardDetailButton
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await getSitemapAction(props.fullUrl)
                      startTransition(() => {
                        if (res.data) setSitemapData(res.data)
                        if (res.error) console.error(res.error)
                      })
                    })
                  }}>
                  <MaterialSymbolsSearchRounded className="size-4" />
                  {isPending ? "Refreshing..." : "Refresh"}
                </CardDetailButton>

                {/* Status Bar */}
                <div className="flex gap-2 px-2 text-xxs items-center">
                  {sitemapData?.validated.isIndex ? <>
                    <div className="badge-violet px-3 py-1 rounded-full ">
                      Sitemap Index
                    </div>
                    <div className="badge-gray px-3 py-1 rounded-full ">
                      {sitemapData?.validated.res.sitemaps?.length ?? 0} Sitemaps
                    </div>
                    {(entriesCount ?? 0) > LIMIT && (
                      <div className=" px-1 text-foreground-muted-2">Only {LIMIT} entries is shown out of {entriesCount}</div>
                    )}
                  </>
                    : <>
                      <div className="badge-teal px-3 py-1 rounded-full ">
                        Sitemap
                      </div>
                      <div className="badge-gray px-3 py-1 rounded-full ">
                        {sitemapData?.validated.res.urls?.length ?? 0} URLs
                      </div>
                      {(entriesCount ?? 0) > LIMIT && (
                        <div className=" px-1 text-foreground-muted">Only {LIMIT} entries is shown out of {entriesCount}</div>
                      )}
                    </>
                  }
                  {errors.length > 0 && (
                    <div className="badge-red px-3 py-1 rounded-full ">
                      {errors.length} Errors
                    </div>
                  )}
                  {warns.length > 0 && (
                    <div className="text-amber-500 px-1 rounded-full ">
                      {warns.length} Warnings
                    </div>
                  )}
                  {infos.length > 0 && (
                    <div className="text-slate-500 px-1 rounded-full ">
                      {warns.length} Infos
                    </div>
                  )}
                </div>

              </div>



              {/* Error Messages Goes Here */}
              {messages.length > 0 && (
                <div className="px-3 flex flex-col gap-1 bg-background-tooltip text-foreground-muted-2 py-2">
                  {messages.map((message, i) => {
                    return <div key={i} className={cn("rounded-md ")}>{message[0]}: {message[1]}</div>
                  })}
                </div>
              )}

              {entriesCount !== 0 && (
                <div className="flex gap-1 px-2">
                  {/* Switch */}
                  <TabList
                    className="shrink-0 text-xxs p-1 tab-item:py-1 tab-item:px-3.5 tab-card"
                    tabNum={isRaw ? 1 : 0}
                    tabs={[
                      tab("Table"),
                      tab("Raw")
                    ]}
                    onTabChange={(l, i, e) => {
                      setIsRaw(i === 1)
                    }}
                  />

                  <div className="flex gap-1 grow">
                    {/* Pagination Control */}
                    {totalPages > 1 && (
                      <>
                        <CardDetailButton onClick={() => prevPage()} className="px-3">
                          ◀
                        </CardDetailButton>
                        <CardDetailButton className="pointer-events-none bg-transparent px-3">
                          {page} / {totalPages}
                        </CardDetailButton>
                        <CardDetailButton onClick={() => nextPage()} className="px-3">
                          ▶
                        </CardDetailButton>
                      </>
                    )}
                    {entriesCount > 0 && (
                      <div className={cn("w-full transition-all duration-500",)}>
                        <input
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder="search..."
                          className={cn("w-full h-full shrink bg-background-card-input rounded-lg px-3 min-w-0",
                            "transition-[outline]",
                            "outline-transparent hover:outline-focus"
                          )}
                        />
                      </div>
                    )}
                  </div>
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

                {/* For Table */}
                <CollapsibleRow data-opened={!isRaw}>
                  {processedSitemaps !== undefined && (
                    <div className="px-2 flex flex-col gap-1">
                      {paginatedSitemaps
                        .map((sitemaps, i) => {
                          return (
                            <SitemapFileCard key={sitemaps.loc + i}
                              fullUrl={sitemaps.loc}
                              title={sitemaps.loc}
                              lastModified={sitemaps.lastmod}
                              defaultClosed
                              depth={(props.depth ?? 0) + 1}
                              topOffset={(props.topOffset ?? 0) + (props.lastModified ? 12 : 8.5)}
                            />
                          )
                        })}
                    </div>
                  )}
                  {processedUrls !== undefined && (
                    <div className="overflow-x-auto overflow-y-clip relative">
                      <div className="px-4 pb-1 items-end  top-0 min-w-200">
                        <div className={cn(
                          "bg-background-tooltip text-foreground-muted rounded-t-xl -mx-2 px-2 *:pt-2 *:pb-1.5 sticky",
                          "grid grid-cols-[2rem_4fr_9rem_0.5fr_0.5fr]",
                          // "*:gap-x-2  *:*:min-w-0 *:*:overflow-ellipsis *:*:text-nowrap *:*:overflow-hidden",
                        )}>
                          <div className=""></div>
                          <button onClick={() => toggleSort('url')} className="flex gap-2 items-center rounded-none text-xs font-semibold text-start">
                            URL
                            <SortIconTableHeader status={sorts.url} />
                          </button>
                          <button onClick={() => toggleSort('lastmod')} className="flex gap-2 items-center rounded-none text-xs font-semibold place-self-center">
                            Last Modified
                            <SortIconTableHeader status={sorts.lastmod} />
                          </button>
                          <button onClick={() => toggleSort('freq')} className="flex gap-2 items-center rounded-none text-xs font-semibold place-self-center">
                            Frequency
                            <SortIconTableHeader status={sorts.freq} />
                          </button>
                          <button onClick={() => toggleSort('priority')} className="flex gap-2 items-center rounded-none text-xs font-semibold place-self-center">
                            Priority
                            <SortIconTableHeader status={sorts.priority} />
                          </button>
                        </div>

                        <div className="fadeIn-0 col-span-5 *:grid *:grid-cols-[2rem_4fr_9rem_0.5fr_0.5fr] *:gap-x-2  *:*:min-w-0 *:*:overflow-ellipsis *:*:text-nowrap *:*:overflow-hidden">
                          {paginatedURLs
                            .map((url, i) => {
                              return (
                                <div key={i} className="hover:bg-background-card-input -mx-2 px-2 py-1">
                                  <div className="flex gap-1">
                                    <a href={url.loc} target="_blank" className="underline opacity-60 hover:opacity-100">
                                      <MaterialSymbolsOpenInNew className="w-3.5 h-3.5" />
                                    </a>
                                    <div
                                      onClick={() => {
                                        navigation.navigate('url', url.loc)
                                      }}
                                      className="underline opacity-60 hover:opacity-100 clickable">
                                      <MaterialSymbolsSearchRounded className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                  <div className="">
                                    {url.loc.split(props.fullUrl.split('://')[1])[1] || url.loc}
                                  </div>
                                  <div className="grid grid-cols-[5rem_4rem] overflow-hidden">
                                    <div className="overflow-hidden">
                                      {!!url.lastmod && new Intl.DateTimeFormat('en-US', {
                                        dateStyle: 'medium',
                                      }).format(new Date(url.lastmod))}
                                    </div>
                                    <div className="overflow-hidden place-self-end">
                                      {!!url.lastmod && new Intl.DateTimeFormat('en-US', {
                                        timeStyle: 'short',
                                      }).format(new Date(url.lastmod))}
                                    </div>
                                  </div>
                                  <div className="place-self-center">{url.changefreq ?? "-"}</div>
                                  <div className="place-self-center">{url.priority ?? "-"}</div>
                                </div>
                              )
                            })}
                        </div>

                      </div>
                    </div>
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
        "text-nowrap text-xs text-foreground-muted bg-background-card-button hover:bg-background-card-button-hover p-2 px-4 flex items-center gap-1 rounded-lg", props.className
      )}
    />
  )
}










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


