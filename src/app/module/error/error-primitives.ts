
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

export type ParsedError2 = {
  summary: string,
  detail?: string,
  context: string[],
  stack: string,
  who: string[],
  instanceof?: string
}

export function serializeError(error: unknown) {
  let parsedError: ParsedError2 = {
    summary: "An unknown error occurred.",
    detail: error instanceof Error ? error.message : '',
    context: [],
    who: [],
    stack: error instanceof Error ? error.stack! : '',
    instanceof: "ParsedAppError"
  }
  if (error instanceof AppError2) {
    parsedError = {
      summary: error.summary,
      detail: error.detail,
      context: error.context,
      stack: error.stack!,
      who: error.who,
      instanceof: "ParsedAppError"
    }
  }
  if (typeof error === 'object' && error && 'instanceof' in error && error.instanceof === "ParsedAppError") {
    parsedError = {
      summary: ('summary' in error && typeof error.summary === 'string') ? error.summary : "An unknown error occurred. (s)",
      detail: ('detail' in error && typeof error.detail === 'string') ? error.detail : 'Please contact the developer for more information. (s)',
      context: ('context' in error && Array.isArray(error.context)) ? error.context : [],
      stack: ('stack' in error && typeof error.stack === 'string') ? '(parsed serialized error) ' + error.stack : '',
      who: ('who' in error && Array.isArray(error.who)) ? error.who : [],
      instanceof: "ParsedAppError"
    }
  }
  return parsedError
}

export class AppError2 extends Error {

  readonly who: string[]
  readonly summary: string
  readonly detail?: string
  readonly context: string[]
  readonly error: unknown | undefined | null



  constructor(
    /** Custom-made stack implementation */
    who: string,

    /** Title of the error. Fallback to error.message if length < 50. Fallback to "An error occurred". */
    summary?: string,

    /** Description of the error. Fallback to error.message if length not yet a title. */
    detail?: string,

    /** Additional context to help debug the error such as parameters.  */
    context?: string[],
    // Stack trace is automatically included.
    // this.error.message is not used.

    /** The original error. To determine the original stack trace */
    error?: unknown | undefined | null,


  ) {
    let errorMessageUsed = false

    const isErrorObject = typeof error === 'object' && error

    const _summary = summary ?? (error instanceof AppError2
      ? error.summary
      : ((error instanceof Error && error.message.length < 50) ? (() => {
        errorMessageUsed = true
        return error.message
      })() : "An error occurred")
    )

    const _detail = detail ?? (error instanceof AppError2
      ? error.detail
      : ((error instanceof Error && !errorMessageUsed)
        ? error.message
        : "Please contact the developer for more information."
      )
    )

    const _context = error instanceof AppError2
      ? [...error.context, ...context ?? []]
      : context ?? []

    const _who = error instanceof AppError2
      ? [who, ...error.who]
      : [who]

    const message = _summary ?? _detail ?? (error instanceof Error ? error.message : "An error occurred")
    super(message)

    this.summary = _summary
    this.detail = _detail
    this.context = _context
    this.who = _who
    this.error = error

    if (!error) this.error = this
    this.name = "AppError"
    this.stack = error instanceof Error
      ? error.stack
      : this.stack
  }
}







export class AppError extends Error implements ErrorInfo {
  constructor(
    /**
     * The error that caused this error, if any.
     */
    readonly error: unknown | undefined | null,
    /**
     * The type of error. 
     * Used to categorize the error and determine how it should be handled.
     * Also determines the icon used to represent the error.
     */
    readonly type: "input" | "fetch" | "server" | "parse" | "other",
    /**
     * A short summary of the error.
     * This should be a human-readable string that describes the error in a way that is easy to understand.
     * Should be short enough to fit in a single line.
     * Shown as the title of the error card.
     */
    readonly summary: string,
    /**
     * A detailed description of the error.
     * This should provide more information about the error and how it can be resolved.
     * Example:
     */
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
