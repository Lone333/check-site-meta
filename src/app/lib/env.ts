export const isDev = process.env.NODE_ENV === 'development'
export const isHosted = process.env.USING_NPX !== 'true' && process.env.NODE_ENV !== 'development'

export function eachEnv<T>(opts: {
  dev: T,
  hosted: T,
  prod: T,
}): T {
  if (isDev) return opts.dev
  if (isHosted) return opts.hosted
  return opts.prod
}