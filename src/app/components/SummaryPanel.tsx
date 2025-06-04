import { tab } from "../module/tab/tab-primitives"
import { TabContent, TabsWithContent } from "../module/tab/Tabs"
import { type MetadataMetadataItem, type ResoledMetadata } from "../lib/get-resolved-metadata"
import { ExternalIcon, InlineLink, MetadataField, MetadataRowContent, Separator } from "./SummaryPanelField"
import { Suspense, type ComponentProps } from "react"
import { FaviconPreview, FaviconSummary, IconListPreviewMetadataItem, isValidIcon } from "./Favicon"
import { appFetch } from "../lib/fetch"
import { px } from "../lib/unit"
import { cn } from "lazy-cn"
import { getImageSizeFromResponse } from "../lib/image-size"
import type { SiteMetadata } from "../page.data"
import { OpengraphMetadata } from "./meta-info-panels/OpenGraph"
import { RobotsSummary } from "./advanced/Robots"
import { SitemapSummary } from "./advanced/Sitemap"
import { getSitemap } from "../lib/get-sitemap"
import { getRobots } from "../lib/get-robots"
import { CollapsibleRow } from "../lib/Collapsible"

export async function MetaInfoPanel(props: { metadata: SiteMetadata }) {
  const metadata = props.metadata.resolved
  return (
    <>
      <TabsWithContent
        id="info"
        className="fadeInFromLeft-0 self-start"
        tabs={[
          tab("General", <MetaCardContent key="g"><SummaryMetadata m={metadata} /></MetaCardContent>),
          tab("Open Graph", <MetaCardContent key="og"><OpengraphMetadata m={metadata} /></MetaCardContent>),
          tab("Twitter", <MetaCardContent key="t"><TwitterMetadata m={metadata} /></MetaCardContent>),
          tab("Icons", <MetaCardContent key="i"><IconMetadata m={metadata} /></MetaCardContent>),
          tab("Robots",
            <MetaCardContent key="r">
              <RobotsSummary metadata={metadata} getRobots={getRobots} />
              <Separator />
              <SitemapSummary metadata={metadata} getSitemap={getSitemap} getRobots={getRobots} />
            </MetaCardContent>
          )
        ]}
      >
        <MetaCard>
          <TabContent />
        </MetaCard>
      </TabsWithContent>
    </>
  )
}

/**
 * Outer shell of the Meta Info Panel Content (below the tab list)
 */
export function MetaCard({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("card fadeIn-0 overflow-clip", className)} {...props} />
}

/**
 * The inner content that changes as the [current tab] changes
 */
function MetaCardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("card-content meta-info-grid fadeBlurIn-100", className)} {...props} />
}


async function SummaryMetadata(props: {
  m: ResoledMetadata
}) {
  const m = props.m
  return (<>
    <MetadataField data={m.general.title} />
    <MetadataField data={m.general.description} />
    <MetadataField data={m.general.author}>
      {m.general.author.values.map((item, i, arr) => {
        return <span key={i}>
          {item.resolvedUrl ? <InlineLink value={item.value} href={item.resolvedUrl} className="inline text-base" /> : item.value}
          {i !== arr.length - 1 ? ", " : null}
        </span>
      })}
    </MetadataField>
    <MetadataField data={m.general.favicons}>
      <Suspense fallback="Loading...">
        <CollapsibleRow data-opened={false} className="expand-row-200">
          <FaviconSummary data={m.general.favicons} baseUrl={m.rawUrl} />
        </CollapsibleRow>
      </Suspense>
    </MetadataField>
    <Separator />
    <MetadataField data={m.og.title} />
    <MetadataField data={m.og.description} />
    <MetadataField data={m.og.image} />
    <MetadataField data={m.og.url} />
    <MetadataField data={m.og.type} />
    <MetadataField data={m.og.siteName} />
    <Separator />
    <MetadataField data={m.twitter.title} />
    <MetadataField data={m.twitter.description} />
    <MetadataField data={m.twitter.card} />
    <MetadataField data={m.twitter.image} />
    <Separator />
    <MetadataField data={m.general.viewport} />
    <MetadataField data={m.general.url} />
    <MetadataField data={m.general.robots} />
    <MetadataField data={m.general.applicationName} />
    <MetadataField data={m.general.keywords} />
    <MetadataField data={m.general.generator} />
    <MetadataField data={m.general.license} />
    <Separator />
    <MetadataField data={m.general.colorScheme} />
    <MetadataField data={m.general.colorTheme}>
      <ColorThemes data={m.general.colorTheme} />
    </MetadataField>
    <MetadataField data={m.general.formatDetection} />
  </>)
}


function ColorThemes(
  props: { data: MetadataMetadataItem }
) {
  return (
    <>
      {props.data.values?.length === 0 ? <span className="meta-mute">-</span> : null}
      {props.data.values?.map((item, i) => {
        return (
          <div key={i} className="flex gap-1 items-start my-1">
            <div
              className="w-4 h-4 rounded-sm border border-border shrink-0"
              style={{
                background: item.value
              }}
            />
            <span className="text-xs">{item.value}</span>
            <span className="text-xs">{item.label}</span>
          </div>
        )
      })}
    </>
  )
}



function TwitterMetadata(props: { m: ResoledMetadata }) {
  const t = props.m.twitter
  return (<>
    <MetadataField data={t.title} />
    <MetadataField data={t.description} />
    <MetadataField data={t.card} />
    <MetadataField data={t.image} />
    <MetadataField data={t.imageAlt} />
    <Separator />
    <MetadataField data={t.site} />
    <MetadataField data={t.siteId} />
    <Separator />
    <MetadataField data={t.creator} />
    <MetadataField data={t.creatorId} />
    <Separator />
    <MetadataField data={t.player} />
    <MetadataField data={t.playerWidth} />
    <MetadataField data={t.playerHeight} />
    <MetadataField data={t.playerStream} />
    <Separator />
    <MetadataField data={t.appCountry} />
    <Separator />
    <MetadataField data={t.appNameIphone} />
    <MetadataField data={t.appIdIphone} />
    <MetadataField data={t.appUrlIphone} />
    <Separator />
    <MetadataField data={t.appNameIpad} />
    <MetadataField data={t.appIdIpad} />
    <MetadataField data={t.appUrlIpad} />
    <Separator />
    <MetadataField data={t.appNameGoogleplay} />
    <MetadataField data={t.appIdGoogleplay} />
    <MetadataField data={t.appUrlGoogleplay} />
  </>)
}

function IconMetadata(props: {
  m: ResoledMetadata
}) {

  return (
    <>
      <MetadataField data={{ label: "icon", value: undefined }}
        putInfoBesideLabel
        contentProps={{ className: "col-span-2 col-span-2 row-start-[10] mt-2 grid grid-cols-1 gap-2" }}>
        <Suspense fallback="Loading...">
          {(async () => {
            if (!props.m.general.favicons.values.length) return <div className="opacity-40">-</div>

            const rawFavicons = props.m.general.favicons.values

            const favicons: {
              source: string,
              size: string,
              resolvedSize: number | null,
              value: string,
              type: string,
              resolvedUrl: string,
            }[] = []

            for (const f of rawFavicons) {
              const validUrl = await isValidIcon(f.resolvedUrl)
              if (validUrl) {
                const resolvedSize = f ? parseInt(f.sizes ?? "") : NaN
                favicons.push({
                  source: f.source ?? "?",
                  size: f.sizes ?? "size undefined",
                  value: f.value ?? "value undefined (huh?)",
                  type: f.type ?? "type undefined",
                  resolvedSize: isNaN(resolvedSize) ? null : resolvedSize,
                  resolvedUrl: validUrl
                })
                continue
              }
            }

            return <>{favicons.map((item, i) => {
              const { source, size, value, resolvedUrl, resolvedSize, type } = item
              return <div key={i} className="flex gap-2 items-start flex-wrap">
                <FaviconPreview
                  imgProps1={{ style: { height: resolvedSize ? px(resolvedSize) : undefined, width: resolvedSize ? px(resolvedSize) : undefined } }}
                  imgProps2={{ style: { height: resolvedSize ? px(resolvedSize) : undefined, width: resolvedSize ? px(resolvedSize) : undefined } }}
                  src={resolvedUrl} />
                <div className="text-xs meta-info-field-value break-words min-w-40 basis-0 grow">
                  {source}<br />

                  <a className={cn("link-underline block leading-snug", value.startsWith('data:') && "line-clamp-3")} target="_blank" href={resolvedUrl}>
                    {value} <ExternalIcon />
                  </a>

                  {size ?? "size undefined"}<br />
                  {type ?? "size undefined"}<br />
                </div>
              </div>
            })}
            </>
          })()}
        </Suspense>

      </MetadataField>
      <hr />
      <IconListPreviewMetadataItem data={props.m.icons.appleTouchIcons} />
      <hr />
      <IconListPreviewMetadataItem data={props.m.icons.appleTouchIconsPrecomposed} />
    </>
  )
}

