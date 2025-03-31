import type { ComponentProps, SVGProps } from "react";
import { MessageList, PreviewMenu, PreviewPanelContent, type PreviewMessages } from "./Preview";
import { PreviewFrame, PreviewThemeSwitcher } from "./Preview.client";
import { cn } from "lazy-cn";
import { appFetch } from "@/app/lib/fetch";
import type { ResoledMetadata } from "@/app/lib/get-metadata-field-data";
import { getImageSizeFromResponse } from "@/app/lib/image-size";
import { AppImage } from "@/app/module/image/Image";
import { MaterialSymbolsLightModeOutline, MaterialSymbolsDarkModeOutline } from "@/app/theme-switch";

export async function PreviewFacebook(
  { metadata, className, ...props }: ComponentProps<"div"> & {
    metadata: ResoledMetadata
  }
) {

  const { messages, data, imageSize } = await getFacebookPreview(metadata)

  const PreviewSection = (() => {
    if (!data) return null
    return (
      <PreviewFrame
        themeId="t-facebook"
        className="justify-center antialiased"
        style={{
          '--card-radius': '8px',
          '--font-family': 'system-ui, -apple-system, "system-ui", ".SFNSText-Regular", sans-serif',
          '--card-shadow': '0 1px 2px rgba(0,0,0,.2)',
        }}
        themes={{
          'default': {
            '--bg': 'rgb(242, 244, 247)',
            '--card-bg': 'rgb(255, 255, 255)',
            '--main': 'rgb(8, 8, 9)',
            '--muted': 'rgb(101, 104, 108)',
            '--border': 'rgba(0, 0, 0, 0.1)',
            '--meta-bg': 'rgb(240, 242, 245)'
          },
          'dark': {
            '--bg': 'rgb(28, 28, 29)',
            '--card-bg': 'rgb(37, 39, 40)',
            '--main': 'rgb(226, 229, 233)',
            '--muted': 'rgb(176, 179, 184)',
            '--border': 'rgba(255, 255, 255, 0.05)',
            '--meta-bg': 'rgb(51, 51, 52)'
          },
        }}
      >
        <div className={cn(
          "bg-(--card-bg)",
          "rounded-(--card-radius)",
          'font-(family-name:--font-family)',
          'shadow-(--card-shadow)',
          'overflow-hidden'
        )}>
          {/* Header */}
          <div className='mb-px-12 px-px-12 pt-px-12 flex'>
            <div className="h-0 shrink-0 mr-px-8">
              <div className="size-px-40 rounded-full bg-slate-500/30" />
            </div>
            <div className="grow">
              <div className="-my-px-5 flex flex-col">
                <div className="my-px-1 leading-[1.333] text-px-15 font-[600] text-(--main)">
                  <div className="mt-1">John Doe</div>
                </div>
                <div className="my-px-1 leading-[1.2308] text-px-13 font-[600] text-(--muted)">
                  8 March at 15:00
                  <span className="font-[400]"> · </span>
                  <GlobeIcon className="size-px-12 fill-current inline" />
                </div>
              </div>
            </div>
          </div>
          {/* Body */}
          <div>
            {/* Text Content */}
            <div className="pt-px-4 px-px-12 pb-px-16">
              <div className="mb-px-1 -mt-px-1 text-px-15 font-[400] leading-[1.3333]  text-(--main)">
                just checked out this website and had such a great experience! the design is super clean, everything loads fast, and the content is really well-organized. found exactly what i was looking for without any hassle. definitely worth a visit if ure into discovering new creative tools!
              </div>
            </div>
            {/* Link Preview */}
            {
              data.type === 'large'
                ? (
                  <div>
                    {/* Image */}
                    {
                      data.image && (
                        <div className="relative">
                          <div className="aspect-[1000/522] border-t border-(--border) overflow-hidden object-center">
                            <AppImage src={data.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          {/* I floating action button */}
                          <IFloatingButton />
                        </div>
                      )
                    }
                    {/* Text */}
                    <div className="-mx-1.5 px-4 py-3 flex relative items-center shrink-0 flex-nowrap bg-(--meta-bg)">
                      <div className="-my-0.5 -mb-2 min-w-0 px-1.5">
                        <div className="mb-px-1 -mt-1 ">
                          <span className="uppercase text-px-13 font-[400] leading-[1.2308] text-(--muted)">
                            {new URL(data.url).hostname}
                          </span>
                        </div>
                        <div className="my-px-1">
                          <span className="text-px-17 font-[600] leading-[1.1765] text-(--main)">
                            {data.title}
                          </span>
                        </div>
                        {
                          data.image && (
                            <div className="my-px-1 text-(--muted) overflow-ellipsis overflow-hidden max-w-full">
                              <span className="text-px-15 font-[400] leading-[1.333] text-nowrap [text-wrap-mode:nowrap] p-0.25">
                                {data.description}
                              </span>
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                )
                : (
                  <div className={cn(
                    "flex flex-row items-stretch bg-(--meta-bg) border-y border-(--border) relative",
                    data.type === "small" && "h-[139px]",
                    data.type === "tall" && "max-h-[430px] h-80",
                  )}>
                    {/* Floating */}
                    <IFloatingButton className="-top-2 right-4"/>
                    {/* Image */}
                    <div className={cn(
                      "aspect-square bg-red-500 h-full",
                      data.type === "small" && "aspect-square object-cover",
                      data.type === "tall" && "object-cover min-w-[162px] max-w-[430px] aspect-[1/1.545]",
                    )}>
                      <AppImage src={data.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    {/* Text */}
                    <div className="py-px-12 px-px-16 flex flex-col justify-center grow">
                      <div className="my-px-[-5] w-full">
                        <div className="my-px-5">
                          <span className="mt-px-[-4] mb-px-[-3] text-px-13 font-[400] leading-[1.231] text-(--muted) uppercase">
                            {new URL(data.url).hostname}
                          </span>
                        </div>
                        <div className="my-px-5">
                          <span className="mt-px-[-4] mb-px-[-4] line-clamp-2 text-px-17 font-[600] leading-[1.1765] text-(--main)">
                            {data.title}
                          </span>
                        </div>
                        <div className="my-px-5">
                          <span className="mt-px-[-4] mb-px-[-4] line-clamp-3 text-px-15 font-[400] leading-[1.333] text-(--muted)">
                            {data.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            }
          </div>

          {/* Footer */}
          <div className="h-10">

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
              themeId="t-facebook"
              themes={[
                { key: "default", icon: <MaterialSymbolsLightModeOutline /> },
                { key: "dark", icon: <MaterialSymbolsDarkModeOutline /> },
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

async function getFacebookPreview(metadata: ResoledMetadata) {
  const m = metadata

  const messages: PreviewMessages = []

  const data = {
    title: m.general.title.value ?? m.og.title.value ?? m.twitter.title.value ?? new URL(m.rawUrl).hostname,
    description:
      m.general.description.value ??
      m.og.description.value ??
      m.twitter.description.value,
    site: m.og.siteName.value ?? m.twitter.site.value ?? m.general.title.value ?? new URL(m.rawUrl).hostname,
    url: m.general.url.value ?? m.rawUrl,
    image: m.og.image.resolvedUrl ?? m.twitter.image.resolvedUrl,
    fullWidthFavicon: false,
    type: 'none' as 'small' | 'tall' | 'large'
  }

  let imageSize: { width: number, height: number } | undefined = undefined

  if (data.image) {

    const res = await appFetch(data.image)
    const imageSizeRes = await getImageSizeFromResponse(res)

    if (!imageSizeRes.imageSize) {
      messages.push(['error', `Failed to get image size. Image may not be displayed correctly. ${ imageSizeRes.error }`])
    } else {
      const { width, height } = imageSizeRes.imageSize
      imageSize = imageSizeRes.imageSize
      if (imageSizeRes.imageSize?.width < 200 || imageSizeRes.imageSize?.height < 200) {
        messages.push(["warn", "Image size is too small. The preview will not display the image. Minimum size is 200x200px."])
        data.image = undefined
      } else
        if ((width / height) < 0.8) {
          messages.push(['info', 'Image aspect ratio is greater than 4:5. Tall preview will be displayed.'])
          messages.push(['info', 'Aspect ratio of tall preview is not accurate.'])
          data.type = 'tall'
        } else
          if (width > 221 && height > 424) {
            messages.push(['info', 'Image width and height are greater than 221x424. Large preview will be displayed.'])
            data.type = 'large'
          } else {
            messages.push(['info', 'Image width an height is smaller than 221x424. Small preview will be displayed.'])
            data.type = 'small'
          }
    }

  } else {
    messages.push(["info", "Image not found. Preview will not display an image."])
  }

  return {
    messages,
    data,
    imageSize,
  }
}

function IFloatingButton({className, ...props}: ComponentProps<"div">) {
  return (
    <div className={cn("absolute -bottom-px-14 right-px-14 size-px-30 z-10 rounded-px-14 border bg-(--card-bg) border-(--border) flex items-center justify-center", className)} {...props}>
      <TypcnInfoLarge className="size-px-20 text-(--main)" />
    </div>
  )
}

function GlobeIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" {...props}><title>Shared with Public</title><g fillRule="evenodd" transform="translate(-448 -544)"><g><path d="M109.5 408.5c0 3.23-2.04 5.983-4.903 7.036l.07-.036c1.167-1 1.814-2.967 2-3.834.214-1 .303-1.3-.5-1.96-.31-.253-.677-.196-1.04-.476-.246-.19-.356-.59-.606-.73-.594-.337-1.107.11-1.954.223a2.666 2.666 0 0 1-1.15-.123c-.007 0-.007 0-.013-.004l-.083-.03c-.164-.082-.077-.206.006-.36h-.006c.086-.17.086-.376-.05-.529-.19-.214-.54-.214-.804-.224-.106-.003-.21 0-.313.004l-.003-.004c-.04 0-.084.004-.124.004h-.037c-.323.007-.666-.034-.893-.314-.263-.353-.29-.733.097-1.09.28-.26.863-.8 1.807-.22.603.37 1.166.667 1.666.5.33-.11.48-.303.094-.87a1.128 1.128 0 0 1-.214-.73c.067-.776.687-.84 1.164-1.2.466-.356.68-.943.546-1.457-.106-.413-.51-.873-1.28-1.01a7.49 7.49 0 0 1 6.524 7.434" transform="translate(354 143.5)"></path><path d="M104.107 415.696A7.498 7.498 0 0 1 94.5 408.5a7.48 7.48 0 0 1 3.407-6.283 5.474 5.474 0 0 0-1.653 2.334c-.753 2.217-.217 4.075 2.29 4.075.833 0 1.4.561 1.333 2.375-.013.403.52 1.78 2.45 1.89.7.04 1.184 1.053 1.33 1.74.06.29.127.65.257.97a.174.174 0 0 0 .193.096" transform="translate(354 143.5)"></path><path fillRule="nonzero" d="M110 408.5a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-1 0a7 7 0 1 0-14 0 7 7 0 0 0 14 0z" transform="translate(354 143.5)"></path></g></g></svg>
  )
}
function TypcnInfoLarge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M13.839 17.525c-.006.002-.559.186-1.039.186c-.265 0-.372-.055-.406-.079c-.168-.117-.48-.336.054-1.4l1-1.994c.593-1.184.681-2.329.245-3.225c-.356-.733-1.039-1.236-1.92-1.416a5 5 0 0 0-.958-.097c-1.849 0-3.094 1.08-3.146 1.126a.5.5 0 0 0 .493.848c.005-.002.559-.187 1.039-.187c.263 0 .369.055.402.078c.169.118.482.34-.051 1.402l-1 1.995c-.594 1.185-.681 2.33-.245 3.225c.356.733 1.038 1.236 1.921 1.416c.314.063.636.097.954.097c1.85 0 3.096-1.08 3.148-1.126a.5.5 0 0 0-.491-.849"></path><circle cx="13" cy="6.001" r="2.5" fill="currentColor"></circle></svg>
  )
}
