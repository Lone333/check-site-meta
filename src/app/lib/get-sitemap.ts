import { cache } from "react";
import { appFetch, getUTF8Text } from "./fetch";
import { XMLParser } from "fast-xml-parser";
import { AppError2 } from "../module/error/error-primitives";
import type { PreviewMessages } from "../_view/previews/Preview";
import { isObject, isPropInObject } from "./validations";


export const getSitemap = cache(async function getSitemap(url: string) {
  await new Promise(resolve => setTimeout(resolve, 500))
  const res = await appFetch(url)
  const text = await getUTF8Text(res)
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
    throw new AppError2(
      'getSitemap',
      'Error parsing sitemap.xml',
      error instanceof Error ? error.message : 'Unknown Error',
      [],
      error
    )
  }
});


// eslint-disable-next-line @typescript-eslint/no-unused-expressions
// (() => {
//   const sm = getSitemap('https://example.com/sitemap.xml')
//   const res = validateSitemap(sm)
// })


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
      if (String(xml.___encoding).toLowerCase() !== 'utf-8')
        messages.push(["error", "Sitemap XML encoding is invalid. Please set it to  'utf-8' ", "root.xml.encoding"])
    }
  }


  // Check for URLSet

  if (!isPropInObject('urlset', input)) {

    if (!isPropInObject('sitemapindex', input)) {
      messages.push(["error", "Sitemap root element is missing. Sitemap requires one <urlset> or <sitemapindex> tag.", "root"])
      return { messages, res, isIndex }
    }

    const { cause, value: sitemapindex } = validateRootTags(input.sitemapindex, 'sitemapindex')
    if (cause === 'not_object') messages.push(["error", "Received invalid sitemapindex in parsed XML object. Contact developer if this occurs.", "root.sitemapindex"])
    if (cause === 'missing_xmlns') messages.push(["error", "<sitemapindex> is missing xmlns attribute. Sitemap requires xmlns attribute to be set to 'http://www.sitemaps.org/schemas/sitemap/0.9' ", "root.sitemapindex.xmlns"])
    if (cause === 'missing_entries') messages.push(["error", "<sitemapindex> is missing URL entries. Sitemap requires at least one <url> tag.", "root.sitemapindex.url"])
    if (cause === 'entries_not_object') messages.push(["error", "<sitemapindex> is missing URL entries. Sitemap requires at least one <url> tag. (invalid type)", "root.sitemapindex.url"])
    if (cause === 'entries_empty') messages.push(["error", "<sitemapindex> URL entries are empty. At least one URL entry is required.", "root.sitemapindex.url"])
    if (!sitemapindex) return { messages, res, isIndex }

    if (sitemapindex.___xmlns !== 'http://www.sitemaps.org/schemas/sitemap/0.9') messages.push(["error", "xmlns attribute is invalid. Please set it to 'http://www.sitemaps.org/schemas/sitemap/0.9' ", "root.urlset.xmlns"])

    isIndex = true
    res.sitemaps = []

    const sitemaps = sitemapindex.entries

    for (let i = 0; i < sitemaps.length; i++) {

      const { cause, value: sitemap } = validateUrlEntryOrSitemapEntry(sitemaps[i])
      if (cause === 'not_object') messages.push(["error", `Sitemap entry #${ i + 1 } is invalid. Sitemap requires Sitemap entries to be an object.`, `root.Sitemapset.url[${ i }]`])
      if (cause === 'missing_loc') messages.push(["error", `Sitemap entry #${ i + 1 } is missing loc attribute. Sitemap requires loc attribute to be set to the URL of the page.`, `root.urlset.url[${ i }]`])
      if (!sitemap) continue

      res.sitemaps.push({ loc: "" })
      const currentResSitemap = res.sitemaps[res.sitemaps.length - 1]
      const currentResSitemapIndex = res.sitemaps.length - 1

      const ctx = `Sitemap entry #${ currentResSitemapIndex }`

      // Lastmod Property
      if (isPropInObject('loc', sitemap)) {
        const { cause, value } = validateLoc(sitemap.loc)
        const prefix = `${ ctx } loc attribute is invalid.`
        if (cause === 'is_array') messages.push(['error', `${ prefix } There can only be one <loc> per sitemap entry`])
        if (cause === 'not_string') messages.push(['error', `${ prefix } Sitemap loc must be a string. Received: "${ sitemap.loc }"`])
        if (cause === 'too_short') messages.push(['error', `${ prefix } Sitemap loc must be at least 12 characters long. Received: "${ sitemap.loc }"`])
        if (cause === 'too_long') messages.push(['error', `${ prefix } Sitemap loc must be less than 2048 characters long. Received: "${ sitemap.loc }"`])
        if (cause === 'invalid_protocol') messages.push(['error', `${ prefix } Sitemap loc must start with 'http://', 'https://', or 'ftp://'. Received: "${ sitemap.loc }"`])
        if (cause === 'non_ascii') messages.push(['error', `${ prefix } Sitemap loc must only contain ASCII characters. Received: "${ sitemap.loc }"`])
        if (value) currentResSitemap.loc = value
      }

      // Lastmod Property
      if (isPropInObject('lastmod', sitemap)) {
        const { cause, value } = validateLastmod(sitemap.lastmod)
        const prefix = `${ ctx } lastmod attribute is invalid.`
        if (cause === 'is_array') messages.push(['error', `${ prefix } There can only be one <lastmod> per sitemap`])
        if (cause === 'not_string') messages.push(['error', `${ prefix } Sitemap lastmod must be a string. Received: "${ sitemap.lastmod }"`])
        if (cause === 'invalid_format') messages.push(['error', `${ prefix } Sitemap lastmod must be in W3C date format. Received: "${ sitemap.lastmod }"`])
        if (cause === 'invalid_date') messages.push(['error', `${ prefix } Sitemap lastmod must be a valid, parseable date. Received: "${ sitemap.lastmod }"`])
        if (!cause) {
          currentResSitemap.lastmod = value
          if (value.length === 4 || value.length === 7) messages.push(['warn', `${ prefix } Sitemap lastmod is too generic. Using a more precise date format (e.g., YYYY-MM-DD or a full timestamp) is recommended. Received: "${ sitemap.lastmod }"`])
        }
      }
    }

    return { messages, res, isIndex }
  }


  const { cause, value: urlset } = validateRootTags(input.urlset, 'urlset')
  if (cause === 'not_object') messages.push(["error", "Received invalid urlset in parsed XML object. Contact developer if this occurs.", "root.urlset"])
  if (cause === 'missing_xmlns') messages.push(["error", "<urlset> is missing xmlns attribute. Sitemap requires xmlns attribute to be set to 'http://www.sitemaps.org/schemas/sitemap/0.9' ", "root.urlset.xmlns"])
  if (cause === 'missing_entries') messages.push(["error", "<urlset> is missing URL entries. Sitemap requires at least one <url> tag.", "root.urlset.url"])
  if (cause === 'entries_not_object') messages.push(["error", "<urlset> is missing URL entries. Sitemap requires at least one <url> tag. (invalid type)", "root.urlset.url"])
  if (cause === 'entries_empty') messages.push(["error", "<urlset> URL entries are empty. At least one URL entry is required.", "root.urlset.url"])
  if (!urlset) return { messages, res, isIndex }

  if (urlset.___xmlns !== 'http://www.sitemaps.org/schemas/sitemap/0.9') messages.push(["error", "xmlns attribute is invalid. Please set it to 'http://www.sitemaps.org/schemas/sitemap/0.9' ", "root.urlset.xmlns"])

  res.urls = []

  const urls = urlset.entries
  for (let i = 0; i < urls.length; i++) {

    const { cause, value: url } = validateUrlEntryOrSitemapEntry(urls[i])
    if (cause === 'not_object') messages.push(["error", `URL entry #${ i + 1 } is invalid. Sitemap requires URL entries to be an object.`, `root.urlset.url[${ i }]`])
    if (cause === 'missing_loc') messages.push(["error", `URL entry #${ i + 1 } is missing loc attribute. Sitemap requires loc attribute to be set to the URL of the page.`, `root.urlset.url[${ i }]`])
    if (!url) continue

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


function validateRootTags(input: unknown, mode: 'urlset' | 'sitemapindex') {
  if (!isObject(input)) return { value: undefined, cause: 'not_object' as const }
  if (!isPropInObject('___xmlns', input)) return { value: undefined, cause: 'missing_xmlns' as const }
  const entryName = mode === 'urlset' ? 'url' : 'sitemap'

  if (!isPropInObject(entryName, input)) return { value: undefined, cause: 'missing_entries' as const }
  if (!isObject(input[entryName])) return { value: undefined, cause: 'entries_not_object' as const }
  const entries: unknown[] = !Array.isArray(input[entryName])
    ? [input[entryName]]
    : input[entryName]
  if (entries.length === 0) return { value: undefined, cause: 'entries_empty' as const }
  return {
    value: {
      ___xmlns: input.___xmlns,
      entries
    }
  }
}

function validateUrlEntryOrSitemapEntry(input: unknown) {
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

