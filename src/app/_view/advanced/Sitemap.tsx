import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";
import { MetadataRow } from "../MetadataRow";
import { Suspense, type SVGProps } from "react";
import { getSitemap, validateSitemap } from "@/app/lib/get-sitemap";
import { MaterialSymbolsCheckCircle, MaterialSymbolsCircleOutline } from "./Robots";
import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card";
import { getRobots } from "@/app/lib/get-robots";
import { TabsWithContent } from "@/app/module/tab/Tabs";
import { tab } from "@/app/module/tab/tab-primitives";
import { ExpandableCard } from "@/app/lib/Collapsible.client";
import { SitemapCategoryCollapsible, SitemapFileCard } from "./Sitemap.client";

export function SitemapSummary(
  props: { metadata: ResoledMetadata }
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
      const { parsed } = await getSitemap(new URL('/sitemap.xml', baseUrl).href)
      return <div className="font-medium flex items-center gap-1">
        {parsed
          ? <><MaterialSymbolsCheckCircle /> Present</>
          : <><MaterialSymbolsCircleOutline /> Not Found</>}
      </div>
    } catch (error) { return <div>Failed to retrieve sitemap.xml</div> }
  }
  async function SitemapFromRobots() {
    try {
      const robots = await getRobots(baseUrl)
      if (!robots.sitemaps) return null
      if (robots.sitemaps.length === 0)
        return "No sitemap found from robots.txt"
      return <div>{robots.sitemaps.length} sitemaps found from robots.txt</div>
    } catch { return null }
  }
}



export function SitemapDetails(props: {
  url: string
}) {
  const baseUrl = props.url
  return (
    <div className="flex flex-col gap-4">
      <CardHeader>
        <CardHeaderTitle>Sitemaps</CardHeaderTitle>
        <CardHeaderSubtitle>List of sitemap entries</CardHeaderSubtitle>
      </CardHeader>
      <TabsWithContent
        id="sitemap"
        className="self-start p-1 tab-item:py-1 tab-item:text-xs"
        tabs={[
          tab("List"),
          tab("Tree")
        ]}
      />
      <div className="rounded-md flex flex-col gap-2">
        <div className="rounded-md flex flex-col gap-2">
          <SitemapCategoryCollapsible header="Direct URLs">
            <div className="flex flex-col gap-1 pl-5">
              <Suspense fallback="Loading direct /sitemap.xml">
                <SitemapFileCard title={'/sitemap.xml'} fullUrl={new URL('/sitemap.xml', baseUrl).href} />

                {/* <SitemapInfoDetail fullUrl={new URL('/sitemap.xml', baseUrl).href} title="/sitemap.xml" /> */}
              </Suspense>
            </div>
          </SitemapCategoryCollapsible>
        </div>
        <div className="flex flex-col gap-2 py-2">
          <SitemapCategoryCollapsible header={<>From robots.txt <Suspense><SitemapCountFromRobotBadge /></Suspense></>}>
            <Suspense fallback="Loading robots.txt">
              <SitemapsFromRobotsList />
            </Suspense>
          </SitemapCategoryCollapsible>
        </div>
      </div>
    </div>
  )
  async function SitemapCountFromRobotBadge() {
    try {
      const { sitemaps } = await getRobots(baseUrl)
      return <span className="p-0.5 px-2 rounded-full badge-gray text-[0.6rem] fadeIn-100">
        {sitemaps.length}
      </span>
    } catch { return null }
  }
  async function SitemapsFromRobotsList() {
    try {
      const { sitemaps } = await getRobots(baseUrl)
      return <div className="flex flex-col gap-1 pl-5">
        {sitemaps.map((sitemap, i) => <div key={i} className="flex flex-col">
          <Suspense fallback="Loading...">
            <SitemapFileCard title={sitemap} fullUrl={sitemap} />
            {/* <SitemapInfoDetail key={i} fullUrl={sitemap} title={sitemap} /> */}
          </Suspense>
        </div>)}
      </div>
    } catch { return "Error fetching robots.txt" }
  }
  // async function SitemapInfoDetail(props: {
  //   fullUrl: string,
  //   title: string
  // }) {
  //   try {
  //     const sitemap = await getSitemap(props.fullUrl)
  //     const res = validateSitemap(sitemap.parsed)
  //     return <>
  //       <ExpandableCard
  //         expanded={true}
  //         Label={<div className="flex items-start gap-1">
  //           <TdesignSitemap className="size-4 text-foreground-muted mt-0.25" />
  //           {/* {res.isIndex &&
  //           <div className="text-[0.6rem] px-2 py-1 rounded-full font-normal badge-blue fadeIn-0">
  //             Index
  //           </div>
  //         } */}
  //           <div className="font-normal text-sm text-start">
  //             {props.title}
  //           </div>
  //           {/* {res.res.urls !== undefined &&
  //           <div className="text-[0.6rem] px-2 py-1 rounded-full font-normal badge-gray fadeIn-100">
  //             {res.res.urls?.length} URLs
  //           </div>
  //         } */}
  //           {/* <div className="text-[0.6rem] px-2 py-1 rounded-full font-normal badge-gray fadeIn-200">
  //           {(sitemap.byteSize / 1000).toFixed(2)} KB
  //         </div> */}
  //         </div>}
  //         Content={<>
  //           <div className="text-xs text-foreground-muted py-1 flex flex-col overflow-visible">
  //             <Suspense fallback="Loading...">
  //               <div className="px-4 pt-2 pb-1 grid grid-cols-[4fr_2fr_1fr_1fr] gap-x-2 items-end *:min-w-0 *:overflow-ellipsis *:text-nowrap *:overflow-hidden sticky top-0">
  //                 <div className="font-medium">URL</div>
  //                 <div className="font-medium">Last Modified</div>
  //                 <div className="font-medium">Frequency</div>
  //                 <div className="font-medium">Priority</div>
  //               </div>
  //               {/* <pre>
  //                   {res.res.urls?.length === 0 && JSON.stringify(sitemap.parsed, null, 2)}
  //                 </pre> */}
  //               {res.res.urls?.slice(0, 10).map((url, i) => {
  //                 if (!url.loc) return null
  //                 return (
  //                   <div key={i} className="grid grid-cols-[4fr_2fr_1fr_1fr] gap-x-2 items-start py-2 px-4 hover:bg-background/30 *:min-w-0 *:break-words">
  //                     <div className="font-medium">
  //                       {url.loc.split(baseUrl.split('://')[1])[1] || url.loc}
  //                     </div>
  //                     <div className="font-medium">{!!url.lastmod && new Date(url.lastmod).toLocaleString()}</div>
  //                     <div className="font-medium">{url.changefreq}</div>
  //                     <div className="font-medium">{url.priority}</div>
  //                   </div>
  //                 )
  //               })}
  //             </Suspense>
  //           </div>
  //         </>}
  //       />
  //     </>
  //   } catch (error) { return `Direct URL Sitemap not found (${ props.title })` }
  // }


}











export function TdesignSitemap(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from TDesign Icons by TDesign - https://github.com/Tencent/tdesign-icons/blob/main/LICENSE */}<path fill="currentColor" d="M5.5 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M2 5.5a3.5 3.5 0 0 1 6.855-1h6.29A3.502 3.502 0 0 1 22 5.5a3.5 3.5 0 0 1-6.855 1h-6.29q-.105.35-.276.665l8.256 8.256a3.5 3.5 0 1 1-1.414 1.414L7.165 8.579q-.315.172-.665.276v6.29A3.502 3.502 0 0 1 5.5 22a3.5 3.5 0 0 1-1-6.855v-6.29A3.5 3.5 0 0 1 2 5.5M18.5 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m0 13a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m-13 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3"></path></svg>)
}