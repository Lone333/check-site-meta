"use server"

import { getRobots } from "@/app/lib/get-robots"
import { serializeError } from "@/app/module/error/error-primitives"

export async function getRobotsAction(state: unknown, payload: string) {
  try {
    const robots = await getRobots(payload)
    // delay 2000ms
    // await new Promise(resolve => setTimeout(resolve, 2000))
    // 50% chance of crashing
    // if (Math.random() < 0.5) throw new Error('Random error')
    return { data: {...robots, id: Date.now().toString(36)  } }
  } catch (e) {
    const error = serializeError(e)
    console.log(error)
    return { error }
  }
}