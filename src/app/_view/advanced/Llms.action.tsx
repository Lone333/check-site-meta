"use server"

import { getLLMsStream } from "@/app/lib/get-llms"
import { serializeError } from "@/app/module/error/error-primitives"

export async function getLLMsAction(state: unknown, payload: string) {
  const llms = await getLLMsStream(payload)
  return llms
}