import parse, { type HTMLElement } from "node-html-parser";
import { cache } from "react";
import "server-only"
import { AppError } from "../module/error/error-primitives";
import { appFetch, ensureCorrectContentType, getUTF8Text } from "./fetch";

export const fetchRoot = cache(async function getRoot(url: string) {
  const res = await appFetch(url)
  await ensureCorrectContentType(res, "text/html")
  const html = await getUTF8Text(res)
  const root = parse(html);
  return { root, html }
})

export function getMetadataValues(root: HTMLElement, rawUrl: string) {
  try {
    return {
      rawUrl,
      general: {
        title: root.querySelector("title")?.text,
        description: root.querySelector("meta[name=description]")?.getAttribute("content"),
        url: root.querySelector("link[rel=canonical]")?.getAttribute("href"),
        favicons: root.querySelectorAll("link[rel~=icon]").map(e => {
          return {
            rel: e.getAttribute("rel"),
            type: e.getAttribute("type"),
            sizes: e.getAttribute("sizes"),
            href: e.getAttribute("href")
          }
        }),
        author: root.querySelector("meta[name=author]")?.getAttribute("content"),
        robots: root.querySelector("meta[name=robots]")?.getAttribute("content"),
        keywords: root.querySelector("meta[name=keywords]")?.getAttribute("content"),
        generator: root.querySelector("meta[name=generator]")?.getAttribute("content"),
        license: root.querySelector("meta[name=license]")?.getAttribute("content"),
        viewport: root.querySelector("meta[name=viewport]")?.getAttribute("content"),
        themeColor: root.querySelectorAll("meta[name='theme-color']").map(e => {
          return {
            media: e.getAttribute("media"),
            value: e.getAttribute("content")
          }
        }),
        colorScheme: root.querySelector("meta[name='color-scheme']")?.getAttribute("content"),
        formatDetection: root.querySelector("meta[name='format-detection']")?.getAttribute("content"),
        applicationName: root.querySelector("meta[name='application-name']")?.getAttribute("content"),
      },
      og: {
        // Basic Metadata
        title: fromMetaTagWithProperty(root, 'og:title'),
        type: fromMetaTagWithProperty(root, 'og:type'),
        image: fromMetaTagWithProperty(root, 'og:image'),
        url: fromMetaTagWithProperty(root, 'og:url'),

        // Optional Metadata
        audio: fromMetaTagWithProperty(root, 'og:audio'),
        description: fromMetaTagWithProperty(root, 'og:description'),
        determiner: fromMetaTagWithProperty(root, 'og:determiner'),
        locale: fromMetaTagWithProperty(root, 'og:locale'),
        localeAlternate: fromMetaTagWithPropertyArray(root, 'og:locale:alternate').map(e => e.getAttribute("content")),
        siteName: fromMetaTagWithProperty(root, 'og:site_name'),
        video: fromMetaTagWithProperty(root, 'og:video'),

        imageAlt: fromMetaTagWithProperty(root, 'og:image:alt'),
        keywords: fromMetaTagWithProperty(root, 'og:keywords'),

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
