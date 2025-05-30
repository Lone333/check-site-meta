import { AppError } from "../module/error/error-primitives"

export function parseUrlFromQuery(query: string | string[]) {

  let inferredUrl = Array.isArray(query) ? query[0] : query

  if (!inferredUrl.includes('://')) {
    inferredUrl = 'http://' + inferredUrl
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(inferredUrl)
  } catch (error) {
    throw new AppError(
      'parseUrlFromQuery',
      'Invalid URL',
      'URL could not be parsed. Please check the URL and try again.',
      [...Object.entries(JSON.parse(JSON.stringify(error))).map(([key, value]) => `${ key }: ${ value }`)],
    )
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new AppError(
      'parseUrlFromQuery',
      'Invalid Protocol',
      'Protocol not supported. Please use http:// or https://',
      ['url: ' + inferredUrl],
    )
  }

  return inferredUrl
}