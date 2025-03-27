"use server"

import { getSitemap, validateSitemap } from "@/app/lib/get-sitemap"
import { parseError } from "@/app/module/error/ErrorCard"

export async function getSitemapAction(url: string) {
  try {
    const sitemap = await getSitemap(url)
    const validated = validateSitemap(sitemap.parsed)
    console.log(validated.res)
    console.log(sitemap.parsed)
    console.log(validated.messages)
    return { data: { sitemap, validated }}
  } catch (error) {
    const parsedError = parseError(error)
    return { error: parsedError }
  }
}

export type  GetSitemapActionResponse = Awaited<ReturnType<typeof getSitemapAction>>['data']