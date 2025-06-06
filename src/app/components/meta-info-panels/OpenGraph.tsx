import type { ResoledMetadata } from "@/app/lib/get-resolved-metadata"
import { AppImage } from "@/app/module/image/AppImage"
import { Fragment } from "react"
import { MetadataField } from "../SummaryPanelField"

export function OpengraphMetadata(
  props: { m: ResoledMetadata }
) {
  const d = props.m
  return (
    <>
      <MetadataField data={d.og.title} />
      <MetadataField data={d.og.description} />
      <MetadataField data={d.og.image} />
      <MetadataField data={d.og.url} />
      <MetadataField data={d.og.type} />
      <MetadataField data={d.og.siteName} />
      <MetadataField data={d.og.locale} />
      <hr />
      <MetadataField data={d.og.images}>
        <StructuredOpengraphMetadata d={d} type="images" />
      </MetadataField>
      <MetadataField data={d.og.articleAuthor}>
        {d.og.articleAuthor.values.length === 0 && <div className="meta-mute">-</div>}
        {d.og.articleAuthor.values.map((item, i) => {
          return <div key={i}>{item}</div>
        })}
      </MetadataField>
      <MetadataField data={d.og.articlePublishedTime} />
      <MetadataField data={d.og.articleModifiedTime} />
      <MetadataField data={d.og.articleExpirationTime} />
      <MetadataField data={d.og.articleSection} />
      <MetadataField data={d.og.articleTag}>
        {d.og.articleTag.values.length === 0 && <div className="meta-mute">-</div>}
        {d.og.articleTag.values.map((item, i) => {
          return <div key={i}>{item}</div>
        })}
      </MetadataField>
    </>
  )
}

function StructuredOpengraphMetadata(
  props: { d: ResoledMetadata, type: "images" }
) {
  const d = props.d
  const type = props.type

  return (
    <div className="grid grid-cols-1 gap-2">
      {d.og[type].values.map((item, i) => {
        return (
          <div key={i} className="flex flex-col gap-2 items-start">
            {i !== 0 && <hr className="self-stretch my-3" />}
            {type === "images" && (
              <div className="image-frame w-auto shrink-0 self-start">
                <AppImage src={item.resolvedUrl} className="h-[2lh]" />
              </div>
            )}
            <div className="text-xs meta-info-field-value break-words grid grid-cols-[5rem_1fr] gap-y-1 w-full">
              {item.labels.map((label, i) => {
                return <Fragment key={i}>
                  <div className="text-foreground opacity-100">{label[0]}</div>
                  <div>{label[1] ?? <span className="meta-mute" >-</span>}</div>
                </Fragment>
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}