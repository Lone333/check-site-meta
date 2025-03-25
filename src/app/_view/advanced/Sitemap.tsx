import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";
import { MetadataRow } from "../MetadataRow";
import { Suspense } from "react";
import { getSitemap, validateSitemap } from "@/app/lib/get-sitemap";
import { MaterialSymbolsCheckCircle, MaterialSymbolsCircleOutline } from "./Robots";
import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card";
import { TabsWithContent } from "@/app/module/tab/Tabs";
import { tab } from "@/app/module/tab/tab-primitives";

export function SitemapSummary(
  props: { metadata: ResoledMetadata }
) {
  const sitemapPromise = getSitemap(props.metadata.general.rawUrl.value)

  return (
    <>
      <MetadataRow data={{ label: "Sitemap" }}>
        <div className="leading-none flex flex-col gap-2 mt-1">
          <Suspense fallback="Loading...">
            {sitemapPromise.then(({ parsed }) => {
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
            }).catch(err => <div>Failed to retrieve sitemap.xml</div>)}
          </Suspense>
        </div>
      </MetadataRow>
    </>
  )
}


export function SitemapDetails(props: { data: Awaited<ReturnType<typeof getSitemap>> }) {

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
        id="robots-rules"
        className="self-start tab-item:py-1 tab-item:px-3.5 mb-2 mt-4 p-0.5 rounded-lg tab-background:rounded-md text-sm tab-item:font-semibold"
        tabs={[
          tab("Parsed",
            <pre className="text-sm">
              {/* {rules.map((rule, i) => {
                return (
                  <div key={i} className="mb-2 p-3 border border-border rounded-md">
                    <div className="pb-1">
                      <span className="font-semibold">{rule.userAgent}</span>
                      <span className="text-foreground-muted-2">{rule.userAgent === "*" ? " (All)" : ""}</span>
                    </div>
                    <div className="text-xs pl-2">
                      {rule.rule.map((r, j) => {
                        return (
                          <div key={j} className="flex gap-2">
                            <div><span className="py-0.5 px-1 border border-border text-[0.6rem] rounded-full bg-background-muted-2 uppercase">{r.allow ? "Allow" : "Disallow"}</span> {r.pattern}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })} */}
            </pre>
          ),
          tab("Raw", <pre className="text-sm p-2 border border-border rounded-md">{props.data.raw}</pre>),
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