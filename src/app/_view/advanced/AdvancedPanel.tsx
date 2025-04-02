import { tab } from "@/app/module/tab/tab-primitives";
import { TabsWithContent } from "@/app/module/tab/Tabs";
import type { SiteMetadata } from "@/app/page";
import { MetaCard } from "../MetaInfo";
import { RobotsDetails } from "./Robots";
import { SitemapDetails } from "./Sitemap";
import { Suspense, type ReactNode, type SVGProps } from "react";
import { CardlessHomeErrorCard, type ParsedError } from "@/app/module/error/ErrorCard";
import { ExpandableErrorStack } from "@/app/module/error/Error.client";
import { getRobots } from "@/app/lib/get-robots";
import { LLMs } from "./Llms";

export function AdvancedPanel(props: {
  metadata: SiteMetadata
}) {

  const Robots = async () =>
    getRobots(props.metadata.url)
      .then(res => <RobotsDetails data={res} url={props.metadata.url} />)
      .catch(err => <CardlessHomeErrorCard error={err}>
        <div className="text-foreground-body max-w-screen-sm flex flex-col gap-2 text-xxs">
          <p>Robots.txt file is used to control search engine crawlers. It is a text file that tells web robots which pages on your site to crawl. It also tells web robots which pages not to crawl.  </p>
          <p>To get started, you can create a robots.txt file and place it in the root directory of your website.</p>
        </div>
      </CardlessHomeErrorCard>)

  return (
    <TabsWithContent
      className="self-start mb-8"
      id={"advanced"}
      tabs={[
        tab("Raw",
          <MetaCard>
            <pre key="h" className="card-content fadeBlurIn-100 overflow-auto text-xs text-foreground-body">
              {`Only <head> is shown: \n\n`}{props.metadata.html?.split('<body')[0].replaceAll('/><', '/>\n<').replaceAll(/<style[^>]*>[\s\S]*?<\/style>/g, '<style>...</style>')}
            </pre>
          </MetaCard>
        ),
        tab("Robots",
          <MetaCard>
            <div key="r" className="card-content fadeBlurIn-0">
              <Suspense fallback="Loading robots.txt">
                <Robots />
              </Suspense>
            </div>
          </MetaCard>
        ),
        tab("Sitemap",
          <MetaCard>
            <div key="sm" className="card-content fadeBlurIn-0">
              <Suspense fallback="Loading...">
                <SitemapDetails
                  url={props.metadata.url}
                  getRobots={getRobots}
                />
              </Suspense>
            </div>
          </MetaCard>
        ),
        tab("LLms",
          <MetaCard>
            <div key="sm" className="card-content fadeBlurIn-0">
              <LLMs url={props.metadata.url} />
            </div>
          </MetaCard>
        )
      ]}
    >
    </TabsWithContent>
  )
}


function AdvancedPanelErrorCard({ err, children }: { err: ParsedError, children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <MaterialSymbolsInfoRounded className="w-7 h-7 text-foreground-muted" />
        <div className="flex flex-col">
          <div className="font-semibold text-[1rem]">{err.summary}</div>
          <div>{err.detail}</div>
        </div>
      </div>
      <div className="text-foreground-body max-w-screen-sm flex flex-col gap-2">
        {children}
      </div>
      <ExpandableErrorStack stack={err.stack!} />
    </div>
  )
}


export function MaterialSymbolsInfoRounded(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16v-4q0-.425-.288-.712T12 11t-.712.288T11 12v4q0 .425.288.713T12 17m0-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"></path></svg>
  )
}