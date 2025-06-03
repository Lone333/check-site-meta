"use client"

import { useState, type ComponentProps, type ReactNode, type SVGProps } from "react"
import { type FieldDataItem } from "../lib/get-metadata-field-data"
import { AppImage } from "../module/image/Image"
import { cn } from "lazy-cn"
import { CollapsibleRow } from "../lib/Collapsible"

export function Separator() { return <hr /> }

export function MetadataField(props: {
  data: FieldDataItem,
  children?: ReactNode,
  contentProps?: ComponentProps<"div">
  titleProps?: ComponentProps<"div">
  containerProps?: ComponentProps<"div">
  putInfoBesideLabel?: boolean
}) {
  const { label, value, resolvedUrl, type, description } = props.data

  const [infoOpen, setInfoOpen] = useState(false)
  const toggleInfo = () => setInfoOpen(!infoOpen)

  const content = props.children
    // Use configuration from children if provided.
    ? <MetadataRowContent>{props.children}</MetadataRowContent>
    // Otherwise, use the data from props.data.
    : <MetadataRowContent
      value={value}
      resolvedUrl={resolvedUrl}
      type={type}
    />

  return (
    <div {...props.containerProps} className={cn("group flex-nowrap whitespace-pre-wrap", props.containerProps?.className)}>

      <div>
        <button className="w-fit h-fit text-start meta-info-field-key" onClick={toggleInfo}>
          {label}
        </button>
        {props.putInfoBesideLabel && <InfoButton className="ml-1" onClick={toggleInfo} />}
      </div>

      <div {...props.contentProps} className={cn('w-full', props.contentProps?.className)} >
        {!props.putInfoBesideLabel && <InfoButton className="float-right ml-1" onClick={toggleInfo} />}
        {content}
      </div>

      <CollapsibleRow data-opened={infoOpen} className="col-span-2">
        <div className={cn("bg-background-tooltip p-3 py-2.5 rounded-md text-sm overflow-hidden mt-2 flex flex-col")}>
          {description ?? "No description available"}
          <button className="text-end mt-3 text-foreground-muted-2 text-xs font-medium bg-transparent block px-0 self-end hover:underline"
            onClick={() => setInfoOpen(false)}
          >hide</button>
        </div>
      </CollapsibleRow>
    </div>
  )
}

export function MetadataRowContent(props: {
  children?: ReactNode,
  value?: string,
  resolvedUrl?: string,
  type?: "url" | "image" | (string & {}),
}) {
  const hasValue = props.children || props.value
  const isEmptyArray = Array.isArray(props.children) && props.children.length === 0
  const hasNoValue = !hasValue || isEmptyArray
  const { value, resolvedUrl, type } = props

  return (
    <>
      {hasNoValue && <span className="meta-mute">{'-'}</span>}
      {!type && hasValue}
      {value && type === "url" && <InlineLink href={resolvedUrl} value={value} />}
      {value && type?.startsWith("image") && (
        <div className="flex gap-x-2 flex-wrap" >
          <div className="image-frame w-auto shrink-0 self-start">
            {type === "image-favicon"
              ? <AppImage src={resolvedUrl} className="h-[1.5lh]" />
              : <AppImage src={resolvedUrl} className="h-[2lh]" />}
          </div>
          <InlineLink href={resolvedUrl} value={value} className="min-w-30 basis-0 grow" />
        </div>
      )}
    </>
  )
}


/** InlineLink used in Value part of Metadata Row to render clickable links.*/
export function InlineLink(props: { href?: string, value?: string, className?: string }) {
  return <a target="_blank" href={props.href} className={cn("link-underline text-[0.8rem] leading-snug mt-0.5 block break-all", props.className)}>
    {props.value} <ExternalIcon />
  </a>
}

function InfoButton(props: ComponentProps<"button">) {
  return (
    <button {...props} className={cn("opacity-0 mt-1 group-hover:opacity-100 bg-background-tooltip rounded-md px-0 py-0 w-3.5 h-3.5 text-foreground-muted inline-flex items-center justify-center align-[-0.1rem] overflow-hidden", props.className)} >
      <InfoIcon className="transition translate-y-full group-hover:translate-y-0" />
    </button>
  )
}


export function ExternalIcon(props: SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props} className="inline align-[-0.15rem]"><path fill="currentColor" d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm11-3v9l-3.794-3.793l-5.999 6l-1.414-1.414l5.999-6L12 3z"></path></svg>
}
// MdiInformationVariant
function InfoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={cn("inline", className)} width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M13.5 4A1.5 1.5 0 0 0 12 5.5A1.5 1.5 0 0 0 13.5 7A1.5 1.5 0 0 0 15 5.5A1.5 1.5 0 0 0 13.5 4m-.36 4.77c-1.19.1-4.44 2.69-4.44 2.69c-.2.15-.14.14.02.42c.16.27.14.29.33.16c.2-.13.53-.34 1.08-.68c2.12-1.36.34 1.78-.57 7.07c-.36 2.62 2 1.27 2.61.87c.6-.39 2.21-1.5 2.37-1.61c.22-.15.06-.27-.11-.52c-.12-.17-.24-.05-.24-.05c-.65.43-1.84 1.33-2 .76c-.19-.57 1.03-4.48 1.7-7.17c.11-.64.41-2.04-.75-1.94"></path></svg>
}