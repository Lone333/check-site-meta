import type { ComponentProps } from "react";
import { MessageList, PreviewMenu, PreviewPanelContent, type PreviewMessages } from "./Preview";
import { PreviewFrame } from "./Preview.client";
import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";

export async function PreviewWhatsapp(
  { metadata, className, ...props }: ComponentProps<"div"> & {
    metadata: ResoledMetadata
  }
) {

  const PreviewSection = (() => {
    return (
      <PreviewFrame
        themeId="t-whatsapp"
        style={{

        }}
        themes={{
          'default': {

          },
        }}
      >
        <div className="rl">

        </div>
      </PreviewFrame>
    )
  })

  return (
    <PreviewPanelContent
      PreviewSection={
        <>
          <PreviewSection />
          {/* <PreviewMenu>
            <PreviewThemeSwitcher
              themeId="t-google"
              themes={[
                tab("default", <MaterialSymbolsLightModeOutline />),
                tab("dark", <MaterialSymbolsDarkModeOutline />),
              ]} />
          </PreviewMenu> */}
        </>
      }
      PreviewInfoContent={
        <>
          <MessageList messages={[]} />
        </>
      }
    />
  )

}

async function getWhatsappPreview(metadata: ResoledMetadata) {
  const m = metadata

  const messages: PreviewMessages = []

  const data = {
    title: m.twitter.title.value ?? m.og.title.value ?? m.general.title.value,
    description: m.og.description.value ?? m.twitter.description.value ?? m.general.description.value
  }

  if (!data.title && !data.description) {
    return { messages: [["error", "Title or Description Metadata is required to show a whatsapp preview."]] as PreviewMessages }
  }

  return (
    <></>
  )
}