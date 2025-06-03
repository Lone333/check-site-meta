import { Suspense } from "react"
import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card"
import { getLLMsAction } from "./Llms.action"
import { LLMsClientBoundary } from "./Llms.client"

export async function LLMs(props: {
  url: string
}) {
  const res = getLLMsAction(undefined, props.url + '/llms.txt')

  return <div className="flex flex-col">
    <CardHeader className="pb-4">
      <CardHeaderTitle>
        LLMs.txt (beta)
      </CardHeaderTitle>
      <CardHeaderSubtitle>
        {`A standardized file that helps Large Language Models (LLMs) understand and interact with a website's content.`}
      </CardHeaderSubtitle>
      <Suspense fallback="Loading...">
        <LLMsClientBoundary
          url={props.url}
          initialData={res}
        />
      </Suspense>
    </CardHeader>
  </div>
}
