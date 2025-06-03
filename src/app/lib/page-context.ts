import { cache } from "react"
import type { NextPageProps } from "./next-types"

const query = cache(() => ({
  data: null as null | NextPageProps,
}))

/**
* Get the search parameters for the current request.
*/
export async function searchParams() {
  if (query().data === null)
    throw new Error('searchParams not initialized. Call registerParams() at the start of your page component.')
  return query().data!.searchParams
}


/**
 * Register the search parameters for the current request.
 * Recommended: call this at the start of your page component.
 */
export function registerContext(res: NextPageProps) {
  query().data = res
  return res
}




// Notes:
// - query var needs to be wrapped in `cache()` to ensure it is only set once per request.
// - This is a workaround for the fact that Next.js does not provide a way to access search parameters in the server component directly.