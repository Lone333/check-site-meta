import robotsParser from "robots-parser"
import { appFetch, getUTF8Text } from "./fetch"
import { cache } from "react"
import { AppError2 } from "../module/error/error-primitives"

export const getRobots = cache(async function getRobots(url: string) {
  const res = await appFetch(new URL('/robots.txt', url).toString())
  const text = await getUTF8Text(res)
  if (!['#', 'U', 'D', 'A', 'S'].includes(text.trim().at(0) ?? '')) {
    throw new AppError2(
      'getRobots',
      'Invalid robots.txt',
      'robots.txt must start with a comment or a user-agent directive. See https://developers.google.com/search/reference/robots_txt',
      ['Content: ' + text.slice(0, 1000)],
    )
  }

  try {
    const parsedRobotRaw = robotsParser(url, text)

    const parsedRobot = Object.entries(
      (JSON.parse(JSON.stringify(parsedRobotRaw)) as ParsedRobotRaw)._rules
    ).map(([userAgent, rule]) => {
      return { userAgent, rule }
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
    throw new AppError2(
      'getRobots',
      'Error parsing robots.txt',
      'An error occurred while parsing the robots.txt file.',
      ['Content: ' + text.slice(0, 1000)],
      error
    )
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