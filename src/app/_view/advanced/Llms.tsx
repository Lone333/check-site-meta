import { CardHeader, CardHeaderSubtitle, CardHeaderTitle } from "../Card"
import { LLMsClientBoundary } from "./Llms.client"

export function LLMs(props: {
  url: string
}) {
  return <div className="flex flex-col">
    <CardHeader className="pb-4">
      <CardHeaderTitle>
        LLMs.txt (beta)
      </CardHeaderTitle>
      <CardHeaderSubtitle>
        {`A standardized file that helps Large Language Models (LLMs) understand and interact with a website's content.`}
      </CardHeaderSubtitle>
      <LLMsClientBoundary url={props.url} />
    </CardHeader>
  </div>
}
