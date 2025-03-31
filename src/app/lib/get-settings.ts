import { cookies } from "next/headers"
import { defaultUserAgent } from "./fetch-defaults"

export async function getUserSettings() {
  const cookie = await cookies()
  return {
    userAgent: cookie.get('userAgent')?.value || defaultUserAgent
  }
}
export type UserSettings = Awaited<ReturnType<typeof getUserSettings>>

// N.B. No need to catch errors here as it must be developer error if this fails.