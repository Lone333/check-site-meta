import { MetadataRow } from "../MetadataRow"
import { type GetRobotsResult } from "@/app/lib/get-robots"
import { Suspense, type SVGProps } from "react"
import { cn } from "lazy-cn"
import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data"
import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card"
import { RobotsAdvancedDetailsBoundary } from "./Robots.client"


export async function RobotsSummary(props: {
  metadata: ResoledMetadata,
  getRobots: (url: string) => Promise<GetRobotsResult>
}) {
  return <>
    <MetadataRow data={props.metadata.general.robots} />
    <MetadataRow data={{ label: 'robots.txt', }}>
      <div className="leading-none flex flex-col gap-2 mt-1">
        <Suspense fallback="Loading...">
          <RobotsSummaryData />
        </Suspense>
      </div>
    </MetadataRow>
  </>

  async function RobotsSummaryData() {
    try {
      const { parsed, sitemaps } = await props.getRobots(props.metadata.rawUrl)
      return (
        <>
          <div className="font-medium flex items-center gap-1">
            {parsed
              ? <><MaterialSymbolsCheckCircle /> Present</>
              : <><MaterialSymbolsCircleOutline /> Not Found</>
            }
          </div>
          {parsed && <>
            <div>{Object.keys(parsed).length} rules found</div>
            <div>{Object.keys(sitemaps).length} sitemaps found</div>
          </>}
        </>
      )
    } catch (error) {
      return <div>Failed to retrieve robots.txt</div>
    }
  }
}



export function MaterialSymbolsCheckCircle(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"></path></svg>)
}
export function MaterialSymbolsCircleOutline(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"></path></svg>)
}


export function RobotsDetails({ data, url }: {
  url: string,
  data: GetRobotsResult,
}) {
  const { parsed, raw } = data
  return (
    <div className={cn("flex flex-col")}>
      <CardHeader className="pb-4">
        <CardHeaderTitle>
          Robots.txt (beta)
        </CardHeaderTitle>
        <CardHeaderSubtitle>
          {`A standard file that tells web crawlers which pages they can or can't access on a website.`}
        </CardHeaderSubtitle>
      </CardHeader>
      <RobotsAdvancedDetailsBoundary
        url={url}
      />
    </div>
  )
}


export function MaterialSymbolsInfoRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16v-4q0-.425-.288-.712T12 11t-.712.288T11 12v4q0 .425.288.713T12 17m0-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"></path></svg>)
}