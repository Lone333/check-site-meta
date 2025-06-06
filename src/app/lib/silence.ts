/**
 * This function silence the rejection of a promise.
 * This is used when promise rejection is handled elsewhere
 *  and ensures that the declaration of the promise
 *  does not cause an unhandled rejection warning.
 * 
 * Example:
 * ```ts
 * const promise = silence(fetch('https://example.com/api/data'))
 * return (
 *   <Suspense fallback={<Loading />}>
 *     <$ truthy
 *       await={promise}
 *       then={data => <DataComponent data={data} />}
 *       catch={error => <ErrorComponent error={error} />}
 *     />
 *   </Suspense>
 * )
 * 
 * ```
 */
export function silence<T>(p: Promise<T>) {
  p?.catch(() => { })
  return p
} 