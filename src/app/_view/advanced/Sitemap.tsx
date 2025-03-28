import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";
import { MetadataRow } from "../MetadataRow";
import { Suspense, type ComponentProps, type ReactNode, type SVGProps } from "react";
import { MaterialSymbolsCheckCircle, MaterialSymbolsCircleOutline } from "./Robots";
import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card";
import { SitemapCategoryCollapsible, SitemapFileCard } from "./Sitemap.client";
import { MaterialSymbolsExpandMoreRounded } from "@/app/lib/Collapsible.client";
import { cn } from "lazy-cn";

export function SitemapSummary(
  props: {
    metadata: ResoledMetadata,
    getSitemap: (url: string) => Promise<{ parsed: boolean }>,
    getRobots: (url: string) => Promise<{ sitemaps: string[] }>
  }
) {
  const baseUrl = props.metadata.general.rawUrl.value
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
          <SitemapsFromDirect />
        </SitemapSourceCategorySuspense>
        <SitemapSourceCategorySuspense
          header={<>From robots.txt <Suspense><SitemapCountFromRobotBadge /></Suspense></>}
          fallback="Loading robots.txt"
        >
          <SitemapsFromRobotsList />
        </SitemapSourceCategorySuspense>
      </div>
    </div>
  )
  async function SitemapCountFromRobotBadge() {
    try {
      const { sitemaps } = await props.getRobots(baseUrl)
      return <span className="p-0.5 px-2 rounded-full badge-gray text-[0.6rem] fadeIn-100">
        {sitemaps.length}
      </span>
    } catch { return null }
  }
  function SitemapSourceCategorySuspense(props: { children: ReactNode, fallback: ReactNode, header: ReactNode }) {
    return (
      <div className="flex flex-col -mx-5">
        <SitemapCategoryCollapsible header={props.header}>
          <div className="flex flex-col gap-1 px-2 pb-2 bg-(--bg)"
            style={{
              '--bg': 'var(--color-background)',
            }}
          >
            <Suspense fallback={props.fallback}>
              {props.children}
            </Suspense>
          </div>
        </SitemapCategoryCollapsible>
      </div>
    )
  }
  async function SitemapsFromDirect() {
    return (<SitemapFileCard title={'/sitemap.xml'} fullUrl={new URL('/sitemap.xml', baseUrl).href} />)
  }
  async function SitemapsFromRobotsList() {
    try {
      const { sitemaps } = await props.getRobots(baseUrl)
      return <div className="flex flex-col ">
        {sitemaps.map((sitemap, i) => <div key={i} className="flex flex-col">
          <Suspense fallback="Loading...">
            <SitemapFileCard title={sitemap} fullUrl={sitemap} />
          </Suspense>
        </div>)}
      </div>
    } catch { return "Error fetching robots.txt" }
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