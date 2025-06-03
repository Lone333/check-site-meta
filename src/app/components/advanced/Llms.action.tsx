"use server"

import { getLLMtext } from "@/app/lib/get-llms"
import { AppError, serializeError } from "@/app/module/error/error-primitives"


export async function getLLMsAction(_: unknown, payload: string) {
  try {
    const result = await getLLMtext(payload)
    return { data: result }
  } catch (error) {
    const parsedError = serializeError(error)
    return { error: parsedError }
  }
}