"use client"

import { useStore } from "@/app/context"
import { startTransition, useActionState, useEffect, useState } from "react"
import { getLLMsAction } from "./Llms.action"
import { processTextStream } from "@/app/lib/stream"


export function useLLMsStore() {
  const store = useStore()
  const llmsStore = store['llms'] ??= {}
  return llmsStore as {
    tab?: "parsed" | "raw"
    // expandArr?: boolean[]
    // res?: FuncRet<typeof getRobotsAction>
  }
}


export function LLMsClientBoundary(props: {
  url: string
}) {
  const [messages, setMessages] = useState<string[]>([])
  return (
    <>
      <button
        
        onClick={async () => {
        setMessages([])
        const stream = await getLLMsAction(undefined, props.url)
        processTextStream(stream, (value) => {
          setMessages((prev) => [...prev, value])
        })
      }}>Fetch LLMS.txt</button>
      <div>LLMs Client Boundary</div>
      <pre className="text-xxs">
        {messages.map((message, index) => (
          <span key={index}>{message}</span>
        ))}
      </pre>
    </>
  )
}