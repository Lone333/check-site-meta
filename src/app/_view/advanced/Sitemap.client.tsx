"use client"

import { Fragment, useActionState, useState, useTransition, type ComponentProps, type ReactNode, type SVGProps } from "react"
import { CollapsibleColumn, CollapsibleRow } from "@/app/lib/Collapsible"
import { ExpandableCard, MaterialSymbolsExpandMoreRounded } from "@/app/lib/Collapsible.client"
import { cn } from "lazy-cn"
import { getSitemapAction, type GetSitemapActionResponse } from "./Sitemap.action"
import type { GetSitemapResponse } from "@/app/lib/get-sitemap"
import { FormButton, MaterialSymbolsOpenInNew } from "../inputs/InputForm"
import { ExternalIcon } from "../MetadataRow"

export function SitemapCategoryCollapsible(
  props: {
    header: ReactNode,
    children?: ReactNode,
  }
) {
  const [expanded, setExpanded] = useState(true)
  return (
    <>
      <SourceHeader onClick={() => setExpanded(!expanded)}>
        {props.header}
      </SourceHeader>
      <CollapsibleRow data-opened={expanded}>
        {props.children}
      </CollapsibleRow>
    </>
  )
}

export function SourceHeader(props: ComponentProps<"button">) {
  return (
    <button {...props} className={cn("font-semibold flex gap-2 items-center py-1", props.className)}>
      <MaterialSymbolsExpandMoreRounded className={cn("w-4 h-4 transition-all")} />
      {props.children}
    </button>
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
      || a.priority?.includes(search)
    ) : true)
    .toSorted((a, b) => {
      if (sorts.url === "asc") return a.loc.localeCompare(b.loc)
      if (sorts.url === "desc") return b.loc.localeCompare(a.loc)
      if (sorts.lastmod === "asc") return a.lastmod?.localeCompare(b.lastmod ?? a.lastmod) ?? 0
      if (sorts.lastmod === "desc") return b.lastmod?.localeCompare(a.lastmod ?? b.lastmod) ?? 0
      if (sorts.freq === "asc") return a.changefreq?.localeCompare(b.changefreq ?? a.changefreq) ?? 0
      if (sorts.freq === "desc") return b.changefreq?.localeCompare(a.changefreq ?? b.changefreq) ?? 0
      if (sorts.priority === "asc") return a.priority?.localeCompare(b.priority ?? a.priority) ?? 0
      if (sorts.priority === "desc") return b.priority?.localeCompare(a.priority ?? b.priority) ?? 0
      return 0
    })
  const processedUrlsTotal = processedUrls?.length


  const processedSitemaps = sitemapData?.validated.res.sitemaps
    ?.filter(a => search ? (a.loc.includes(search) || a.lastmod?.includes(search)) : true)
    .toSorted((a, b) => {
      if (sorts.url === "asc") return a.loc.localeCompare(b.loc)
      if (sorts.url === "desc") return b.loc.localeCompare(a.loc)
      if (sorts.lastmod === "asc") return a.lastmod?.localeCompare(b.lastmod ?? a.lastmod) ?? 0
      if (sorts.lastmod === "desc") return b.lastmod?.localeCompare(a.lastmod ?? b.lastmod) ?? 0
      return 0
    })
  const processedSitemapsTotal = processedSitemaps?.length

  const LIMIT = 20


  return <ExpandableCard
    toggleExpanse={() => {
      if (!sitemapData && !isExpanded) {
        startTransition(async () => {
          const res = await getSitemapAction(props.fullUrl)
          startTransition(() => {
            if (res.data) setSitemapData(res.data)
            if (res.error) console.error(res.error)
          })
        })
      }
      setIsExpanded(!isExpanded)
    }}
    expanded={isExpanded}
    className="*:first:sticky *:first:top-0"
    headerProps={{
      ...props.headerProps,
      style: {
        zIndex: (100 - (10 + (props.depth ?? 0))),
        top: (props.topOffset ?? 0) + "rem",
        ...props.headerProps?.style,
      },
      className: cn("sticky top-0", props.headerProps?.className)
    }}

    Label={
      <div className="flex items-start gap-1 grow group text-start">
        <TdesignSitemap className="size-4 text-foreground-muted mt-0.25 shrink-0" />
        <div className="flex flex-col grow">
          <div className="flex">
            <div className={cn(
              "font-normal text-sm text-start break-word grow",
              sitemapData ? "text-foreground" : "text-foreground-muted-2 italic",
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
            <div className="text-[0.7rem] text-foreground-muted-2 font-normal">
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
      <div className="text-xs text-foreground-muted flex flex-col text-start">

        <CollapsibleRow data-opened={isPending && !sitemapData}>
          <div className="p-3 px-4 text-foreground-muted-2 italic">
            Loading...
          </div>
        </CollapsibleRow>

        <CollapsibleRow data-opened={!!sitemapData} className="opacity-0 opened:opacity-100">
          <div className="flex gap-1 p-2">
            <button
              disabled={isPending}
              onClick={() => {
                startTransition(async function () {
                  const res = await getSitemapAction(props.fullUrl)
                  startTransition(() => {
                    if (res.data) setSitemapData(res.data)
                    if (res.error) console.error(res.error)
                  })
                })
              }}
              className={cn("grow text-nowrap text-xs bg-foreground-body/5 hover:bg-foreground-body/20 p-2 px-4 flex items-center gap-1 rounded-lg")}>
              <MaterialSymbolsSearchRounded className="size-4" />
              {isPending ? "Refreshing..." : "Refresh"}
            </button>
            <div className={cn("w-full overflow-hidden transition-all duration-500",)}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="search..."
                className={cn("w-full h-full shrink bg-background-card-input rounded-lg px-3 min-w-0",)}
              />
            </div>
          </div>
          <div className="flex gap-2 px-2">
            {sitemapData?.validated.isIndex ? <>
              <div className="text-purple-500 px-1 py-0.5 rounded-full text-[0.7rem]">
                Sitemap Index
              </div>
              <div className="text-foreground-muted-2 px-1 py-0.5 rounded-full text-[0.7rem]">
                {sitemapData?.validated.res.sitemaps?.length} Sitemaps
              </div>
              {(processedSitemapsTotal ?? 0) > LIMIT && (
                <div className="text-[0.7rem] px-1 py-0.5 text-foreground-muted-2">Only {LIMIT} entries is shown out of {processedSitemapsTotal}</div>
              )}
            </>
              : <>
                <div className="text-orange-500 px-1 py-0.5 rounded-full text-[0.7rem]">
                  Sitemap
                </div>
                <div className="text-foreground-muted-2 px-1 py-0.5 rounded-full text-[0.7rem]">
                  {sitemapData?.validated.res.urls?.length} URLs
                </div>
                {(processedUrlsTotal ?? 0) > LIMIT && (
                  <div className="text-[0.7rem] px-1 py-0.5 text-foreground-muted-2">Only {LIMIT} entries is shown out of {processedUrlsTotal}</div>
                )}
              </>
            }
          </div>

          {processedSitemaps !== undefined && (
            <div className="p-2 flex flex-col gap-1">
              {processedSitemaps
                .slice(0, LIMIT)
                .map((sitemaps, i) => {
                  return (
                    <SitemapFileCard key={i}
                      fullUrl={sitemaps.loc}
                      title={sitemaps.loc}
                      lastModified={sitemaps.lastmod}
                      defaultClosed
                      depth={(props.depth ?? 0) + 1}
                      topOffset={(props.topOffset ?? 0) + 2}
                    />
                  )
                })}
            </div>
          )}

          {processedUrls !== undefined && (
            <div className="overflow-x-auto relative">
              <div className="px-4 pt-2 pb-1 *:grid *:grid-cols-[2rem_4fr_10rem_1fr_1fr] *:gap-x-2 items-end *:*:min-w-0 *:*:overflow-ellipsis *:*:text-nowrap *:*:overflow-hidden top-0 min-w-200">
                <div className="bg-background-muted-2 rounded-t-xl -mx-2 px-2 pt-2 pb-1.5 sticky">
                  <div className=""></div>
                  <button onClick={() => toggleSort('url')} className="flex gap-2 items-center rounded-none text-xs font-semibold opacity-40 text-start">
                    URL
                    <SortIconTableHeader status={sorts.url} />
                  </button>
                  <button onClick={() => toggleSort('lastmod')} className="flex gap-2 items-center rounded-none text-xs font-semibold opacity-40 text-start">
                    Last Modified
                    <SortIconTableHeader status={sorts.lastmod} />
                  </button>
                  <button onClick={() => toggleSort('freq')} className="flex gap-2 items-center rounded-none text-xs font-semibold opacity-40 place-self-center">
                    Frequency
                    <SortIconTableHeader status={sorts.freq} />
                  </button>
                  <button onClick={() => toggleSort('priority')} className="flex gap-2 items-center rounded-none text-xs font-semibold opacity-40 place-self-center">
                    Priority
                    <SortIconTableHeader status={sorts.priority} />
                  </button>
                </div>
                {processedUrls
                  .slice(0, LIMIT)
                  .map((url, i) => {
                    return (
                      <div key={i} className="hover:bg-background-card-input -mx-2 px-2 py-1">
                        <div className="flex gap-1">
                          <a href={url.loc} target="_blank" className="underline opacity-60 hover:opacity-100">
                            <MaterialSymbolsOpenInNew className="w-3.5 h-3.5" />
                          </a>
                          <div
                            onClick={() => {

                            }}
                            className="underline opacity-60 hover:opacity-100">
                            <MaterialSymbolsSearchRounded className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="">
                          {url.loc.split(props.fullUrl.split('://')[1])[1] || url.loc}
                        </div>
                        <div className="grid grid-cols-[6rem_4rem] overflow-hidden">
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


