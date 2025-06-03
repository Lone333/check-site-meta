import { cn } from "lazy-cn";
import type { ComponentProps } from "react";
import { AppImage } from "../module/image/Image";
import { ExternalIcon, MetadataField } from "./SummaryPanelField";
import type { ResoledMetadata } from "../lib/get-metadata-field-data";
import { px } from "../lib/unit";
import { appFetch } from "../lib/fetch"
import { getImageSizeFromResponse } from "../lib/image-size"

// Flow:
// 
// resolved metadata
//  ↓
// resolved url
//  ↓
// isValidIcon
//  ↓
// get size



export async function isValidIcon(url?: string) {
  if (!url) return false
  try {
    const res = await appFetch(url)
    if (res.headers.get('content-type') === 'image/svg+xml') return url
    if (res.headers.get('content-type')?.startsWith('text/')) return false

    const imageSizeRes = await getImageSizeFromResponse(res)
    if (!imageSizeRes.imageSize) return false
    return url
  } catch (error) {
    return false
  }
}

export async function FaviconSummary(props: { data: ResoledMetadata['general']['favicons'], baseUrl: string }) {
  const favicons = props.data.values
  if (!favicons || favicons.length === 0) return <span className="meta-mute">-</span>

  let favicon: {
    source: string,
    size: string,
    resolvedSize: number | null,
    type: string,
    value: string,
    resolvedUrl: string,
  } | null = null

  for (const f of favicons) {
    const validUrl = await isValidIcon(f.resolvedUrl)
    if (validUrl) {
      const resolvedSize = f.sizes ? parseInt(f.sizes) : NaN
      favicon = {
        source: f.source ?? "?",
        size: f.sizes ?? "size undefined",
        value: f.value ?? "value undefined (huh?)",
        type: f.type ?? "type undefined",
        resolvedSize: isNaN(resolvedSize) ? null : resolvedSize,
        resolvedUrl: validUrl
      }
      break
    }
  }

  if (!favicon) return <span className="meta-mute">-</span>

  return (
    <div className="flex *:first:shrink-0 gap-2 items-start">
      <FaviconPreview src={favicon.resolvedUrl} />
      <div>
        <div className="text-xs">
          {favicon.source}
        </div>
        <a className="link-underline block leading-snug text-sm" target="_blank" href={favicon.resolvedUrl}>
          {favicon.value} <ExternalIcon />
        </a>
        <div className="text-xs">
          <div>{favicon.type}</div>
          <span>{favicon.size}</span>
        </div>
      </div>
    </div>
  )
}



export function FaviconPreview(props: {
  src: string,
  imgProps1?: ComponentProps<"img">
  imgProps2?: ComponentProps<"img">
}) {
  return (
    <div className={cn("image-frame flex items-start")}>
      <div className="p-1 bg-zinc-100 shrink w-12 h-12">
        <AppImage
          {...props.imgProps1}
          src={props.src}
          className={cn("object-contain w-full h-full", props.imgProps1?.className)}
        />
      </div>

      <div className="p-1 bg-neutral-600 shrink w-12 h-12">
        <AppImage
          {...props.imgProps2}
          src={props.src}
          className={cn("object-contain w-full h-full", props.imgProps2?.className)}
        />
      </div>
    </div>
  )
}


export function IconListPreviewMetadataItem(props: {
  data: ResoledMetadata['icons']['appleTouchIcons']
}) {
  const item = props.data
  return (
    <MetadataField data={item}
      putInfoBesideLabel
      containerProps={{ className: "flex! flex-col" }}
      contentProps={{ className: "col-span-2 row-start-[10] order-10 mt-2" }}
    >
      <div className="flex gap-2 items-end flex-wrap ">
        {(() => {
          const items = item.values
          if (!items?.length) return (<div className="meta-mute">-</div>)

          return <>
            {items?.map((item, i) => {
              if (!item.value) return <></>
              const size = item.label
              const resolvedSizes = item.label ? parseInt(item.label) || null : null

              return <div key={i} className="flex flex-col gap-1 items-center justify-center text-center">
                <div className="image-frame w-auto shrink-0"
                  style={{
                    width: resolvedSizes ? px(resolvedSizes) : undefined,
                    height: resolvedSizes ? px(resolvedSizes) : undefined
                  }}
                >
                  <AppImage src={item.resolvedUrl} />
                </div>
                {size ? <span className="text-xs">{size}<br /></span> : null}
              </div>
            })}
          </>
        })()}
      </div>

      <div className="flex flex-col mt-2 meta-info-field-value">
        {(() => {
          const items = item.values

          if (!items?.length) {
            return (<div className="meta-mute">-</div>)
          }

          return <>
            {items?.map((item, i) => {
              if (!item.value) return null
              return <div key={i} className="text-xs my-0.5">
                <a className={cn("link-underline", item.value.startsWith('data:') && "line-clamp-3")}>
                  {item.value} <ExternalIcon />
                </a>
              </div>
            })}
          </>
        })()}
      </div>
    </MetadataField>
  )
}