
export type ErrorInfo = {
  type: "input" | "fetch" | "server" | "parse" | "other"
  summary: string,
  detail?: string,
  context: string[],
}

export function createError(
  type: ErrorInfo["type"],
  summary: string,  
  detail?: string,
  context?: string[],
): ErrorInfo {
  return { type, summary, detail, context: context ?? [] }
}

export class AppError extends Error implements ErrorInfo {
  constructor(
    readonly error: unknown | undefined | null,
    readonly type: "input" | "fetch" | "server" | "parse" | "other",
    readonly summary: string,
    readonly detail?: string | undefined,
    readonly context: string[] = [],
  ) {
    super(summary)
    if (!error) {
      this.error = new Error(summary)
    }
    this.name = "AppError"
  }

  toObject(): ErrorInfo {
    return {
      type: this.type,
      summary: this.summary,
      detail: this.detail,
      context: this.context,
    }
  }
}
