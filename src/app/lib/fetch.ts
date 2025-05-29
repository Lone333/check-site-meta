import { AppError2 } from "../module/error/error-primitives";
import { isDev } from "./env";
import { getUserSettings } from "./get-settings";

const fetchInstance = fetch;


export async function appFetch(...args: Parameters<typeof fetchInstance>) {
  const settings = await getUserSettings()

  try {

    const res = await fetchInstance(args[0], {
      ...args[1],
      headers: {
        'User-Agent': settings.userAgent,
        'Accept-Language': 'en-GB-oxendict,en-GB;q=0.9,en;q=0.8,id;q=0.7,en-US;q=0.6',
        'Cache-Control': isDev ? '' : 'no-store', // Prevents caching
        'Pragma': isDev ? '' : 'no-cache', // For compatibility with HTTP/1.0 caches
        'Expires': '0', // Forces the response to always be fresh
        ...args[1]?.headers
      },
      redirect: "follow",
      cache: isDev ? undefined : "no-store"
    })
    return res
  } catch (error) {
    throw new AppError2(
      'appFetch',
      "Fetch Failed",
      "Ensure you have an active internet connection and the server is reachable.",
      ["url: " + args[0]],
      error,
    )
  }
}

export function withProxy(url: string) {
  return `/proxy-img?url=${ encodeURIComponent(url) }`
}



export async function ensureCorrectContentType(res: Response, expected: string) {
  const contentType = res.headers.get("content-type")
  if (!contentType?.includes(expected)) {
    const text = await res.clone().text()
    throw new AppError2(
      'ensureCorrectContentType',
      "Incorrect Content-Type",
      `Expected ${ expected } but got ${ contentType }`,
      [
        "Content-Type: " + contentType,
        "Content: " + text.slice(0, 1000),
      ],
    )
  }
}


export async function getUTF8Text(res: Response) {
  const buffer = await res.clone().arrayBuffer()
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true })
    return decoder.decode(buffer);
  } catch (error) {
    const text = await res.text()
    throw new AppError2(
      'getUTF8',
      "UTF-8 Decode Failed",
      "Ensure the response is valid UTF-8 encoded text.",
      [
        "url: " + res.url,
        "Content: " + text.slice(0, 100),
      ],
      error,
    )
  }
}