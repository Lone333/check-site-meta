import { cache } from "react";
import { appFetch } from "./fetch";
import { XMLParser } from "fast-xml-parser";
import { AppError } from "../module/error/error-primitives";
import type { PreviewMessages } from "../_view/previews/Preview";
import { isObject, isPropInObject } from "./validations";


export const getSitemap = cache(async function getSitemap(url: string) {
  await new Promise(resolve => setTimeout(resolve, 500))
  const res = await appFetch(url)
  const text = await res.text()
  const byteSize = new TextEncoder().encode(text).length;
  try {
    const xmlparser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: false,
      parseTagValue: false,
      attributeNamePrefix: '___',
    })
    const parsed = xmlparser.parse(text)
    return { parsed, raw: text, byteSize }
  } catch (error) {
    throw new AppError(error, 'parse', 'Error parsing sitemap.xml', error instanceof Error ? error.message : 'Unknown Error')
  }
});


// eslint-disable-next-line @typescript-eslint/no-unused-expressions
(() => {
  const sm = getSitemap('https://example.com/sitemap.xml')
  const res = validateSitemap(sm)
})


export type Sitemap = {
  urls?: {
    loc: string
    lastmod?: string
    changefreq?: string
    priority?: number
  }[],
  sitemaps?: {
    loc: string,
    lastmod?: string
  }[],
}


export function validateSitemap(input: object) {
  const messages: PreviewMessages = []
  const res: Sitemap = {}
  let isIndex = false

  if (!input) {
    messages.push(["error", "Sitemap not found", "root"])
    return { messages, res, isIndex }
  }


  // Check for XML declaration





  if ('?xml' in input === false) {
    messages.push(["warn", "XML declaration not found.", "root.xml"])
  } else {
    const xml = input['?xml']
    if (!isPropInObject('___version', xml)) {
      messages.push(["error", "Sitemap XML version is missing. ", "root.xml.version"])
    } else {
      if (!['1.0', '1.1'].includes(xml.___version + ''))
        messages.push(["error", "Sitemap XML version is invalid. Please set either to either '1.0' or '1.1'", "root.xml.version"])
    }
    if (!isPropInObject('___encoding', xml)) {
      messages.push(["warn", "Sitemap XML encoding is missing", "root.xml.encoding"])
    } else {
      if (xml.___encoding !== 'UTF-8')
        messages.push(["error", "Sitemap XML encoding is invalid. Please set it to  'UTF-8' ", "root.xml.encoding"])
    }
  }


  // Check for URLSet

  if (!isPropInObject('urlset', input)) {

    if (!isPropInObject('sitemapindex', input)) {
      messages.push(["error", "Sitemap root element is missing. Sitemap requires one <urlset> or <sitemapindex> tag.", "root"])
      return { messages, res, isIndex }
    } else {
      isIndex = true
      res.sitemaps = []
      const sitemapindex = input.sitemapindex
      if (!isPropInObject('sitemap', sitemapindex)) {
        messages.push(["error", "Sitemap Index is missing <sitemap> entries. Sitemap Index <sitemapindex> requires at least one <sitemap> tag.", "root.sitemapindex.sitemap"])
      } else {
        let sitemaps = []
        if (!Array.isArray(sitemapindex.sitemap)) {
          if (typeof sitemapindex.sitemap !== 'object') {
            messages.push(['error', 'Sitemap Index sitemap entries are invalid. Sitemap Index <sitemapindex> requires at least one <sitemap> tag.', 'root.sitemapindex.sitemap'])
          } else {
            sitemaps = [sitemapindex.sitemap]
          }
        } else {
          sitemaps = sitemapindex.sitemap
        }
        if (!Array.isArray(sitemaps)) {
          messages.push(["error", "Sitemap Index sitemap entries are invalid. Sitemap Index requires sitemap entries to be an array.", "root.sitemapindex.sitemap"])
        }
        if (sitemaps.length === 0) {
          messages.push(["error", "Sitemap Index sitemap entries are empty. Sitemap Index requires at least one sitemap entry.", "root.sitemapindex.sitemap"])
        } else {
          for (let i = 0; i < sitemaps.length; i++) {
            const sitemap = sitemaps[i]
            if (!isPropInObject('loc', sitemap)) {
              messages.push(["error", `Sitemap Index sitemap entry #${ i + 1 } is missing loc attribute. Sitemap Index requires loc attribute to be set to the URL of the sitemap.`, `root.sitemapindex.sitemap[${ i }].loc`])
            } else {
              const loc = sitemap['loc']
              if (Array.isArray(loc)) {
                messages.push(["error", `Sitemap Index sitemap entry loc attribute #${ i + 1 } is invalid. There can only be one loc per sitemap`, `root.sitemapindex.sitemap[${ i }].loc`])
              } else {
                if (typeof loc !== 'string') {
                  messages.push(["error", `Sitemap Index sitemap entry loc attribute #${ i + 1 } is invalid. Sitemap Index requires loc attribute to be a string.`, `root.sitemapindex.sitemap[${ i }].loc`])
                } else {
                  res.sitemaps[i] = { loc }
                  if (loc.length === 0) {
                    messages.push(["error", `Sitemap Index sitemap entry loc attribute #${ i + 1 } is empty. Sitemap Index requires loc attribute to be set to the URL of the sitemap.`, `root.sitemapindex.sitemap[${ i }].loc`])
                  }
                  if (loc.length === 12) {
                    messages.push(["error", `Sitemap Index sitemap entry loc attribute #${ i + 1 } is empty. Sitemap Index requires loc attribute to be set to the URL of the sitemap.`, `root.sitemapindex.sitemap[${ i }].loc`])
                  }
                  if (loc.length > 2048) {
                    messages.push(["warn", `Sitemap Index sitemap entry loc attribute #${ i + 1 } is too long. Sitemap Index requires loc attribute to be less than 2048 characters.`, `root.sitemapindex.sitemap[${ i }].loc`])
                  }
                  if (!['https', 'http', 'ftp'].includes(loc.split('://')[0])) {
                    messages.push(["warn", `Sitemap Index sitemap entry loc attribute #${ i + 1 } is invalid. Sitemap Index requires loc attribute to start with 'http://', 'https://', or 'ftp://'`, `root.sitemapindex.sitemap[${ i }].loc`])
                  }
                  // check if string has non-ASCII characters
                  if (/[^\x00-\x7F]/.test(loc)) {
                    messages.push(["warn", `Sitemap Index sitemap entry loc attribute #${ i + 1 } is invalid. The loc attribute must only contain ASCII characters. Non-ASCII characters are not allowed in sitemap URLs.`, `root.sitemapindex.sitemap[${ i }].loc`])
                  }
                }
              }
            }

            // Lastmod Property
            if (isPropInObject('lastmod', sitemap)) {
              const lastmod = sitemap['lastmod']
              if (Array.isArray(lastmod)) {
                messages.push(["error", `Sitemap Index sitemap entry lastmod attribute #${ i + 1 } is invalid. There can only be one lastmod per sitemap`, `root.sitemapindex.sitemap[${ i }].lastmod`])
              } else {
                if (typeof lastmod !== 'string') {
                  messages.push(["error", `Sitemap Index sitemap entry lastmod attribute #${ i + 1 } is invalid. Sitemap Index requires lastmod attribute to be a string.`, `root.sitemapindex.sitemap[${ i }].lastmod`])
                } else {
                  res.sitemaps[i].lastmod = lastmod
                  if (lastmod.length === 0) {
                    messages.push(["error", `Sitemap Index sitemap entry lastmod attribute #${ i + 1 } is empty. Sitemap Index requires lastmod attribute to be set to the date of last modification of the sitemap.`, `root.sitemapindex.sitemap[${ i }].lastmod`])
                  }
                  if (lastmod.length < 10) {
                    messages.push(["warn", `Sitemap Index sitemap entry lastmod attribute #${ i + 1 } is too long. Sitemap Index requires lastmod attribute to be in atleast YYYY-MM-DD format.`, `root.sitemapindex.sitemap[${ i }].lastmod`])
                  }
                  // ensure in YYYY-MM-DD format
                  if (!/^\d{4}-\d{2}-\d{2}([Tt]\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})?)?$/.test(lastmod) || isNaN(new Date(lastmod).getTime())) {
                    messages.push(["warn", `Sitemap Index sitemap entry lastmod attribute #${ i + 1 } is invalid. Sitemap Index requires lastmod attribute to be in YYYY-MM-DD or YYYY-MM-DDThh:mm:ss±hh:mm format.`, `root.sitemapindex.sitemap[${ i }].lastmod`])
                  }
                }
              }
            }
          }
        }
      }
    }
    return { messages, res, isIndex }
  }

  res.urls = []

  const urlset = input.urlset

  function validateUrlset(input: unknown) {
    if (!isObject(input)) return { value: undefined, cause: 'not_object' as const }
    if (!isPropInObject('___xmlns', input)) return { value: undefined, cause: 'missing_xmlns' as const }
    if (!isPropInObject('url', input)) return { value: undefined, cause: 'missing_url' as const }
    return { value: input }
  }

  const { cause, value } = validateUrlset(urlset)
  if (cause === 'not_object') messages.push(["error", "Received invalid urlset in parsed XML object. Contact developer if this occurs.", "root.urlset"])
  if (cause === 'missing_xmlns') messages.push(["error", "<urlset> is missing xmlns attribute. Sitemap requires xmlns attribute to be set to 'http://www.sitemaps.org/schemas/sitemap/0.9' ", "root.urlset.xmlns"])
  if (cause === 'missing_url') messages.push(["error", "<urlset> is missing URL entries. Sitemap requires at least one <url> tag.", "root.urlset.url"])


  if (!isPropInObject('___xmlns', urlset)) {
    messages.push(["error", "<urlset> is missing xmlns attribute. Sitemap requires xmlns attribute to be set to 'http://www.sitemaps.org/schemas/sitemap/0.9' ", "root.urlset.xmlns"])
  } else {
    if (urlset.___xmlns !== 'http://www.sitemaps.org/schemas/sitemap/0.9')
      messages.push(["error", "xmlns attribute is invalid. Please set it to 'http://www.sitemaps.org/schemas/sitemap/0.9' ", "root.urlset.xmlns"])
  }


  if (!isPropInObject('url', urlset)) {
    messages.push(["error", "<urlset> is missing URL entries. Sitemap requires at least one <url> tag.", "root.urlset.url"])
  } else {
    let urls: unknown[] = []
    if (!Array.isArray(urlset.url)) {
      if (typeof urlset.url !== 'object') {
        messages.push(['error', '<urlset> URL entries are invalid. Sitemap requires URL entries to be an array.', 'root.urlset.url'])
      } else {
        urls = [urlset.url]
      }
    } else {
      urls = urlset.url
    }


    if (urls.length === 0) {
      messages.push(["error", "<urlset> URL entries are empty. At least one URL entry is required.", "root.urlset.url"])
    } else {

      for (let i = 0; i < urls.length; i++) {

        const { cause, value } = validateUrl(urls[i])
        if (cause === 'not_object') messages.push(["error", `URL entry #${ i + 1 } is invalid. Sitemap requires URL entries to be an object.`, `root.urlset.url[${ i }]`])
        if (cause === 'missing_loc') messages.push(["error", `URL entry #${ i + 1 } is missing loc attribute. Sitemap requires loc attribute to be set to the URL of the page.`, `root.urlset.url[${ i }]`])
        if (!value) continue

        const url = value
        res.urls.push({ loc: "" })
        const currentResUrl = res.urls[res.urls.length - 1]
        const currentResUrlIndex = res.urls.length - 1



        const ctx = `URL entry #${ currentResUrlIndex }`

        if (isPropInObject('loc', url)) {
          const { cause, value } = validateLoc(url.loc)
          const prefix = `${ ctx } loc attribute is invalid.`
          if (cause === 'is_array') messages.push(['error', `${ prefix } There can only be one <loc> per url`])
          if (cause === 'not_string') messages.push(['error', `${ prefix } Sitemap loc must be a string. Received: "${ url.loc }"`])
          if (cause === 'too_short') messages.push(['error', `${ prefix } Sitemap loc must be at least 12 characters long. Received: "${ url.loc }"`])
          if (cause === 'too_long') messages.push(['error', `${ prefix } Sitemap loc must be less than 2048 characters long. Received: "${ url.loc }"`])
          if (cause === 'invalid_protocol') messages.push(['error', `${ prefix } Sitemap loc must start with 'http://', 'https://', or 'ftp://'. Received: "${ url.loc }"`])
          if (cause === 'non_ascii') messages.push(['error', `${ prefix } Sitemap loc must only contain ASCII characters. Received: "${ url.loc }"`])
          if (value) currentResUrl.loc = value
        }

        // Lastmod Property
        if (isPropInObject('lastmod', url)) {
          const { cause, value } = validateLastmod(url.lastmod)
          const prefix = `${ ctx } lastmod attribute is invalid.`
          if (cause === 'is_array') messages.push(['error', `${ prefix } There can only be one <lastmod> per url`])
          if (cause === 'not_string') messages.push(['error', `${ prefix } Sitemap lastmod must be a string. Received: "${ url.lastmod }"`])
          if (cause === 'invalid_format') messages.push(['error', `${ prefix } Sitemap lastmod must be in W3C date format. Received: "${ url.lastmod }"`])
          if (cause === 'invalid_date') messages.push(['error', `${ prefix } Sitemap lastmod must be a valid, parseable date. Received: "${ url.lastmod }"`])
          if (!cause) {
            currentResUrl.lastmod = value
            if (value.length === 4 || value.length === 7) messages.push(['warn', `${ prefix } Sitemap lastmod is too generic. Using a more precise date format (e.g., YYYY-MM-DD or a full timestamp) is recommended. Received: "${ url.lastmod }"`])
          }
        }

        // ChangeFreq Property
        if (isPropInObject('changefreq', url)) {
          const { cause, value } = validateChangefreq(url.changefreq)
          const prefix = `${ ctx } changefreq attribute is invalid.`
          if (cause === 'is_array') messages.push(['error', `${ prefix } There can only be one <changefreq> per url`])
          if (cause === 'not_string') messages.push(['error', `${ prefix } Sitemap changefreq must be a string. Received: "${ url.changefreq }"`])
          if (cause === 'not_included') messages.push(['error', `${ prefix } Sitemap changefreq must be one of: 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'. Received: "${ url.changefreq }"`])
          if (!cause) currentResUrl.changefreq = value
        }

        // Priority Property
        if (isPropInObject('priority', url)) {
          const { cause, value } = validatePriority(url.priority)
          const prefix = `${ ctx } priority attribute is invalid.`
          if (cause === 'is_array') messages.push(['error', `${ prefix } There can only be one <priority> per url`])
          if (cause === 'not_numeric') messages.push(['error', `${ prefix } Sitemap priority must be a number. Received: "${ url.priority }"`])
          if (cause === 'out_of_range') messages.push(['error', `${ prefix } Sitemap priority must be a number between 0 and 1. Received: "${ url.priority }"`])
          if (!cause) currentResUrl.priority = value
        }


      }
    }
  }


  return { messages, res, isIndex }
}


// Reference: https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
export const sitemapDocupmentation = {
  urlset: "Container for a set of up to 50,000 document elements. This is the root element of the XML file.",
  url: "Container for the data needed to describe a document to crawl.",
  loc: "REQUIRED: The location URI of a document. The URI must conform to RFC 2396 (http://www.ietf.org/rfc/rfc2396.txt).",
  lastmod: "OPTIONAL: The date the document was last modified. The date must conform to the W3C DATETIME format (http://www.w3.org/TR/NOTE-datetime). Example: 2005-05-10 Lastmod may also contain a timestamp. Example: 2005-05-10T17:33:30+08:00",
  changefreq: `OPTIONAL: Indicates how frequently the content at a particular URL is likely to change. The value "always" should be used to describe documents that change each time they are accessed. The value "never" should be used to describe archived URLs. Please note that web crawlers may not necessarily crawl pages marked "always" more often. Consider this element as a friendly suggestion and not a command.`,
  priority: `OPTIONAL: The priority of a particular URL relative to other pages on the same site. The value for this element is a number between 0.0 and 1.0 where 0.0 identifies the lowest priority page(s). The default priority of a page is 0.5. Priority is used to select between pages on your site. Setting a priority of 1.0 for all URLs will not help you, as the relative priority of pages on your site is what will be considered.`
}

export type GetSitemapResponse = Awaited<ReturnType<typeof getSitemap>>
export type validateSitemapResponse = Awaited<ReturnType<typeof validateSitemap>>





function isNumeric(input: unknown): input is number {
  if (typeof input === "number") return true
  if (typeof input === "string" && !isNaN(Number(input))) return true
  return false
}
function isBetween(input: number, min: number, max: number) {
  return input >= min && input <= max
}
function isW3CDate(input: string) {
  const patterns = [
    /^\d{4}$/,
    /^\d{4}-\d{2}$/,
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+(?:Z|[+-]\d{2}:\d{2})$/
  ]
  if (!patterns.some(pattern => pattern.test(input))) return false
  return true
}
function isValidDate(input: string) {
  return !isNaN(new Date(input).getTime())
}




function validateUrl(input: unknown) {
  if (!isObject(input)) return { value: undefined, cause: 'not_object' }
  if (!isPropInObject('loc', input)) return { value: input, cause: 'missing_loc' }
  return { value: input }
}
function validatePriority(input: unknown) {
  if (Array.isArray(input)) return { value: undefined, cause: "is_array" as const }
  if (!isNumeric(input)) return { value: undefined, cause: "not_numeric" as const }
  const num = Number(input)
  if (!isBetween(num, 0, 1)) return { value: undefined, cause: "out_of_range" as const }
  return { value: num, cause: undefined }
}
function validateChangefreq(input: unknown) {
  if (Array.isArray(input)) return { value: undefined, cause: "is_array" as const }
  if (typeof input !== 'string') return { value: undefined, cause: "not_string" as const }
  if (!['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].includes(input)) return { value: undefined, cause: "not_included" as const }
  return { value: input, cause: undefined }
}
function validateLastmod(input: unknown) {
  if (Array.isArray(input)) return { value: undefined, cause: "is_array" as const }
  if (typeof input !== 'string') return { value: undefined, cause: "not_string" as const }
  if (!isW3CDate(input)) return { value: undefined, cause: "invalid_format" as const }
  if (!isValidDate(input)) return { value: undefined, cause: "invalid_date" as const }
  return { value: input, cause: undefined }
}
function validateLoc(input: unknown) {
  if (Array.isArray(input)) return { value: undefined, cause: 'is_array' as const }
  if (typeof input !== 'string') return { value: undefined, cause: 'not_string' as const }
  if (input.length < 12) return { value: undefined, cause: 'too_short' as const }
  if (input.length > 2048) return { value: undefined, cause: 'too_long' as const }
  if (!['https', 'http', 'ftp'].includes(input.split('://')[0])) return { value: undefined, cause: 'invalid_protocol' as const }
  if (/[^\x00-\x7F]/.test(input)) return { value: undefined, cause: 'non_ascii' as const }
  return { value: input }
}

