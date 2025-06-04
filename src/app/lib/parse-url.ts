import { AppError } from "../module/error/error-primitives"

export function getUrlFromQuery(query: string | string[] | undefined) {
  const url = Array.isArray(query) ? query[0] : query
  if (url === '') return undefined
  return url
}


export function parseUrlFromQuery(url: string) {

  // Define a custom error class for URL parsing errors
  class URLParseError extends AppError {
    constructor(summary: string, message: string, error?: unknown) { super('parseUrlFromQuery', summary, message, ['url: ' + url], error) }
  }

  // Check if the URL is empty
  if (url === '') throw new URLParseError(
    'Empty URL',
    'URL cannot be empty'
  )

  // Automatically add a protocol if missing
  if (!url.includes('://')) url = 'http://' + url

  // Validate the URL using the URL constructor
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch (error: any) {
    throw new URLParseError(
      'Invalid URL',
      'URL could not be parsed. Please check the URL and try again.', error,
    )
  }

  // Check if the protocol is either http or https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new URLParseError(
    'Invalid Protocol',
    'Protocol not supported. Please use http:// or https://',
  )

  return url
}
