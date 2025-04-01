"use server"

import { getSitemap, validateSitemap } from "@/app/lib/get-sitemap"
import { serializeError } from "@/app/module/error/error-primitives"

export async function getSitemapAction(url: string) {
  try {
    const sitemap = await getSitemap(url)
    const validated = validateSitemap(sitemap.parsed)
    return { data: { sitemap, validated }}
  } catch (error) {
    const parsedError = serializeError(error)
    return { error: parsedError }
  }
}

export type GetSitemapActionResponse = Awaited<ReturnType<typeof getSitemapAction>>['data']
