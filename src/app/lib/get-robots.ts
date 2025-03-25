import robotsParser from "robots-parser"
import { appFetch } from "./fetch"
import { cache } from "react"
import { AppError } from "../module/error/error-primitives"

export const getRobots = cache(async function getRobots(url: string) {
  await new Promise(resolve => setTimeout(resolve, 500))
  const res = await appFetch(new URL('/robots.txt', url).toString())
  const text = await res.text()
  if (!['#', 'U', 'D', 'A', 'S'].includes(text.trim().at(0) ?? '')) {
    throw new AppError(null, 'parse', 'Invalid robots.txt', 'robots.txt must start with a comment or a user-agent directive')
  }
  try {
    const parsedRobot = robotsParser(url, text)
    return {
      parsed: JSON.parse(JSON.stringify(parsedRobot)) as ParsedRobotRaw,
      raw: text
    }
  } catch (error) {
    throw new AppError(error, 'parse', 'Error parsing robots.txt', error instanceof Error ? error.message : 'Unknown Error')
  }
})

type ParsedRobotRaw = {
  _preferredHost: string,
  _sitemaps: string[],
  _url: string,
  _rules: Record<string, {
    pattern: string,
    allow: boolean,
    lineNumber: number,
  }[]>
}

export type ParsedRobotRules = {
  userAgent: string;
  rule: {
    pattern: string;
    allow: boolean;
    lineNumber: number;
  }[];
}[]