import type { ComponentProps, SVGProps } from "react";
import { cn } from "lazy-cn";
import { PreviewPanelContent, MessageList, type PreviewMessages, PreviewMenu } from './Preview';
import { PreviewFrame, PreviewThemeSwitcher } from './Preview.client';
import { appFetch } from "@/app/lib/fetch";
import type { ResoledMetadata } from "@/app/lib/get-resolved-metadata";
import { getImageSizeFromResponse } from "@/app/lib/image-size";
import { AppImage } from "@/app/module/image/AppImage";
import { MaterialSymbolsLightModeOutline, MaterialSymbolsDarkModeOutline } from "@/app/theme-switch";

export async function PreviewTwitter(
  { metadata, className, ...props }: { metadata: ResoledMetadata } & ComponentProps<"div">
) {

  const { messages, type, image, data } = await getTwitterPreview(metadata)

  const PreviewSection = (() => {
    if (type === "summary_large_image") {
      return (
        <TwitterPreviewFrame>
          <div className={cn("flex flex-col gap-y-1 max-w-[32.375rem] w-[inherit] leading-5 font-twitter font-[400] subpixel-antialiased", className)} {...props}>
            <div className="rounded-2xl relative border border-(--border) overflow-hidden aspect-[120/63]">
              <AppImage
                width="1200"
                height="630"
                className="h-full object-cover"
                src={image?.url}
                firstFrameGif={image?.format === "gif"}
              />
              <div className="fadeIn-50 absolute bottom-3 left-3 px-2 bg-(--overlay-bg) text-(--overlay-text) rounded-sm line-clamp-1">
                {data.title}
              </div>
            </div>
            <div className="fadeIn-100 text-[0.813rem] text-(--text-description)">
              From {data.url}
            </div>
          </div>
        </TwitterPreviewFrame>
      )
    } else if (type === "summary") {
      return (
        <TwitterPreviewFrame>
          <div className="max-w-[32.375rem]  h-[8.188rem] w-full rounded-2xl border border-(--border) flex overflow-hidden bg-(--bg) ">
            <div data-noimg={!!image ? "" : undefined} className="w-[6.875rem] min-[554px]:w-[8.125rem] max-w-full border-r border-(--border) shrink-0 flex items-center justify-center data-noimg:bg-(--image-noimg-bg)">
              {
                image
                  ? <AppImage
                    className="w-full h-full object-cover bg-white"
                    firstFrameGif={image?.format === "gif"}
                    src={image.url} />
                  : <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[2em] fill-current align-bottom select-none max-w-full relative text-(--image-noimg-fill) inline-block"><g><path d="M1.998 5.5c0-1.38 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.12 2.5 2.5v13c0 1.38-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.12-2.5-2.5v-13zm2.5-.5c-.276 0-.5.22-.5.5v13c0 .28.224.5.5.5h15c.276 0 .5-.22.5-.5v-13c0-.28-.224-.5-.5-.5h-15zM6 7h6v6H6V7zm2 2v2h2V9H8zm10 0h-4V7h4v2zm0 4h-4v-2h4v2zm-.002 4h-12v-2h12v2z"></path></g></svg>
              }
            </div>
            <div className="p-3 flex flex-col gap-0.5 justify-center font-twitter text-[0.9375rem] leading-5  font-[400] subpixel-antialiased">
              <div className="text-(--text-description) fadeIn-50">
                {data.url}</div>
              <div className="text-(--text-title) line-clamp-1 fadeIn-100">
                {data.title}</div>
              <div className="text-(--text-description) line-clamp-2 fadeIn-150">
                <span>
                  {data.description}
                </span>
              </div>
            </div>
          </div>
        </TwitterPreviewFrame>
      )
    } else {
      return (null)
    }
  })

  return (
    <PreviewPanelContent
      PreviewSection={<PreviewSection />}
      PreviewInfoContent={
        <>
          {image && (<div className="break-word text-xs text-foreground-muted-2">
            {image?.format}, {image?.width}✕{image?.height}, {image?.size} bytes, <span className="break-all">{image?.url}</span>
          </div>)}
          <MessageList messages={messages} />
        </>
      }
    />
  )
}

function TwitterPreviewFrame({ children }: { children: React.ReactNode }) {
  return <>
    <PreviewFrame
      themeId="t-twitter"
      className="items-center"
      style={{
        "--overlay-text": "white",
        "--overlay-bg": "rgba(0, 0, 0, 0.77)",
      }}
      themes={{
        "default": {
          "--bg": "white",
          "--border": "rgb(207, 217, 222)",
          "--image-noimg-bg": "rgb(247, 249, 249)",
          "--image-noimg-fill": "rgb(83, 100, 113)",
          "--text-title": "rgb(15, 20, 25)",
          "--text-description": "rgb(83, 100, 113)",
        },
        "dim": {
          "--bg": "rgb(21, 32, 43)",
          "--border": "rgb(56, 68, 77)",
          "--image-noimg-bg": "rgb(30, 39, 50)",
          "--image-noimg-fill": "rgb(139, 152, 165)",
          "--text-title": "rgb(247, 249, 249)",
          "--text-description": "rgb(139, 152, 165)",

        },
        "dark": {
          "--bg": "black",
          "--border": "rgb(47, 51, 54)",
          "--image-noimg-bg": "rgb(22, 24, 28)",
          "--image-noimg-fill": "rgb(113, 118, 123)",
          "--text-title": "rgb(231, 233, 234)",
          "--text-description": "rgb(113, 118, 123)",
        },
      }}
    >
      {children}
    </PreviewFrame>
    <PreviewMenu>
      <PreviewThemeSwitcher
        themeId="t-twitter"
        themes={[
          { key: "default", icon: <MaterialSymbolsLightModeOutline /> },
          { key: "dim", icon: <MaterialSymbolsPartlyCloudyDayOutlineRounded /> },
          { key: "dark", icon: <MaterialSymbolsDarkModeOutline /> },
        ]}
      />
    </PreviewMenu>
  </>
}


export function MaterialSymbolsPartlyCloudyDayOutlineRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M12 5q-.425 0-.712-.288T11 4V2q0-.425.288-.712T12 1t.713.288T13 2v2q0 .425-.288.713T12 5m4.95 2.05q-.275-.275-.275-.7t.275-.7l1.4-1.425q.3-.3.712-.3t.713.3q.275.275.275.7t-.275.7L18.35 7.05q-.275.275-.7.275t-.7-.275M20 13q-.425 0-.713-.288T19 12t.288-.712T20 11h2q.425 0 .713.288T23 12t-.288.713T22 13zm-1.65 6.775l-1.4-1.425q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l1.425 1.4q.3.3.3.712t-.3.713t-.712.3t-.713-.3M5.65 7.05L4.225 5.625q-.275-.275-.275-.7t.275-.7q.3-.3.713-.3t.712.3l1.4 1.425q.275.275.275.7t-.275.7t-.7.275t-.7-.275M6 19h4.5q.625 0 1.063-.437T12 17.5t-.425-1.062t-1.05-.438H9.25l-.5-1.2q-.35-.825-1.1-1.312T6 13q-1.25 0-2.125.875T3 16t.875 2.125T6 19m0 2q-2.075 0-3.537-1.463T1 16t1.463-3.537T6 11q1.5 0 2.738.813T10.575 14q1.45 0 2.438 1.075T14 17.65q-.05 1.425-1.062 2.388T10.5 21zm8-3.35q-.125-.5-.25-.975t-.25-.975q1.125-.475 1.813-1.475T16 12q0-1.65-1.175-2.825T12 8q-1.5 0-2.625.975T8.05 11.45q-.5-.125-1.025-.225T6 11q.35-2.2 2.063-3.6T12 6q2.5 0 4.25 1.75T18 12q0 1.925-1.1 3.463T14 17.65M12.025 12"></path></svg>)
}
export function ClarityExclamationCircleSolid(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...props}><path fill="currentColor" d="M18 6a12 12 0 1 0 12 12A12 12 0 0 0 18 6m-1.49 6a1.49 1.49 0 0 1 3 0v6.89a1.49 1.49 0 1 1-3 0ZM18 25.5a1.72 1.72 0 1 1 1.72-1.72A1.72 1.72 0 0 1 18 25.5" className="clr-i-solid clr-i-solid-path-1"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>)
}
export function ClarityExclamationTriangleSolid(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...props}><path fill="currentColor" d="M30.33 25.54L20.59 7.6a3 3 0 0 0-5.27 0L5.57 25.54A3 3 0 0 0 8.21 30h19.48a3 3 0 0 0 2.64-4.43Zm-13.87-12.8a1.49 1.49 0 0 1 3 0v6.89a1.49 1.49 0 1 1-3 0ZM18 26.25a1.72 1.72 0 1 1 1.72-1.72A1.72 1.72 0 0 1 18 26.25" className="clr-i-solid clr-i-solid-path-1"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>)
}



export async function getTwitterPreview(metadata: ResoledMetadata) {
  const m = metadata

  const messages: PreviewMessages = []

  const data = {
    title: m.twitter.title.value ?? m.og.title.value,
    description: m.twitter.description.value ?? m.og.description.value,
    imageUrl: m.twitter.image.value ?? m.og.images.values.at(-1)?.value ?? m.og.image.value,
    resolvedImageUrl: m.twitter.image.resolvedUrl ?? m.og.images.values.at(-1)?.resolvedUrl ?? m.og.image.resolvedUrl,
    imageAlt: m.twitter.imageAlt.value ?? m.og.imageAlt.value,
    url: new URL(m.rawUrl).host.replace('www.', ''),
    type: m.twitter.card.value ?? (m.og.type.value ? "summary" : undefined)
  }


  if (!data.title) {
    messages.push(["error", "Title Metadata is required. Please provide either twitter:title or og:title."])
    return { messages }
  }

  if (!m.twitter.card.value && !m.og.type.value) {
    messages.push(["error", "Twitter card type (`twitter:card`) or (`og:type`) is required. Please provide either twitter:card or any og:type value."])
    return { messages }
  }

  const {
    type,
    image
  } = await (async () => {

    const isLargeSummary = data.type === "summary_large_image"

    // check if image is valid
    // - must be less than 5mb
    // - must be of type JPG, PNG, WEBP and GIF
    // - if type === "summary_large_image", must be at least 300x157px
    // - otherwise, must be at least 120x120px
    // - must be less than 4096x4096px
    // - if image is invalid, fallback to summary

    const {
      fallbackToSummary,
      image
    } = await (async () => {
      if (!data.resolvedImageUrl) {
        if (isLargeSummary) {
          messages.push(["error", "Image is not provided. Image is required for summary_large_image. Defaulting to summary."])
        } else {
          messages.push(["info", "Image is not provided."])
        }
        return { fallbackToSummary: true }
      }

      const res = await appFetch(data.resolvedImageUrl).catch((err) => {
        // console.error("Error Procesing Twitter Image", err)
        return undefined
      })
      if (!res) {
        messages.push(["error", `Unable to fetch image from ${ data.resolvedImageUrl }. Defaulting to summary.`])
        return { fallbackToSummary: true }
      }

      const imageSizeRes = await getImageSizeFromResponse(res).catch((err) => {
        // console.error("Error Procesing Twitter Image", err)
        return undefined
      })
      if (!imageSizeRes?.imageSize) {
        messages.push(["error", `Unable to read image metadata.${ isLargeSummary ? " Defaulting to summary." : "" }`])
        return { fallbackToSummary: true }
      }

      const { buffer, imageSize: { width, height, type: format } } = imageSizeRes

      const imgData = { width, height, format, size: buffer.length, url: data.resolvedImageUrl }

      if (!width || !height || !format) {
        messages.push(["error", `Unable to read image metadata.${ isLargeSummary ? " Defaulting to summary." : "" }`])
        return { fallbackToSummary: true }
      }

      if (buffer.length > 5 * 1024 * 1024) {
        messages.push(["error", `Image must be less than 5mb (Current: ${ buffer.length }). Preview may fail to load. ${ isLargeSummary ? " Defaulting to summary." : "" }`])
        return { fallbackToSummary: true }
      }
      if (!format.match(/(jpeg|jpg|png|webp|gif)/)) {
        messages.push(["error", `Image must be of type JPG, PNG, WEBP or GIF (Current: ${ format }).${ isLargeSummary ? " Defaulting to summary." : "" }`])
        return { fallbackToSummary: true }
      }
      if (format === "gif") {
        messages.push(["info", `GIF images only show the first frame on Twitter. The preview may not be accurate.`])
      }
      if (format === "png") {
        messages.push(["info", `If the image is animated (APNG), Only the first frame will be shown.`])
      }
      if (format === "webp") {
        messages.push(["info", `If the image is an animated Webp, Only the first frame will be shown.`])
      }

      if (width > 4096 || height > 4096) {
        messages.push(["error", `Image must be smaller than 4096x4096px (Current: ${ width }x${ height }).${ isLargeSummary ? " Defaulting to summary." : "" }`])
        return { fallbackToSummary: true }
      }

      try {
        new URL(data.imageUrl ?? "")
      } catch (error) {
        messages.push(["error", `Image URL needs to be an absolute URL for the image to show up properly in Twitter preview. Defaulting to summary with no image.`])
        return { fallbackToSummary: true, image: null }
      }


      // Docs said 120x120 but ive seen 109x109 works...

      if (width >= 120 && height >= 120) {
        if (data.type === "summary_large_image" && (width < 300 || height < 157)) {
          messages.push(["error", `Image must be at least 300x157px for summary_large_image (Current: ${ width }x${ height }). Defaulting to summary.`])
          return { fallbackToSummary: true, image: imgData }
        }
        return { image: imgData }
      } else {
        messages.push(["error", `Image must be at least 120x120px (Current: ${ width }x${ height }). Image may not show properly. ${ isLargeSummary ? " Defaulting to summary." : "" }`])
        return { fallbackToSummary: true, image: imgData }
      }
    })()

    // Has title and description

    if (!data.type) {
      messages.push(["info", "Twitter card type (`twitter:card`) is not specified. Defaulting to summary."])
      return { type: "summary", image }
    }
    if (data.type !== "summary" && data.type !== "summary_large_image") {
      messages.push(["error", "Unable to preview twitter:card values other than `summary` or `summary_large_image`. (I have no idea what they look like)"])
      return { type: "summary", image }
    }

    // data.type === "summary_large_image" OR "summary"

    if (data.type === "summary") {
      return { type: "summary", image }
    }

    // data.type === "summary_large_image"

    if (fallbackToSummary) {
      return { type: "summary", image }
    }

    return { type: "summary_large_image", image }
  })()

  return {
    messages,
    type,
    image,
    data,
  }
}