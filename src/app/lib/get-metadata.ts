
import parse, { type HTMLElement } from "node-html-parser"
import { cache } from "react"
import "server-only"
import { AppError } from "../module/error/error-primitives"
import { appFetch, ensureCorrectContentType, getUTF8Text } from "./fetch"
import { extractAuthorData } from "./metadata/+author"
import type { OpenGraphImageMetadataValue } from "./metadata/opengraph"

export const fetchRoot = cache(async (url: string) => {
  const res = await appFetch(url)
  await ensureCorrectContentType(res, "text/html")
  const html = await getUTF8Text(res)
  const root = parse(html)
  return { root, html }
})

/**
 * Extracts metadata values from the HTML document.
 * The goal is to provide a structured object containing metadata.
 * It is not meant to be a complete HTML parser.
 * It is not meant to validate.
 * It is not meant to 
 */
export function getMetadataValues(root: HTMLElement, rawUrl: string) {
  try {
    const from = (s: string) => root.querySelector(s)
    const fromAll = (s: string) => root.querySelectorAll(s)
    const get = (attributeKey: string) => (from: HTMLElement | null) => from?.getAttribute(attributeKey)

    const getOg = (p: `og:${ string }`) => get('content')(from(`meta[property='${ p }']`))
    const getOgAll = (p: `og:${ string }`) => fromAll(`meta[property='${ p }']`).map(get('content'))

    const getTwitter = (p: `twitter:${ string }`) =>
      get('content')(from(`meta[name='${ p }']`))
      ?? get('content')(from(`meta[property='${ p }']`))

    return {
      rawUrl,
      general: {
        title: from("title")?.text,
        description: get('content')(from("meta[name=description]")),
        url: get('content')(from("link[rel=canonical]")),
        favicons: fromAll("link[rel~=icon]").map(element => {
          return {
            rel: get('rel')(element),
            type: get("type")(element),
            sizes: get("sizes")(element),
            href: get("href")(element)
          }
        }),
        author: extractAuthorData(fromAll("link[rel=author], meta[name=author]")),
        robots: get('content')(from("meta[name=robots]")),
        keywords: get('content')(from("meta[name=keywords]")),
        generator: get('content')(from("meta[name=generator]")),
        license: get('content')(from("meta[name=license]")),
        viewport: get('content')(from("meta[name=viewport]")),
        themeColor: fromAll("meta[name='theme-color']").map(element => {
          return {
            media: get("media")(element),
            value: get("content")(element)
          }
        }),
        colorScheme: get('content')(from("meta[name='color-scheme']")),
        formatDetection: get('content')(from("meta[name='format-detection']")),
        applicationName: get('content')(from("meta[name='application-name']")),
      },
      og: {
        title: getOg('og:title'), // Basic Metadata
        type: getOg('og:type'),
        url: getOg('og:url'),
        audio: getOg('og:audio'),   // Optional Metadata
        description: getOg('og:description'),
        determiner: getOg('og:determiner'),
        locale: getOg('og:locale'),
        localeAlternate: fromAll('meta[property="og:locale:alternate"]').map(get('content')),
        siteName: getOg('og:site_name'),
        video: getOg('og:video'),
        imageAlt: getOg('og:image:alt'),
        keywords: getOg('og:keywords'),
        image: getOg('og:image'), // Structured Properties
        images: fromAll("meta[property*='og:image']").reduce<OpenGraphImageMetadataValue[]>((acc, e) => {
          const property = e.getAttribute("property")
          const content = e.getAttribute("content")
          if (!content || !property) return acc
          if (property.split('og:image')[1]) {
            if (!acc.length) return acc
            const attr = property.split('og:image')[1].split(':')[1] as keyof typeof acc[0]
            acc[acc.length - 1][attr] = content
          } else { acc.push({ url: content }) }
          return acc
        }, []),
        articlePublishedTime: getOg('og:article:published_time'),
        articleModifiedTime: getOg('og:article:modified_time'),
        articleExpirationTime: getOg('og:article:expiration_time'),
        articleAuthor: getOgAll('og:article:author'),
        articleSection: getOg('og:article:section'),
        articleTag: getOgAll('og:article:tag'),
      },
      twitter: {
        title: getTwitter('twitter:title'),
        card: getTwitter('twitter:card'),
        description: getTwitter('twitter:description'),
        image: getTwitter('twitter:image'),
        imageAlt: getTwitter('twitter:image:alt'),

        site: getTwitter('twitter:site'),
        siteId: getTwitter('twitter:site:id'),
        creator: getTwitter('twitter:creator'),
        creatorId: getTwitter('twitter:creator:id'),

        player: getTwitter('twitter:player'),
        playerWidth: getTwitter('twitter:player:width'),
        playerHeight: getTwitter('twitter:player:height'),
        playerStream: getTwitter('twitter:player:stream'),

        appCountry: getTwitter('twitter:app:country'),

        appNameIphone: getTwitter('twitter:app:name:iphone'),
        appIdIphone: getTwitter('twitter:app:id:iphone'),
        appUrlIphone: getTwitter('twitter:app:url:iphone'),

        appNameIpad: getTwitter('twitter:app:name:ipad'),
        appIdIpad: getTwitter('twitter:app:id:ipad'),
        appUrlIpad: getTwitter('twitter:app:url:ipad'),

        appNameGoogleplay: getTwitter('twitter:app:name:googleplay'),
        appIdGoogleplay: getTwitter('twitter:app:id:googleplay'),
        appUrlGoogleplay: getTwitter('twitter:app:url:googleplay'),
      },
      mobile: {
        appleTouchIcons: fromAll("link[rel='apple-touch-icon']").map(e => {
          return {
            sizes: get("sizes")(e),
            href: get("href")(e)
          }
        }),
        appleTouchIconsPrecomposed: Array.from(root.querySelectorAll("link[rel='apple-touch-icon-precomposed']")).map(e => {
          return {
            sizes: e.getAttribute("sizes"),
            href: e.getAttribute("href")
          }
        }),
        mobileWebAppCapable: get('content')(from('meta[name="mobile-web-app-capable"]')),
        appleMobileWebAppCapable: get('content')(from('meta[name="apple-mobile-web-app-capable"]')),
        appleMobileWebAppTitle: get('content')(from('meta[name="apple-mobile-web-app-title"]')),
        appleMobileWebAppStatusBarStyle: get('content')(from('meta[name="apple-mobile-web-app-status-bar-style"]')),
      },
      jsonld: {
        data: root.querySelectorAll("script[type='application/ld+json']").map(e => {
          // Move this to a separate module
          try {
            return JSON.parse(e.text)
          } catch (error) {
            throw new AppError(
              'getMetadataValues',
              'JSON Parse Failed', error instanceof Error ? error.message : "Unknown Error",
              [],
              error
            )
          }
        })
      },
      crawler: {
        robots: root.querySelector("meta[name=robots]")?.getAttribute("content"),
      }
    }

  } catch (error) {
    throw new AppError(
      'getMetadataValues',
      'Metadata Parse Failed',
      undefined,
      [],
      error
    )
  }
}

function getTwitterMeta(root: HTMLElement, key: string) {
  return root.querySelector(`meta[name='${ key }']`)?.getAttribute("content") ?? root.querySelector(`meta[property='${ key }']`)?.getAttribute("content")
}
function fromMetaTagWithName(root: HTMLElement, key: string) {
  return root.querySelector(`meta[name='${ key }']`)?.getAttribute("content")
}

export type Metadata = ReturnType<typeof getMetadataValues>

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

class AppHTMLElement {
  constructor(readonly element: HTMLElement) { }
  get(key: string) {
    return this.element.getAttribute(key)
  }
  get text() {
    return this.element.text
  }
}