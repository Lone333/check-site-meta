import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";
import { MetadataRow } from "../MetadataRow";
import { Suspense } from "react";
import { getSitemap, validateSitemap } from "@/app/lib/get-sitemap";
import { MaterialSymbolsCheckCircle, MaterialSymbolsCircleOutline } from "./Robots";
import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card";
import { TabsWithContent } from "@/app/module/tab/Tabs";
import { tab } from "@/app/module/tab/tab-primitives";
import { getRobots } from "@/app/lib/get-robots";

export function SitemapSummary(
  props: { metadata: ResoledMetadata }
) {
  return (
    <>
      <MetadataRow data={{ label: "Sitemap" }}>
        <div className="leading-none flex flex-col gap-2 mt-1">
          <Suspense key="sitemap-summary" fallback="Loading...">
            {(async () => getSitemap(props.metadata.general.rawUrl.value)
              .then(({ parsed }) => {
                return (
                  <>
                    <div className="font-medium flex items-center gap-1">
                      {parsed ? <>
                        <MaterialSymbolsCheckCircle />
                        Present
                      </> : <>
                        <MaterialSymbolsCircleOutline />
                        Not Found
                      </>
                      }
                    </div>
                  </>
                )
              })
              .catch(err => <div>Failed to retrieve sitemap.xml</div>)
            )()}
            {(async () => {
              const robots = await getRobots(props.metadata.general.rawUrl.value)
              if (!robots.sitemaps) return null
              return (
                <div>
                  {robots.sitemaps.map((sitemap, i) => {
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="font-medium">{sitemap}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </Suspense>
        </div>
      </MetadataRow>
    </>
  )
}


export function SitemapDetails(props: {
  data: Awaited<ReturnType<typeof getSitemap>>
  url: string
}) {

  const res = validateSitemap(props.data.parsed)

  return (
    <div className="flex flex-col">
      <CardHeader>
        <CardHeaderTitle>
          Sitemap.xml
        </CardHeaderTitle>
        <CardHeaderSubtitle>
          List of sitemap entries
        </CardHeaderSubtitle>
      </CardHeader>
      <TabsWithContent
        id="sitemap"
        className="self-start tab-item:py-1 tab-item:px-3.5 mb-3 mt-4 p-0.5 rounded-lg tab-background:rounded-md text-sm tab-item:font-semibold"
        tabs={[
          tab("Parsed",
            <div key="p">
              <pre className="text-sm">
                {res.sitemap.urls.map((url, i) => {
                  if (!url.loc) return null
                  return (
                    <div key={i} className="mb-2 p-3 border border-border rounded-md">
                      {url.loc}
                    </div>
                  )
                })}
              </pre>
            </div>
          ),
          tab("Raw",
            <div key="r">
              <pre className="text-sm p-2 border border-border rounded-md bg-background">{props.data.raw}</pre>
            </div>
          ),
        ]}
      />
      {/* 

      {
        res?.messages.map((msg, i) => {
          return (
            <div key={msg[0]} className="my-1">
              {msg[0]}: {msg[1]} {msg[2] && <span className="text-foreground-muted">({msg[2]})</span>}
            </div>
          )
        })
      }
      <pre>{JSON.stringify(props.data.parsed, null, 2)}</pre>
      <pre>{props.data.raw}</pre> */}
    </div>
  )
}