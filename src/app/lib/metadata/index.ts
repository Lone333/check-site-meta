// Unused

import type { HTMLElement } from "node-html-parser"
import { extractAuthorData } from "./+author"

// Soon!
// export type MetadataMetadataItem = {
//   label: string,
//   description?: string,
//   source?: string,
//   type?: string,
//   resolvedUrl?: string,
//   unresolved?: Promise<any>
// } & (
//     {
//       value: string,
//     } | {
//       values?: {
//         value: string,
//         label: string,
//         source?: string,
//       }[]
//     }
//   )

export type MetadataMetadataItem = {
  value?: string | null,
  label: string,
  description?: string,
  source?: string,
  type?: string,
  resolvedUrl?: string,
  values?: any[],
}

function pipe<A, B>(
  node: A, fn: (node: A) => B,
) {
  return fn(node)
}

export function getMetadata(root: HTMLElement, rawUrl: string) {

  const select = <T extends string | undefined = undefined>(s: string, attr?: T) =>
    attr
      ? root.querySelector(s)?.getAttribute(attr) as T extends string ? string | null : HTMLElement
      : root.querySelector(s) as T extends string ? string | null : HTMLElement
  const selectAll = (s: string) => root.querySelectorAll(s)
  const attr = (e: HTMLElement | null, a: string) => e && (e.getAttribute(a) ?? null)
  const resolveUrl = (url?: string | null) => {
    if (!url) return undefined
    try { return new URL(url, rawUrl).href } catch { }
  }

  const general = {
    title: pipe(
      select("title")?.text,
      v => ({ value: v, label: "title" })
    ),
    description: pipe(
      select("meta[name=description]", "content"),
      v => ({ value: v, label: "description" })
    ),
    url: pipe(
      select("link[rel=canonical]", "href"),
      v => ({ value: v, label: "canonical", type: "url", resolvedUrl: resolveUrl(v) })
    ),
    favicons: pipe(
      selectAll("link[rel~=icon]").map(e => ({
        rel: attr(e, "rel"),                // ex: "icon", "shortcut icon", "apple-touch-icon"
        type: attr(e, "type"),              // ex: "image/png", "image/x-icon"
        sizes: attr(e, "sizes"),            // ex: "16x16", "32x32", "192x192"
        href: resolveUrl(attr(e, "href")),  // ex: "/favicon.ico", "/favicon.png"
      })),
      v => ({
        label: "favicons",
        type: "image-favicon",
        values: [
          ...v.map(e => {
            if (!e.href) return null
            return {
              value: e.href,
              label: e.type ?? "unknown",
              source: `link[rel="${ e.rel }"]`,
              sizes: e.sizes,
              resolvedUrl: e.href,
            }
          }),
          // Todo: Move this to another layer
          {
            value: "/favicon.ico",
            label: 'image/x-icon',
            source: 'direct link to /favicon.ico',
            sizes: undefined,
            resolvedUrl: resolveUrl("/favicon.ico"),
          },
          {
            value: "/favicon.png",
            label: 'image/png',
            source: 'direct link to /favicon.png',
            sizes: undefined,
            resolvedUrl: resolveUrl("/favicon.png"),
          }
        ].flatMap(e => e ? e : [])
      })
    ),
    author: pipe(
      extractAuthorData(selectAll("link[rel=author],meta[name=author]")),
      v => ({
        values: v.map(e => ({
          value: e.name,
          label: e.name,
          resolveUrl: resolveUrl(e.href),
        })),
        label: "author",
        type: "text",
      })
    ),


  } satisfies { [X in string]: MetadataMetadataItem }


  return {
    rawUrl,
    general,
  }
}
