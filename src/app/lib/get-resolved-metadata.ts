import type { Metadata } from "./get-metadata"

export type MetadataMetadataItem = {
  value?: string | undefined,
  label: string,
  description?: string,
  source?: string,
  type?: string,
  resolvedUrl?: string,
  values?: any[],
}

export function getResolvedMetadata(m: Metadata) {

  // Resolve base URL against the raw URL.
  const resolveUrl = (url?: string) => {
    if (!url) return undefined
    try { return new URL(url, m.rawUrl).href } catch { }
  }

  const data = {
    general: {
      title: {
        value: m.general.title,
        label: "title",
      },
      description: {
        value: m.general.description,
        label: "description",
      },
      url: {
        value: m.general.url,
        label: "canonical url",
        type: "url",
        resolvedUrl: resolveUrl(m.general.url),
      },
      robots: {
        value: m.general.robots,
        label: "robots",
      },
      viewport: {
        value: m.general.viewport,
        label: "viewport",
      },
      ...(() => {
        const favicons = {
          value: undefined,
          label: "favicons",
          type: "image-favicon",
          values: [
            ...m.general.favicons.map(e => {
              return {
                value: e.href,
                label: "",
                source: `link[rel="${ e.rel }"]`,
                type: e.type,
                sizes: e.sizes,
                resolvedUrl: resolveUrl(e.href),
              }
            }),
            {
              value: "/favicon.ico",
              label: "",
              source: 'direct link to /favicon.ico',
              type: 'image/x-icon',
              sizes: 'size undefined',
              resolvedUrl: resolveUrl("/favicon.ico"),
            },
            {
              value: "/favicon.png",
              label: "",
              source: 'direct link to /favicon.png',
              type: 'image/png',
              sizes: 'size undefined',
              resolvedUrl: resolveUrl("/favicon.png"),
            }
          ]
        }
        return { favicons }
      })(),
      author: {
        value: m.general.author[0]?.name,
        label: "author",
        values: m.general.author.map(e => {
          return {
            value: e.name,
            label: e.name,
            resolvedUrl: resolveUrl(e.href),
          }
        })
      },
      keywords: {
        value: m.general.keywords,
        label: "keywords",
      },
      generator: {
        value: m.general.generator,
        label: "generator",
      },
      license: {
        value: m.general.license,
        label: "license",
      },
      colorTheme: {
        value: m.general.themeColor[0]?.value,
        label: "color theme",
        type: "color",
        values: m.general.themeColor
          .filter(e => e.value)
          .map(e => {
            return {
              value: e.value!,
              label: e.media ?? "",
            }
          }),
      },
      applicationName: {
        value: m.general.applicationName,
        label: "application name",
      },
      colorScheme: {
        value: m.general.colorScheme,
        label: "color scheme",
      },
      formatDetection: {
        value: m.general.formatDetection,
        label: "format detection",
      },
    },
    og: {
      title: {
        value: m.og.title,
        label: "og:title",
      },
      description: {
        value: m.og.description,
        label: "og:description",
      },
      url: {
        value: m.og.url,
        label: "og:url",
        type: "url",
      },
      image: {
        value: m.og.image,
        label: "og:image",
        type: "image",
        resolvedUrl: resolveUrl(m.og.image),
      },
      type: {
        value: m.og.type,
        label: "og:type",
      },
      siteName: {
        value: m.og.siteName,
        label: "og:site_name",
      },
      imageAlt: {
        value: m.og.imageAlt,
        label: "og:image:alt",
      },
      locale: {
        value: m.og.locale,
        label: "og:locale",
      },
      images: {
        label: "og:image",
        values: m.og.images.map(e => {
          return {
            value: e.url,
            label: '',
            labels: Object.entries(e),
            resolvedUrl: resolveUrl(e.url),
          }
        }),
      },
      articlePublishedTime: {
        value: m.og.articlePublishedTime,
        label: "article:published_time",
      },
      articleModifiedTime: {
        value: m.og.articleModifiedTime,
        label: "article:modified_time",
      },
      articleExpirationTime: {
        value: m.og.articleExpirationTime,
        label: "article:expiration_time",
      },
      articleAuthor: {
        values: m.og.articleAuthor,
        label: "article:author",
      },
      articleSection: {
        value: m.og.articleSection,
        label: "article:section",
      },
      articleTag: {
        values: m.og.articleTag,
        label: "article:tag",
      },
    },
    twitter: {
      title: {
        value: m.twitter.title,
        label: "twitter:title",
      },
      card: {
        value: m.twitter.card,
        label: "twitter:card",
      },
      description: {
        value: m.twitter.description,
        label: "twitter:description",
      },
      image: {
        value: m.twitter.image,
        label: "twitter:image",
        type: "image",
        resolvedUrl: resolveUrl(m.twitter.image),
      },
      imageAlt: {
        value: m.twitter.imageAlt,
        label: "twitter:image:alt",
      },
      site: {
        value: m.twitter.site,
        label: "twitter:site",
      },
      siteId: {
        value: m.twitter.siteId,
        label: "twitter:site:id",
      },
      creator: {
        value: m.twitter.creator,
        label: "twitter:creator",
      },
      creatorId: {
        value: m.twitter.creatorId,
        label: "twitter:creator:id",
      },
      player: {
        value: m.twitter.player,
        label: "twitter:player",
        type: "url",
      },
      playerWidth: {
        value: m.twitter.playerWidth,
        label: "twitter:player:width",
      },
      playerHeight: {
        value: m.twitter.playerHeight,
        label: "twitter:player:height",
      },
      playerStream: {
        value: m.twitter.playerStream,
        label: "twitter:player:stream",
        type: "url",
      },
      appCountry: {
        value: m.twitter.appCountry,
        label: "twitter:app:country",
      },
      appNameIphone: {
        value: m.twitter.appNameIphone,
        label: "twitter:app\n:name:iphone",
      },
      appIdIphone: {
        value: m.twitter.appIdIphone,
        label: "twitter:app:id:iphone",
      },
      appUrlIphone: {
        value: m.twitter.appUrlIphone,
        label: "twitter:app:url:iphone",
        type: "url",
      },
      appNameIpad: {
        value: m.twitter.appNameIpad,
        label: "twitter:app\n:name:ipad",
      },
      appIdIpad: {
        value: m.twitter.appIdIpad,
        label: "twitter:app:id:ipad",
      },
      appUrlIpad: {
        value: m.twitter.appUrlIpad,
        label: "twitter:app:url:ipad",
        type: "url",
      },
      appNameGoogleplay: {
        value: m.twitter.appNameGoogleplay,
        label: "twitter:app\n:name:googleplay",
      },
      appIdGoogleplay: {
        value: m.twitter.appIdGoogleplay,
        label: "twitter:app\n:id:googleplay",
      },
      appUrlGoogleplay: {
        value: m.twitter.appUrlGoogleplay,
        label: "twitter:app\n:url:googleplay",
        type: "url",
      },
    },
    icons: {
      appleTouchIcons: {
        value: undefined,
        label: "apple-touch-icon",
        values: m.mobile.appleTouchIcons.map(e => {
          return {
            value: e.href,
            label: e.sizes ?? "",
            resolvedUrl: resolveUrl(e.href),
          }
        }),
      },
      appleTouchIconsPrecomposed: {
        value: undefined,
        label: "apple-touch-icon-precomposed",
        values: m.mobile.appleTouchIconsPrecomposed.map(e => {
          return {
            value: e.href,
            label: e.sizes ?? "",
            resolvedUrl: resolveUrl(e.href),
          }
        }),
      }
    },
    // jsonld: {
    //   data: {
    //     label: "json-ld",
    //     values: m.jsonld.data,
    //   }
    // }
  } satisfies {
    [X in string]: { [Y in string]: MetadataMetadataItem & { description?: string } }
  }

  // inject the descriptions
  for (const _key in data) {
    const key = _key as keyof typeof data
    const category = data[key]
    for (const _subkey in category) {
      const subkey = _subkey as keyof typeof data[typeof key]
      const item = category[subkey] as MetadataMetadataItem & { description?: string }
      item.description = descriptions[key][subkey]
    }
  }

  // inject rawurl
  const res = {
    ...data,
    rawUrl: m.rawUrl,
  }

  return res
}

export type ResoledMetadata = ReturnType<typeof getResolvedMetadata>

export const separator = { separator: true } as const

export type FieldDataItem = MetadataMetadataItem


export const descriptions = {
  // jsonld: {
  //   data: "Structured data in JSON-LD format, used for search engine optimization and rich results.",
  // },
  general: {
    title: "The title of the page, typically displayed in the browser tab and search results.",
    description: "A brief summary of the page's content, often shown in search engine results.",
    url: "The canonical URL of the page, used to prevent duplicate content issues.",
    robots: "Instructions for search engines on how to index and follow links on the page.",
    viewport: "Defines the page's responsive behavior, commonly set for mobile-friendly design.",
    favicons: "List of all favicons found in the metadata, including different formats and sizes.",
    author: "The name of the content creator or website author.",
    keywords: "Keywords related to the page's content, used for SEO (though less relevant today).",
    generator: "The software or tool used to generate the page.",
    license: "The copyright or usage license applicable to the page content.",
    colorTheme: "Defines the preferred theme color for the browser interface.",
    applicationName: "The name of the web application, used for branding purposes.",
    colorScheme: "Specifies the preferred color scheme, such as dark or light mode.",
    formatDetection: "Hints for mobile browsers on automatic detection of phone numbers, emails, etc.",
  },
  og: {
    title: "The title of the page for Open Graph (used for rich previews on social media).",
    description: "A description of the page content for Open Graph metadata.",
    url: "The URL of the page as specified in Open Graph metadata.",
    image: "The main image used for social media previews via Open Graph.",
    type: "The Open Graph object type (e.g., website, article, video).",
    siteName: "The name of the website as recognized by Open Graph.",
    imageAlt: "Alternative text for the Open Graph image, improving accessibility.",
    locale: "The language and region settings for Open Graph metadata (e.g., en_US).",
    images: "A list of images associated with the Open Graph metadata.",
    articlePublishedTime: "The publication date of the article (for Open Graph article type).",
    articleModifiedTime: "The last modification date of the article.",
    articleExpirationTime: "The expiration date of the article (if applicable).",
    articleAuthor: "The author(s) of the article as specified in Open Graph metadata.",
    articleSection: "The section or category of the article.",
    articleTag: "Tags associated with the article, used for categorization.",
  },
  twitter: {
    title: "The title of the page for Twitter Card metadata.",
    card: "The type of Twitter Card (summary, summary_large_image, player, or app).",
    description: "A short description of the page content for Twitter previews.",
    image: "The image used in Twitter Card previews.",
    imageAlt: "Alternative text for the Twitter Card image, improving accessibility.",
    site: "The Twitter username of the website or publisher.",
    siteId: "The Twitter user ID of the website or publisher.",
    creator: "The Twitter username of the content creator.",
    creatorId: "The Twitter user ID of the content creator.",
    player: "A URL to an embeddable media player for rich Twitter Card previews.",
    playerWidth: "The width of the Twitter Card player.",
    playerHeight: "The height of the Twitter Card player.",
    playerStream: "A direct URL to the media stream used in the Twitter player.",
    appCountry: "The country code where the Twitter app is available.",
    appNameIphone: "The name of the iPhone app associated with the content.",
    appIdIphone: "The App Store ID of the iPhone app.",
    appUrlIphone: "The URL to open the iPhone app directly.",
    appNameIpad: "The name of the iPad app associated with the content.",
    appIdIpad: "The App Store ID of the iPad app.",
    appUrlIpad: "The URL to open the iPad app directly.",
    appNameGoogleplay: "The name of the Android app associated with the content.",
    appIdGoogleplay: "The Google Play Store ID of the Android app.",
    appUrlGoogleplay: "The URL to open the Android app directly.",
  },
  icons: {
    appleTouchIcons: "A list of Apple Touch Icons used for home screen shortcuts on iOS.",
    appleTouchIconsPrecomposed: "A list of precomposed Apple Touch Icons, where no effects are applied.",
  },
  rawUrl: "The original URL of the page, used as a reference for relative URLs in metadata." as any,
} satisfies {
  [X in keyof ResoledMetadata]: { [Y in keyof ResoledMetadata[X]]: string }
}
