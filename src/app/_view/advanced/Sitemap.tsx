import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";
import { MetadataRow } from "../MetadataRow";
import { Suspense, type ComponentProps, type ReactNode, type SVGProps } from "react";
import { MaterialSymbolsCheckCircle, MaterialSymbolsCircleOutline } from "./Robots";
import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card";
import { SitemapCategoryCollapsible, SitemapFileCard } from "./Sitemap.client";
import { ExpandableAdvancedCard, MaterialSymbolsExpandMoreRounded } from "@/app/lib/Collapsible.client";
import { cn } from "lazy-cn";
import { parseError } from "@/app/module/error/ErrorCard";

export function SitemapSummary(
  props: {
    metadata: ResoledMetadata,
    getSitemap: (url: string) => Promise<{ parsed: boolean }>,
    getRobots: (url: string) => Promise<{ sitemaps: string[] }>
  }
) {
  const baseUrl = props.metadata.rawUrl
  return <MetadataRow data={{ label: "Sitemap" }}>
    <div className="leading-none flex flex-col gap-2 mt-1.5">
      <Suspense key="sitemap-summary" fallback="Loading...">
        <SitemapPresence />
      </Suspense>
      <Suspense key="sitemap-from-robots-summary">
        <SitemapFromRobots />
      </Suspense>
    </div>
  </MetadataRow>

  async function SitemapPresence() {
    try {
      const { parsed } = await props.getSitemap(new URL('/sitemap.xml', baseUrl).href)
      return <div className="font-medium flex items-center gap-1">
        {parsed
          ? <><MaterialSymbolsCheckCircle /> Present</>
          : <><MaterialSymbolsCircleOutline /> Not Found</>}
      </div>
    } catch (error) { return <div>Failed to retrieve sitemap.xml</div> }
  }
  async function SitemapFromRobots() {
    try {
      const robots = await props.getRobots(baseUrl)
      if (!robots.sitemaps) return null
      if (robots.sitemaps.length === 0)
        return "No sitemap found from robots.txt"
      return <div>{robots.sitemaps.length} sitemaps found from robots.txt</div>
    } catch { return null }
  }
}










export function SitemapDetails(props: {
  url: string,
  getRobots: (url: string) => Promise<{ sitemaps: string[] }>
}) {
  const baseUrl = props.url



  

  return (
    <div className="flex flex-col gap-4">
      <CardHeader>
        <CardHeaderTitle>Sitemaps (beta)</CardHeaderTitle>
        <CardHeaderSubtitle>List of sitemap entries</CardHeaderSubtitle>
      </CardHeader>

      <div className="rounded-md flex flex-col gap-2">
        <SitemapSourceCategorySuspense
          header="Direct URLs"
          fallback="Loading direct /sitemap.xml"
        >
          <div className="-mt-2">
            <SitemapsFromDirectLink />
          </div>
        </SitemapSourceCategorySuspense>
        <SitemapSourceCategorySuspense
          header={<>From robots.txt <Suspense><SitemapCountFromRobotBadge /></Suspense></>}
          fallback="Loading robots.txt"
        >
          <div className="-mt-2">
            <SitemapsFromRobots />
          </div>
        </SitemapSourceCategorySuspense>
      </div>
    </div>
  )


  function SitemapSourceCategorySuspense(props: { children: ReactNode, fallback: ReactNode, header: ReactNode }) {
    return (
      <div className="flex flex-col -mx-5">
        <SitemapCategoryCollapsible header={props.header}>
          <div className="flex flex-col gap-1 px-2 py-2 bg-(--bg)"
            style={{ '--bg': 'var(--color-background)', }}
          >
            <Suspense fallback={props.fallback}>
              {props.children}
            </Suspense>
          </div>
        </SitemapCategoryCollapsible>
      </div>
    )
  }


  async function SitemapsFromDirectLink() {
    try {
      return (
        <div>
          <SitemapFileCard id="sitemapxml" title={'/sitemap.xml'} fullUrl={new URL('/sitemap.xml', baseUrl).href} />
        </div>
      )
    } catch (error) {
      return ""
    }
  }


  async function SitemapsFromRobots() {
    try {
      const { sitemaps } = await props.getRobots(baseUrl)
      return (
        <div className="flex flex-col">
          {sitemaps.map((sitemap, i) => (
            <Suspense fallback="Loading..." key={i}>
              <SitemapFileCard id={`robotstxt_${i}`} title={sitemap} fullUrl={sitemap} />
            </Suspense>
          ))}
        </div>
      )
    } catch (error) {
      return <ErrorItemCard error={error}>
        Error fetching robots.txt
      </ErrorItemCard>
    }
  }


  async function SitemapCountFromRobotBadge() {
    return props.getRobots(baseUrl)
      .then(({ sitemaps }) => (
        <span className="p-0.5 px-2 rounded-full badge-gray text-[0.6rem] fadeIn-100">
          {sitemaps.length}
        </span>
      ))
      .catch(() => null)
  }
}




export function SourceHeader(props: ComponentProps<"button">) {
  return (
    <button {...props} className={cn("font-semibold flex gap-2 items-center py-1 group", props.className)}>
      <MaterialSymbolsExpandMoreRounded className={cn("w-4 h-4 transition-all -rotate-90 group-opened:rotate-0")} />
      {props.children}
    </button>
  )
}






export function TdesignSitemap(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from TDesign Icons by TDesign - https://github.com/Tencent/tdesign-icons/blob/main/LICENSE */}<path fill="currentColor" d="M5.5 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M2 5.5a3.5 3.5 0 0 1 6.855-1h6.29A3.502 3.502 0 0 1 22 5.5a3.5 3.5 0 0 1-6.855 1h-6.29q-.105.35-.276.665l8.256 8.256a3.5 3.5 0 1 1-1.414 1.414L7.165 8.579q-.315.172-.665.276v6.29A3.502 3.502 0 0 1 5.5 22a3.5 3.5 0 0 1-1-6.855v-6.29A3.5 3.5 0 0 1 2 5.5M18.5 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m0 13a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m-13 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3"></path></svg>)
}

export function MaterialSymbolsErrorRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"></path></svg>)
}


function ErrorItemCard(props: { error: unknown, children: ReactNode }) {
  const parsedError = parseError(props.error)
  return (
    <ExpandableAdvancedCard
      Label={<div className="-my-2 flex gap-2 py-2 items-center text-red-400">
        <MaterialSymbolsErrorRounded className="w-4 h-4 shrink-0 opacity-100" />
        <div className="overflow-clip text-ellipsis ">{props.children}</div>
      </div>}
      Content={<div className="-mb-2 p-2 flex flex-col gap-1 font-normal">
        <div>
          <div className="font-semibold">{parsedError.summary}</div>
          <div className="font-normal text-sm opacity-80">{parsedError.detail}</div>
        </div>
        <hr className="-mx-2 border-border" />
        <div className="text-xxs font-mono text-foreground-muted">
          {parsedError.context.map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
        <hr className="-mx-2 border-border" />
        <pre className="text-xxs font-mono text-foreground-muted overflow-auto">{parsedError.stack}</pre>
      </div>}
    />
  )
}