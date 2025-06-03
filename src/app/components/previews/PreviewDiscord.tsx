import type { ComponentProps, SVGProps } from "react";
import { cn } from "lazy-cn";
import imageSize from "image-size";
import { MessageList, PreviewMenu, PreviewPanelContent, type PreviewMessages } from "./Preview";
import { PreviewFrame, PreviewThemeSwitcher } from "./Preview.client";
import { appFetch } from "@/app/lib/fetch";
import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";
import { validateHex } from "@/app/lib/hex";
import { AppImage } from "@/app/module/image/Image";
import { MaterialSymbolsDarkModeOutline, MaterialSymbolsLightModeOutline } from "@/app/theme-switch";

export async function PreviewDiscord(
  { metadata, className, ...props }: ComponentProps<"div"> & {
    metadata: ResoledMetadata
  }
) {
  const { messages, data, crashed } = await getDiscordPreview(metadata)

  const PreviewSection = (() => {
    if (!data) return null
    if (crashed) return null
    return <PreviewFrame themeId="t-discord" {...props} className={cn("bg-[var(--bg)] font-discord", className)}
      style={{}}
      themes={{
        default: { // Ash
          "--bg": "oklab(0.303553 0.00292034 -0.0103036)",
          "--embed-bg": "oklab(0.339495 0.00330827 -0.0116803)",
          "--embed-border": "oklab(0.678888 0.00325716 -0.011175 / 0.2)",
          "--embed-border-left": data.themeColor ?? "var(--embed-border)",
          "--embed-site-name": "oklab(0.883042 0.00118408 -0.00389016)",
          "--embed-author": "oklab(0.964355 0.000418752 -0.00125641)",
          "--embed-link": "oklab(0.74783 -0.0289609 -0.111271)",
          "--embed-text": "oklab(0.883042 0.00118408 -0.00389016)",
        },
        dark: { // Ash
          "--bg": "oklab(0.219499 0.00211129 -0.00744916)",
          "--embed-bg": "oklab(0.262384 0.00252247 -0.00889932)",
          "--embed-border": "oklab(0.678888 0.00325716 -0.011175 / 0.121569)",
          "--embed-border-left": data.themeColor ?? "var(--embed-border)",
          "--embed-site-name": "oklab(0.952331 0.000418991 -0.00125992)",
          "--embed-author": "oklab(0.916613 0.00117499 -0.00385195)",
          "--embed-link": "oklab(0.670158 -0.038477 -0.141411)",
          "--embed-text": "oklab(0.952331 0.000418991 -0.00125992)",
        },
        onyx: { // Ash
          "--bg": "oklab(0.129689 0.00136997 -0.00485864)",
          "--embed-bg": "oklab(0.190993 -0.000410579 -0.0043043)",
          "--embed-border": "oklab(0.678888 0.00325716 -0.011175 / 0.239216)",
          "--embed-border-left": data.themeColor ?? "var(--embed-border)",
          "--embed-site-name": "oklab(0.694913 0.00284365 -0.00970763)",
          "--embed-author": "oklab(0.940553 0.00079456 -0.00254363)",
          "--embed-link": "oklab(0.623584 -0.0424406 -0.161664)",
          "--embed-text": "oklab(0.894999 0.000801653 -0.00257665)",
        },
        light: {
          "--bg": "oklab(0.988044 0.0000450313 0.0000197887)",
          "--embed-bg": "oklab(0.999994 0.0000455678 0.0000200868)",
          "--embed-border": "oklab(0.678888 0.00325716 -0.011175 / 0.278431)",
          "--embed-border-left": data.themeColor ?? "var(--embed-border)",
          "--embed-site-name": "oklab(0.335195 0.00285903 -0.0100273)",
          "--embed-author": "oklab(0.115632 0.000887424 -0.00309767)",
          "--embed-link": "oklab(0.569301 -0.0479858 -0.183635)",
          "--embed-text": "oklab(0.335195 0.00285903 -0.0100273)",
        },
      }}
    >
      <div className={cn(
        "fadeIn-100",
        "bg-[var(--embed-bg)] border-[1px] border-(--embed-border) border-l-[0.25rem]  border-l-(--embed-border-left) rounded-[0.25rem] grid",
        "max-w-max"
      )}>
        <div className={cn(
          "pt-[.5rem] pr-[1rem] pb-[1rem] pl-[.75rem]  grid",
          "grid-cols-[auto_min-content]",
          "grid-rows-[auto]",
          "max-w-[27rem]"
        )}>
          {data.site && (
            <div className="fadeIn-0 mt-2 col-[1/1] text-(--embed-site-name) text-[.75rem] font-[400] leading-[1rem]">
              {data.site}
            </div>
          )}
          <div className="fadeIn-50 mt-2 col-[1/1] break-words min-w-0">
            <a className="text-(--embed-link) text-[1rem] font-[600] leading-[1.375rem] min-w-0 line-clamp-2">
              {data.title}
            </a>
          </div>
          <div className="fadeIn-100 mt-2 col-[1/1] text-(--embed-text) text-[0.875rem] font-[400] leading-[1.125rem] whitespace-pre-wrap break-words min-w-0">
            {data.description}
          </div>
          {data.image && data.type === "summary" && (
            <div className="fadeIn-150 row-[1/8] col-[2/2] ml-4 mt-2 max-w-20 max-h-20 justify-items-end h-full flex rounded-[.25rem]">
              <AppImage src={data.image} alt="" className="w-min h-min max-w-none max-h-[inherit] object-contain object-top rounded-[.25rem] overflow-hidden" />
            </div>
          )}
          {data.image && data.type === "summary_large_image" && (
            <div className="fadeIn-150 col-[1/1] mt-4 w-full flex object-contain rounded-[.25rem] overflow-hidden max-w-fit">
              <div className="">
                <AppImage src={data.image} alt="" className="max-w-none w-full max-h-[300px]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </PreviewFrame>

  })

  return (
    <PreviewPanelContent
      PreviewSection={
        <>
          <PreviewSection />
          <PreviewMenu>
            <PreviewThemeSwitcher
              themeId="t-discord"
              themes={[
                { key: "default", icon: <MaterialSymbolsDarkModeOutline /> },
                { key: "dark", icon: <MaterialSymbolsNightsStayOutline /> },
                { key: "onyx", icon: <IcRoundCloudQueue /> },
                { key: "light", icon: <MaterialSymbolsLightModeOutline /> },
              ]}
            />
          </PreviewMenu>
        </>
      }
      PreviewInfoContent={
        <MessageList messages={messages} />
      }
    />
  )
}



export function MaterialSymbolsNightsStayOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M13.1 23h-2.6l.5-.312q.5-.313 1.088-.7t1.087-.7l.5-.313q2.025-.15 3.738-1.225t2.712-2.875q-2.15-.2-4.075-1.088t-3.45-2.412t-2.425-3.45T9.1 5.85Q7.175 6.925 6.088 8.813T5 12.9v.3l-.3.138q-.3.137-.663.287t-.662.288l-.3.137q-.05-.275-.062-.575T3 12.9q0-3.65 2.325-6.437T11.25 3q-.45 2.475.275 4.838t2.5 4.137t4.138 2.5T23 14.75q-.65 3.6-3.45 5.925T13.1 23M6 21h4.5q.625 0 1.063-.437T12 19.5t-.425-1.062T10.55 18h-1.3l-.5-1.2q-.35-.825-1.1-1.312T6 15q-1.25 0-2.125.863T3 18q0 1.25.875 2.125T6 21m0 2q-2.075 0-3.537-1.463T1 18t1.463-3.537T6 13q1.5 0 2.738.813T10.575 16Q12 16.05 13 17.063t1 2.437q0 1.45-1.025 2.475T10.5 23z"></path></svg>
  )
}

export function IcRoundCloudQueue(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}<path fill="currentColor" d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3"></path></svg>
  )
}

async function getDiscordPreview(metadata: ResoledMetadata) {
  const m = metadata

  const messages: PreviewMessages = []
  let crashed = false

  const data = {
    site: m.og.siteName.value, // check if it fallbacks to twitter.site.value
    title: m.twitter.title.value ?? m.og.title.value ?? m.general.title.value,
    description: m.og.description.value ?? m.twitter.description.value ?? m.general.description.value,
    image: m.twitter.image.resolvedUrl ?? m.og.images.values.at(-1)?.resolvedUrl ?? m.og.image.resolvedUrl,
    type: m.twitter.card.value ?? "summary",
    themeColor: m.general.colorTheme.values.at(-1)?.value
  }

  if (!data.title) {
    return { messages: [["error", "Title Metadata is required to show a preview."]] as PreviewMessages }
  }

  // Kudos to @riskymh
  if (data.title.length > 67) {
    data.title = data.title.slice(0, 67) + "..."
    messages.push(["info", "Title was shortened to 67 characters."])
  }
  if ((data.description?.length ?? 0) > 347) {
    data.description = data.description?.slice(0, 347) + "..."
    messages.push(["info", "Description was shortened to 347 characters."])
  }
  if ((data.site?.length ?? 0) > 256) {
    data.site = data.site?.slice(0, 256) + "..."
    messages.push(["error", "Site name is too long. Embed will not show if site name is longer than 256 characters."])
  }

  try {
    if (!data.image) throw 0
    const res = await appFetch(data.image)
    const buffer = Buffer.from(await res.arrayBuffer()); // Convert once
    const { type } = imageSize(buffer)

    if (type === "png") {
      messages.push(["info", "If the image is animated (APNG), Only the first frame will be shown."])
    }
  } catch (error) { }

  if (data.themeColor) {
    const res = validateHex(data.themeColor)
    if (!res.valid) {
      messages.push(["error", `Invalid color theme value: ${ data.themeColor }`])
      data.themeColor = undefined
    }
    if (res.valid) {
      if (res.shortHex || (res.shortHex && res.withAlpha)) {
        messages.push(["warn", `Short Hex values (${ data.themeColor }) will be parsed incorrectly by Discord. Consider using full hex values.`])
        data.themeColor = '#' + data.themeColor?.split('#')[1].padStart(6, '0')
      }
      if (!res.shortHex && res.withAlpha) {
        messages.push(["error", `8 digit hex values (${ data.themeColor }) will cause the preview to not show up. Consider using 6 digit hex values.`])
        data.themeColor = undefined
        crashed = true
      }
      if (['#000', '#000000'].includes(data.themeColor ?? "")) {
        messages.push(["warn", `Black color theme values (${ data.themeColor }) will be parsed incorrectly by Discord. Consider using a different color.`])
        data.themeColor = undefined
      }
    }
  }

  return {
    messages,
    data,
    crashed
  }

}



