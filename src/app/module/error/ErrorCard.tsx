import { Fragment, type ComponentProps, type ReactNode, type SVGProps } from "react"
import { serializeError, type ParsedError } from "./error-primitives"
import { cn } from "lazy-cn"

const ErrorInfoMessages = {
  input: {
    logo: <></>,
    tips: "Please check the input and try again.",
  },
  fetch: {
    logo: <></>,
    tips: "Ensure you have an active internet connection and the server is reachable.",
  },
  server: {
    logo: <></>,
    tips: `The server returned an error. Check the API logs for more details.

    - The server may be misconfigured or throwing an internal error.
    - Verify the request parameters and headers.`,
  },
  parse: {
    logo: <></>,
    tips: `The server response could not be parsed. Please check the server response or try another URL that returns HTML.`,
  },
  other: {
    logo: <></>,
    tips: "An unknown error occurred. Check the console and network logs for details.",
  }
}

function ContextBox({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("font-mono p-2 px-2 bg-background text-foreground-muted-2 text-xs border border-border rounded-md whitespace-pre overflow-auto font-normal", className)} {...props} />
}

function LucideTriangleAlert(props: SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"></path></svg>
}

export function StackTrace(props: ComponentProps<"div"> & { stack?: string }) {
  if (!props.stack) return null
  return (
    <div {...props} className={cn("fadeIn-0", props.className)} >
      <ContextBox className="text-sm">{props.stack}</ContextBox>
    </div>
  )
}









export function ErrorMessageBase({ error, children, ...rest }:
  & { error: unknown }
  & Omit<ComponentProps<"div">, 'children'>
  & { children?: (error: ParsedError) => ReactNode }
) {
  const parsedError = serializeError(error)

  if (!children) return null
  return (
    <div {...rest} className={cn("fadeIn-0", rest.className)} >
      {children(parsedError)}
    </div>
  )
}




export function HomeErrorCard({ children, ...props }: { error: unknown } & ComponentProps<"div">) {
  return (
    <ErrorMessageBase {...props} className={cn("card", props.className)} >
      {({ summary, detail, context, stack, who }) => (
        <div className="flex flex-col gap-3 items-start">

          <div className="shrink-0 text-red-400 p-2 rounded-md bg-[light-dark(var(--color-red-100),--alpha(var(--color-red-500)/0.2))]">
            <LucideTriangleAlert className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="font-semibold text-lg leading-none!">{summary}</div>
            <div className="text-foreground-body">{detail}</div>
          </div>

          <ContextBox className="whitespace-pre-wrap break-word max-w-full w-full">
            {context.map((context, index) => (
              <Fragment key={index}>
                <div>{context}</div>
                <hr className="border-border my-2 -mx-2" />
              </Fragment>
            ))}

            {who.length > 0 && (
              <>
                <div className="whitespace-pre scrollbar-thin break-all overflow-auto">
                  {formatWho(who)}
                </div>
                <hr className="border-border my-2 -mx-2" />
              </>
            )}

            <div className="whitespace-pre -mb-2 pb-3 -mx-2 px-2 -mt-2 pt-3 scrollbar-thin break-all overflow-auto">
              {formatStack(stack)}
            </div>
          </ContextBox>

          {children}
        </div>
      )}
    </ErrorMessageBase>
  )
}


export function CardlessHomeErrorCard({ error, children, ...props }: { error: unknown } & ComponentProps<"div">) {
  return (
    <HomeErrorCard error={error} {...props} className={cn("border-none p-0", props.className)} />
  )
}




function formatStack(stack?: string) {
  if (!stack) return ''
  const lines = stack.split('\n')
  const jsx = lines.map((line, index) => {
    const isStackDetail = line.includes('at ')
    const leadingSpaceCount = line.match(/^\s*/)?.[0].length
    return (
      <div key={index} style={{
        paddingLeft: leadingSpaceCount ? `${ (leadingSpaceCount + 1) * 0.5 }ch` : undefined,
        textIndent: leadingSpaceCount ? '-1ch' : undefined,
      }} className={cn(
        isStackDetail && "text-xxs",
      )}>
        {
          isStackDetail
            ? (() => {
              const [at, what, ...rest] = line.trim().split(' ')
              return (<>
                <span className="text-foreground-muted-2">{at} {what}</span>{' '}
                <span className="text-foreground-muted-2/50">{rest.join(' ')}</span>
              </>)
            })()
            : line.trim()
        }
      </div>
    )
  })
  return jsx
}

function formatWho(whos?: string[]) {
  if (!whos) return ''
  const jsx = whos.map((line, index) => {
    return (
      <div key={index} style={{
        paddingLeft: `${ index }ch`,
      }}>
        {index !== 0 && '↳ '}
        {line}
      </div>
    )
  })
  return jsx
}