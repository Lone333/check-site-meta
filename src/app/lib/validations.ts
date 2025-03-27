export function isPropInObject<
  P extends string,
  O,
>(
  prop: P,
  obj: O
  // @ts-expect-error - This is a hack to get around TypeScript's inability to infer the type of the object
): obj is object extends O ? Record<P, unknown> : O & Record<P, unknown> {
  return typeof obj === 'object' && obj !== null && prop in obj
}
export function isObject(o: unknown): o is object {
  return typeof o === 'object' && o !== null
}
