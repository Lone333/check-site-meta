"use server"

import { getRobots } from "@/app/lib/get-robots"
import { serializeError } from "@/app/module/error/error-primitives"

export async function getRobotsAction(state: unknown, payload: string) {
  try {
    const robots = await getRobots(payload)
    return { data: {...robots, id: Date.now().toString(36)  } }
  } catch (e) {
    const error = serializeError(e)
    return { error }
  }
}