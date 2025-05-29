"use client"

import { useStore } from "@/app/context"
import { startTransition, use, useActionState, useState, type ReactNode } from "react"
import { getLLMsAction } from "./Llms.action"
import { MaterialSymbolsRefresh } from "./Sitemap.client"
import { CollapsibleRow } from "@/app/lib/Collapsible"
import type { FuncRet } from "@/app/lib/type"
import { CardlessHomeErrorCard } from "@/app/module/error/ErrorCard"


export function useLLMsStore() {
  const store = useStore()
  const llmsStore = store['llms'] ??= {}
  return llmsStore as {
    tab?: "parsed" | "raw"
    res?: FuncRet<typeof getLLMsAction>
    data?: FuncRet<typeof getLLMsAction>['data']
    error?: FuncRet<typeof getLLMsAction>['error']
  }
}


export function LLMsClientBoundary(props: {
  initialData: Promise<FuncRet<typeof getLLMsAction>>
  url: string
}) {
  const store = useLLMsStore()
  const initialData = use(props.initialData)
  const [res, dispatchLoadLLM, pending] = useActionState(async (state: unknown, url: string) => {
    const res = await getLLMsAction(state, url)
    store.data ??= res.data
    store.error ??= res.error
    return res
  }, store.res ?? initialData ?? undefined)

  const data = store.data ?? initialData.data
  const err = store.data ?? initialData.error





  return (
    <>
      <div className="flex gap-2 mb-4 h-8 mt-4">
        <button
          className="button-card px-4 bg-background-card border border-border hover:bg-background-button-hover text-foreground-muted"
          onClick={() => {
            if (pending) return
            startTransition(() => dispatchLoadLLM(props.url + '/llms.txt'))
          }}
        >
          <MaterialSymbolsRefresh className="size-4" />
          {pending ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="-mx-5">
        <CollapsibleRow data-opened={!!res?.data}>
          {data &&
            <div className="text-foreground-body font-normal flex flex-col gap-4 px-5">

              <div className="text-sm -mx-5 px-5 bg-background-tooltip py-4">
                <div className="font-semibold pb-2 text-foreground-muted-3">Analysis</div>
                <div className="flex flex-col">
                  <div className="meta-info-field-key">character length</div>
                  <div>{data.byteSize}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {data.contextLengths.map(val => {
                    return (
                      <div key={val.encoding} className="flex flex-col">
                        <div className="meta-info-field-key">{val.encoding}</div>
                        <div>{val.contextLength}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* <hr className="-mx-10 border border-border"/> */}
              <div>
                <div className="font-semibold pb-2 text-foreground-muted-3">Content</div>
                <pre className="overflow-auto">
                  {data.text}
                </pre>
              </div>
            </div>
          }
        </CollapsibleRow>
        <CollapsibleRow data-opened={!!res?.error}>
          {err && <CardlessHomeErrorCard
            error={err} className="fadeIn-0 p-2" />}
        </CollapsibleRow>
      </div>
    </>
  )
}