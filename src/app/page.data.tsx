import { cache } from "react"
import { AppError } from "./module/error/error-primitives"
import { parseUrlFromQuery } from "./lib/parse-url"
import { fetchRoot, getMetadataValues } from "./lib/get-metadata"
import { getResolvedMetadata } from "./lib/get-resolved-metadata"

export const getSiteMetadata = cache(async (urlinput: string) => {
  try {
    const url = parseUrlFromQuery(urlinput)
    const { root, html } = await fetchRoot(url)
    const metadata = getMetadataValues(root, url)
    const resolved = getResolvedMetadata(metadata)
    return { resolved, html, root, url }
  } catch (error) {
    throw new AppError('getPageData', undefined, undefined, undefined, error)
  }
})

export type SiteMetadata = Awaited<ReturnType<typeof getSiteMetadata>>
