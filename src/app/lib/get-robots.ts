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
    const parsedRobotRaw = robotsParser(url, text)

    const parsedRobot = Object.entries(
      (JSON.parse(JSON.stringify(parsedRobotRaw)) as ParsedRobotRaw)._rules
    ).map(([userAgent, rule]) => {
      return {
        userAgent,
        rule
      }
    }) as ParsedRobotRules

    // get crawldelay for each ua
    parsedRobot.forEach((ua) => {
      const cawlDelay = parsedRobotRaw.getCrawlDelay(ua.userAgent)
      ua.crawlDelay = cawlDelay
    })

    return {
      parsed: parsedRobot,
      sitemaps: parsedRobotRaw.getSitemaps(),
      raw: text
    }
  } catch (error) {
    throw new AppError(error, 'parse', 'Error parsing robots.txt', error instanceof Error ? error.message : 'Unknown Error')
  }
})

export type GetRobotsResult = Awaited<ReturnType<typeof getRobots>>

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
  crawlDelay?: number;
  rule: {
    pattern: string;
    allow: boolean;
    lineNumber: number;
  }[];
}[]