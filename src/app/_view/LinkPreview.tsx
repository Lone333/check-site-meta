import { cn } from "lazy-cn";
import { Suspense, type ComponentProps, type CSSProperties, type ReactNode, type SVGProps } from "react";
import { StaticTooltip, TooltipBase } from "../lib/Tooltip";
import { tab } from "../module/tab/tab-primitives";
import { TabsWithContent } from "../module/tab/Tabs";
import { SiteMetadata } from "../page";
import { PreviewDiscord } from "./previews/PreviewDiscord";
import { PreviewFacebook } from "./previews/PreviewFacebook";
import { PreviewGoogle } from "./previews/PreviewGoogle";
import { PreviewTwitter } from "./previews/PreviewTwitter";


export async function LinkPreviewPanel(
  props: { metadata: SiteMetadata }
) {
  const metadata = props.metadata.resolved;
  if (!metadata) return null
  return (
    <Suspense fallback={<span className="fadeIn-0 p-3">Loading...</span>}>
      <TabsWithContent
        id="preview"
        className="tab fadeIn-50 tab-item:p-[var(--p)] tab-item:px-[var(--px)] svg:size-5 gap-0"
        style={{
          "--p": "0.5rem",
          "--px": "0.75rem",
        }}
        tabs={[
          tab(
            <LinkPreviewPanelTooltip label="X/Twitter">
              <RiTwitterXFill className="transition group-data-active:text-foreground" />
            </LinkPreviewPanelTooltip>,
            <PreviewTwitter key="x" metadata={metadata} className="fadeIn-100" />
          ),
          tab(
            <LinkPreviewPanelTooltip label="Discord">
              <IcBaselineDiscord style={{ "--c": "#5865F2" }} className="transition group-hover:text-(--c) group-data-active:text-(--c)" />
            </LinkPreviewPanelTooltip>,
            <PreviewDiscord key="d" metadata={metadata} className="fadeIn-0" />
          ),
          tab(
            <LinkPreviewPanelTooltip label="Google">
              <LogosGoogleIcon className="p-0.5" />
            </LinkPreviewPanelTooltip>,
            <PreviewGoogle key="g" metadata={metadata} className="fadeIn-0" />
          ),
          tab(
            <LinkPreviewPanelTooltip label="Facebook">
              <IcBaselineFacebook style={{ "--c": "#1877f2" }} className="transition group-hover:text-(--c) group-data-active:text-(--c)" />
            </LinkPreviewPanelTooltip>,
            <PreviewFacebook key="f" metadata={metadata} className="fadeIn-0" />
          ),
          // tab(
          //   <LinkPreviewPanelTooltip label="Whatsapp">
          //     <IcBaselineWhatsapp style={{ "--c": "#65D072" }} className="transition group-hover:text-(--c) group-data-active:text-(--c)" />
          //   </LinkPreviewPanelTooltip>,
          //   <PreviewWhatsapp key="w" metadata={metadata} className="fadeIn-0" />
          // ),
          // tab(
          //   <LinkPreviewPanelTooltip label="Telegram">
          //     <IcBaselineTelegram style={{ "--c": "#2AABEE" }} className="transition group-hover:text-(--c) group-data-active:text-(--c)" />
          //   </LinkPreviewPanelTooltip>,
          //   <ComingSoon />
          // ),
        ]} />
    </Suspense>
  )
}


function LinkPreviewPanelTooltip(props: {
  label: ReactNode,
  children: ReactNode,
}) {
  return (
    <StaticTooltip
      tooltip={<TooltipBase>{props.label}</TooltipBase>}
      className="-m-2 -mx-3 p-2 px-3">
      {props.children}
    </StaticTooltip>
  )
}







function RiTwitterXFill(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m17.687 3.063l-4.996 5.711l-4.32-5.711H2.112l7.477 9.776l-7.086 8.099h3.034l5.469-6.25l4.78 6.25h6.102l-7.794-10.304l6.625-7.571zm-1.064 16.06L5.654 4.782h1.803l10.846 14.34z" />
  </svg>)
}
export function LogosGoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262" {...props}>
    <path className="transition fill-current group-hover:fill-[#4285F4] group-data-active:fill-[#4285F4]" fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
    <path className="transition fill-current group-hover:fill-[#34A853] group-data-active:fill-[#34A853]" fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
    <path className="transition fill-current group-hover:fill-[#FBBC05] group-data-active:fill-[#FBBC05]" fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
    <path className="transition fill-current group-hover:fill-[#EB4335] group-data-active:fill-[#EB4335]" fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
  </svg>)
}
function IcBaselineDiscord(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12" />
  </svg>)
}
function IcBaselineFacebook(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95" />
  </svg>)
}
function IcBaselineWhatsapp(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28" />
  </svg>)
}
function IcBaselineTelegram(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.5c-.99-.65-.35-1.01.22-1.59c.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02c-.09.02-1.49.95-4.22 2.79c-.4.27-.76.41-1.08.4c-.36-.01-1.04-.2-1.55-.37c-.63-.2-1.12-.31-1.08-.66c.02-.18.27-.36.74-.55c2.92-1.27 4.86-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.14.27c-.01.06.01.24 0 .38" />
  </svg>)
}
function ComingSoon({ className, ...props }: ComponentProps<'div'>) {
  return <div key={Math.random()} className={cn("text-gray-500 text-center mt-8 fadeIn-0", className)} {...props}>Coming soon.</div>
}

