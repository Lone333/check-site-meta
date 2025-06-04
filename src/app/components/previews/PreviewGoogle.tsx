import type { ComponentProps, SVGProps } from "react";
import { MessageList, PreviewMenu, PreviewPanelContent, type PreviewMessages } from "./Preview";
import { cn } from "lazy-cn";
import { PreviewFrame, PreviewThemeSwitcher } from "./Preview.client";
import type { ResoledMetadata } from "@/app/lib/get-resolved-metadata";
import { AppImage } from "@/app/module/image/Image";
import { MaterialSymbolsLightModeOutline, MaterialSymbolsDarkModeOutline } from "@/app/theme-switch";

export async function PreviewGoogle({ metadata, className, ...props }: ComponentProps<"div"> & {
  metadata: ResoledMetadata
}) {
  const { messages, data } = await getGooglePreview(metadata)

  const PreviewSection = (() => {
    if (!data) return null
    return (
      <PreviewFrame
        themeId="t-google"
        style={{
          "--font": "Arial, sans-serif",
        }}
        themes={{
          'default': {
            "--bg": "#ffffff",
            "--text-site-name": "#202124",
            "--text-url": "#4d5156",
            "--text-desc": "#474747",
            "--accent": "#1a0dab",
            "--border": "#dadce0",
            "--icon-web-bg": "#e2eeff",
            "--icon-web": "#1a0dab",
            "--icon-menu": "#4d5156",
          },
          'dark': {
            "--bg": "#101218",
            "--text-site-name": "#dadce0",
            "--text-url": "#bdc1c6",
            "--text-desc": "#cdcdcd",
            "--accent": "#7eaaff",
            "--border": "#9aa0a6",
            "--icon-web-bg": "#697988",
            "--icon-web": "#697988",
            "--icon-menu": "#9aa0a6",
          }
        }}
      >
        <div className="relative flex flex-col justify-start text-px-14 font-[400] leading-[1.58]">
          <div className="basis-full grow shrink min-w-0">
            <div className="flex flex-col-reverse leading-[1.3] ">
              <h3 className="fadeIn-50 mt-px-3 pt-px-5 text-(--accent) text-px-20 line-clamp-1">
                {data.title}
              </h3>
              <div className="max-w-[calc(100%_-_20px)] fadeIn-0 flex w-full">
                <div className="flex items-center overflow-hidden">
                  <div className="mr-px-12 inline-block">
                    <div className="w-px-26 h-px-26 bg-white border border-(--border) rounded-[50%] overflow-clip flex items-center justify-center">
                      <AppImage
                        src={data.favicon}
                        className={cn(
                          data.fullWidthFavicon ? "w-px-26 h-px-26" : "w-px-18 h-px-18",
                        )}
                        onErrorFallback={<NoFaviconIcon className="w-px-18 h-px-18 fill-(--icon-web)" />}
                      />
                    </div>
                  </div>
                  <div className="overflow-hidden max-w-[22rem]">
                    <div className="leading-[20px] text-(--text-site-name) line-clamp-1">
                      {data.site}
                    </div>
                    <div className="text-px-12 text-(--text-url) line-clamp-1">
                      {new URL(data.url).origin}
                      {(() => {
                        const pathname = new URL(data.url).pathname
                        const arr = pathname.split("/").filter(Boolean)
                        if (arr.length === 0) return ""
                        const separator = " › "
                        return <span>{separator}{arr.join(separator)}</span>
                      })()}
                    </div>
                  </div>
                </div>
                <div className="self-end ml-2 translate-y-0.5">
                  <DotsMenu className="fill-(--icon-menu) w-px-18 h-px-18" />
                </div>
              </div>
            </div>
          </div>
          <div className="basis-full shrink grow fadeIn-100">
            <div className="line-clamp-2 overflow-hidden text-px-14 font-[400] text-(--text-desc)">
              {data.description}
            </div>
          </div>
        </div>
      </PreviewFrame>
    )
  })

  return (
    <PreviewPanelContent
      PreviewSection={
        <>
          <PreviewSection />
          <PreviewMenu>
            <PreviewThemeSwitcher
              themeId="t-google"
              themes={[
                { key: "default", icon: <MaterialSymbolsLightModeOutline /> },
                { key: "dark", icon: <MaterialSymbolsDarkModeOutline /> },
              ]} />
          </PreviewMenu>
        </>
      }
      PreviewInfoContent={
        <>
          <MessageList messages={messages} />
        </>
      }
    />
  )
}

async function getGooglePreview(metadata: ResoledMetadata) {
  const m = metadata

  const messages: PreviewMessages = []

  const data = {
    title: m.general.title.value ?? m.og.title.value ?? m.twitter.title.value,
    description:
      m.general.description.value ??
      m.og.description.value ??
      m.twitter.description.value,
    site: m.og.siteName.value ?? m.twitter.site.value ?? m.general.title.value ?? new URL(m.rawUrl).hostname, // Google might infer from domain if missing
    url: m.general.url.value ?? m.rawUrl,
    favicon: m.general.favicons.values[0].resolvedUrl,
    fullWidthFavicon: false,
  }

  if (!data.title) {
    return { messages: [["error", "Title Metadata is required to show a preview."]] as PreviewMessages }
  }
  if (!data.description) {
    messages.push(["warn", "Description Metadata is recommended for better visibility."])
    // data.description = "No description provided."
  }
  if ((data.description ?? '').length < 50) {
    messages.push(["warn", "Description is too short. It may not show up properly in search results. (50-160 characters recommended)"])
  }
  if (!data.site) {
    messages.push(["warn", "Site Name is recommended for better visibility."])
    data.site = new URL(data.url).hostname
  }
  if (m.icons.appleTouchIcons.values.length > 0) {
    data.fullWidthFavicon = true
    messages.push(['info', 'Apple Touch Icon or Favicon.ico detected. Favicon will be displayed in full size.'])
  } else {
    messages.push(['info', 'No Apple Touch Icon or Favicon.ico detected. Favicon will be displayed in 18x18 size.'])
  }

  messages.push(['info', 'Preview is generated based on the provided metadata. Actual appearance may vary.'])

  return {
    messages,
    data,
  }
}

// Kobee1203/schema-org-java: Java library for working with
// How can http://schema.org be used in JSON-LD's @context
// Does Google indexing support schema.org as JSON-LD
// JSON-LD for availability should be “https://schema.org
// Jakarta Globe - breaking news today | Your City, Your World
// Jakarta Sport Festival 2024 Tuntas Digelar, Perkenalkan
// What is the longest title ever held by any individual in your



function NoFaviconIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
  )
}
function DotsMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
  )
}