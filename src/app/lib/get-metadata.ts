
import parse, { type HTMLElement } from "node-html-parser"
import { cache } from "react"
import "server-only"
import { AppError } from "../module/error/error-primitives"
import { appFetch, ensureCorrectContentType, getUTF8Text } from "./fetch"
import { extractAuthorData } from "./metadata/+author"

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

  const from = (s: string) => root.querySelector(s)
  const fromAll = (s: string) => root.querySelectorAll(s)
  const get = (attributeKey: string, from: HTMLElement | null) => from?.getAttribute(attributeKey)
  const getMany = (attributeKey: string, from: HTMLElement[]) => from.map(element => element.getAttribute(attributeKey))

  const getOg = (p: `og:${string}`) => get('content', from(`meta[property='og:${p}']`))


  try {
    return {
      rawUrl,
      general: {
        title: from("title")?.text,
        description: get('content', from("meta[name=description]")),
        url: get('content', from("link[rel=canonical]")),
        favicons: fromAll("link[rel~=icon]").map(element => ({
          rel: get('rel', element),
          type: get("type", element),
          sizes: get("sizes", element),
          href: get("href", element)
        })),
        author: extractAuthorData(fromAll("link[rel=author], meta[name=author]")),
        robots: get('content', from("meta[name=robots]")),
        keywords: get('content', from("meta[name=keywords]")),
        generator: get('content', from("meta[name=generator]")),
        license: get('content', from("meta[name=license]")),
        viewport: get('content', from("meta[name=viewport]")),
        themeColor: fromAll("meta[name='theme-color']").map(element => ({
          media: get("media", element),
          value: get("content", element)
        })),
        colorScheme: get('content', from("meta[name='color-scheme']")),
        formatDetection: get('content', from("meta[name='format-detection']")),
        applicationName: get('content', from("meta[name='application-name']")),
      },
      og: {
        // Basic Metadata
        title: getOg('og:title'),
        type: getOg('og:type'),
        image: getOg('og:image'),
        url: getOg('og:url'),

        // Optional Metadata
        audio: getOg('og:audio'),
        description: getOg('og:description'),
        determiner: getOg('og:determiner'),
        locale: getOg('og:locale'),
        localeAlternate: fromAll('meta[property="og:locale:alternate"]').map(e => e.getAttribute("content")),

        siteName: getOg('og:site_name'),
        video: getOg('og:video'),

        imageAlt: getOg('og:image:alt'),
        keywords: getOg('og:keywords'),

        // Structured Properties
        images: root.querySelectorAll("meta[property*='og:image']").reduce((acc, e) => {
          const property = e.getAttribute("property")
          const content = e.getAttribute("content")
          if (!content || !property) return acc
          if (property.split('og:image')[1]) {
            if (!acc.length) return acc
            const attr = property.split('og:image')[1].split(':')[1] as keyof typeof acc[0]
            acc[acc.length - 1][attr] = content
          } else { acc.push({ url: content }) }
          return acc
        }, [] as { url: string, secure_url?: string, type?: string, width?: string, height?: string, alt?: string }[]),

        articlePublishedTime: fromMetaTagWithProperty(root, 'article:published_time'),
        articleModifiedTime: fromMetaTagWithProperty(root, 'article:modified_time'),
        articleExpirationTime: fromMetaTagWithProperty(root, 'article:expiration_time'),
        articleAuthor: fromMetaTagWithPropertyArray(root, 'article:author').map(e => e.getAttribute("content")),
        articleSection: fromMetaTagWithProperty(root, 'article:section'),
        articleTag: fromMetaTagWithPropertyArray(root, 'article:tag').map(e => e.getAttribute("content")),
      },
      twitter: {
        title: getTwitterMeta(root, 'twitter:title'),
        card: getTwitterMeta(root, 'twitter:card'),
        description: getTwitterMeta(root, 'twitter:description'),
        image: getTwitterMeta(root, 'twitter:image'),
        imageAlt: getTwitterMeta(root, 'twitter:image:alt'),

        site: getTwitterMeta(root, 'twitter:site'),
        siteId: getTwitterMeta(root, 'twitter:site:id'),
        creator: getTwitterMeta(root, 'twitter:creator'),
        creatorId: getTwitterMeta(root, 'twitter:creator:id'),

        player: getTwitterMeta(root, 'twitter:player'),
        playerWidth: getTwitterMeta(root, 'twitter:player:width'),
        playerHeight: getTwitterMeta(root, 'twitter:player:height'),
        playerStream: getTwitterMeta(root, 'twitter:player:stream'),

        appCountry: getTwitterMeta(root, 'twitter:app:country'),

        appNameIphone: getTwitterMeta(root, 'twitter:app:name:iphone'),
        appIdIphone: getTwitterMeta(root, 'twitter:app:id:iphone'),
        appUrlIphone: getTwitterMeta(root, 'twitter:app:url:iphone'),

        appNameIpad: getTwitterMeta(root, 'twitter:app:name:ipad'),
        appIdIpad: getTwitterMeta(root, 'twitter:app:id:ipad'),
        appUrlIpad: getTwitterMeta(root, 'twitter:app:url:ipad'),

        appNameGoogleplay: getTwitterMeta(root, 'twitter:app:name:googleplay'),
        appIdGoogleplay: getTwitterMeta(root, 'twitter:app:id:googleplay'),
        appUrlGoogleplay: getTwitterMeta(root, 'twitter:app:url:googleplay'),
      },
      mobile: {
        appleTouchIcons: Array.from(root.querySelectorAll("link[rel='apple-touch-icon']")).map(e => {
          return {
            sizes: e.getAttribute("sizes"),
            href: e.getAttribute("href")
          }
        }),
        appleTouchIconsPrecomposed: Array.from(root.querySelectorAll("link[rel='apple-touch-icon-precomposed']")).map(e => {
          return {
            sizes: e.getAttribute("sizes"),
            href: e.getAttribute("href")
          }
        }),
        mobileWebAppCapable: fromMetaTagWithName(root, 'apple-mobile-web-app-capable'),
        appleMobileWebAppCapable: fromMetaTagWithName(root, 'apple-mobile-web-app-capable'),
        appleMobileWebAppTitle: fromMetaTagWithName(root, 'apple-mobile-web-app-title'),
        appleMobileWebAppStatusBarStyle: fromMetaTagWithName(root, 'apple-mobile-web-app-status-bar-style'),
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
      'Metadata Parse Failed', error instanceof Error ? error.message : "Unknown Error",
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
function fromMetaTagWithProperty(root: HTMLElement, key: string) {
  return root.querySelector(`meta[property='${ key }']`)?.getAttribute("content")
}
function fromMetaTagWithPropertyArray(root: HTMLElement, key: string) {
  return root.querySelectorAll(`meta[property='${ key }']`)
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