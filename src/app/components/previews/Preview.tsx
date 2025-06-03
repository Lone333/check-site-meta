import { cn } from "lazy-cn";
import type { ReactNode } from "react";
import type { ComponentProps, SVGProps } from "react";



export type PreviewMessages = [
  level: 'error' | 'warn' | 'info' | 'ok',
  text: string,
  source?: string
][]

export function MessageList(props: { messages: PreviewMessages }) {
  return (
    <div className="flex flex-col gap-2 text-base pt-2">
      {props.messages.map((item, i) => {
        const Icon = IconMap[item[0]]
        return (
          <div key={i} style={{ animationDelay: `${ (i + 3) * 100 }ms` }}
            className={cn("flex items-start gap-1 fadeIn-0", ColorMap[item[0]])}>
            <Icon className="size-5 shrink-0 opacity-60" />
            <span className="leading-5">
              {item[1]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const IconMap = {
  error: ClarityExclamationCircleSolid,
  warn: ClarityExclamationTriangleSolid,
  info: ClarityInfoCircleLine,
  ok: ClarityCheckCircleSolid,
}

const ColorMap = {
  error: "text-error",
  warn: "text-warning",
  info: "text-foreground-muted-2",
  ok: "text-green-500"
}

export function ClarityInfoCircleLine(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...props}><circle cx="17.93" cy="11.9" r="1.4" fill="currentColor" className="clr-i-outline clr-i-outline-path-1"></circle><path fill="currentColor" d="M21 23h-2v-8h-3a1 1 0 0 0 0 2h1v6h-2a1 1 0 1 0 0 2h6a1 1 0 0 0 0-2" className="clr-i-outline clr-i-outline-path-2"></path><path fill="currentColor" d="M18 6a12 12 0 1 0 12 12A12 12 0 0 0 18 6m0 22a10 10 0 1 1 10-10a10 10 0 0 1-10 10" className="clr-i-outline clr-i-outline-path-3"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>)
}
function ClarityExclamationCircleSolid(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...props}><path fill="currentColor" d="M18 6a12 12 0 1 0 12 12A12 12 0 0 0 18 6m-1.49 6a1.49 1.49 0 0 1 3 0v6.89a1.49 1.49 0 1 1-3 0ZM18 25.5a1.72 1.72 0 1 1 1.72-1.72A1.72 1.72 0 0 1 18 25.5" className="clr-i-solid clr-i-solid-path-1"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>)
}
function ClarityExclamationTriangleSolid(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...props}><path fill="currentColor" d="M30.33 25.54L20.59 7.6a3 3 0 0 0-5.27 0L5.57 25.54A3 3 0 0 0 8.21 30h19.48a3 3 0 0 0 2.64-4.43Zm-13.87-12.8a1.49 1.49 0 0 1 3 0v6.89a1.49 1.49 0 1 1-3 0ZM18 26.25a1.72 1.72 0 1 1 1.72-1.72A1.72 1.72 0 0 1 18 26.25" className="clr-i-solid clr-i-solid-path-1"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>)
}
export function ClarityCheckCircleSolid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...props}>{/* Icon from Clarity by VMware - https://github.com/vmware/clarity-assets/blob/master/LICENSE */}<path fill="currentColor" d="M30 18A12 12 0 1 1 18 6a12 12 0 0 1 12 12m-4.77-2.16a1.4 1.4 0 0 0-2-2l-6.77 6.77L13 17.16a1.4 1.4 0 0 0-2 2l5.45 5.45Z" className="clr-i-solid clr-i-solid-path-1"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>
  )
}

export function PreviewPanelContent(
  { PreviewInfoContent, PreviewSection, className, ...props }: {
    PreviewSection: ReactNode,
    PreviewInfoContent: ReactNode,
  } & ComponentProps<"div">
) {
  return (
    <>
      <div className={cn("mb-8 w-full flex flex-col items-center fadeIn-0 gap-2 **:transition", className)} {...props}>
        {PreviewSection}
      </div>
      <div className="max-w-100">
        {PreviewInfoContent}
      </div>
    </>
  )
}

export function PreviewMenu({ className, ...props }: ComponentProps<"div">) {
  return (<div {...props} className={cn(
    "flex gap-2 self-end z-10",
    className
  )} />)
}