"use client"

import type { ParsedRobotRules } from "@/app/lib/get-robots";
import { cn } from "lazy-cn";
import { useState, type SVGProps } from "react";
import { FormButton } from "../inputs/InputForm";
import { CollapsibleRow } from "@/app/lib/Collapsible";
import { useExpandableList } from "@/app/lib/Collapsible.client";

export function RobotsClientDetails(props: {
  uaRules: ParsedRobotRules
}) {
  const rules = props.uaRules

  const [search, setSearch] = useState("")
  const filteredRules = search ? rules.filter((r) => {
    const inUserAgent = r.userAgent.includes(search)
    if (inUserAgent) return true
    const inRules = r.rule.some((r) => r.pattern.includes(search))
    return inRules
  }) : rules

  const {
    isExpanded,
    toggaleExpanse,
    expandAll,
    collapseAll,
  } = useExpandableList(rules)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 grow items-center max-w-2xl">
        <div className="grow card p-0 flex h-9 rounded-full bg-background-card-input overflow-hidden px-4">
          <input
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search rules"
            className="grow focus:outline-none font-normal" />
        </div>
        <div>
          <FormButton onClick={collapseAll}>
            <MdiArrowCollapseAll className="w-4 h-4" />
          </FormButton>
          <FormButton onClick={expandAll}>
            <MdiArrowExpandAll className="w-4 h-4" />
          </FormButton>
        </div>
      </div>
      <pre className="text-sm flex flex-col gap-2">
        {filteredRules.map((rule, i) => {
          const expanded = isExpanded(i)
          return (
            <div key={i} className="border border-border rounded-md overflow-hidden">
              <div className="bg-background flex">
                <button className="flex items-center gap-2 p-2 pl-3 grow leading-none"
                  onClick={() => toggaleExpanse(i)}
                >
                  <MaterialSymbolsExpandMoreRounded className={cn("w-4 h-4 transition-all",
                    expanded ? "rotate-180" : "rotate-0"
                  )} />
                  <span className="font-semibold">{rule.userAgent}</span>
                  <div className="text-xs flex gap-2">
                    {rule.userAgent === "*" && <span className="text-foreground-muted-2">(All)</span>}
                    <span className="text-foreground-muted-2">({rule.rule.length} rules)</span>
                  </div>
                  {!!rule.crawlDelay && (
                    <div className="py-0.5 flex gap-2 items-center text-[0.7rem] text-foreground-muted-3">
                      <div className={cn("uppercase")}>
                        <MaterialSymbolsAlarm />
                      </div> {rule.crawlDelay} seconds
                    </div>
                  )}
                </button>
              </div>
              <CollapsibleRow data-opened={expanded}>
                <div className="text-xs p-2 pl-4">

                  {rule.rule.map((r, j) => {
                    return (
                      <div key={j} className={cn(
                        "py-0.5 grid grid-cols-[4rem_1fr] place-items-start gap-x-2",
                        r.allow
                          ? "text-[light-dark(var(--color-green-500),--alpha(var(--color-green-300)/0.7))]"
                          : "text-[light-dark(var(--color-red-400),--alpha(var(--color-red-400)/0.8))]"
                      )}>
                        <div className={cn(
                          "py-0.5 px-1.5 border border-border text-[0.6rem] rounded-full bg-background-muted-2 uppercase",
                          r.allow
                            ? "text-green-500 bg-green-500/20 border-green-500/40"
                            : "text-red-400 bg-red-400/20 border-red-400/40"
                        )}>
                          {r.allow ? "Allow" : "Disallow"}
                        </div> {r.pattern}
                      </div>
                    )
                  })}
                </div>
              </CollapsibleRow>
            </div>
          )
        })}
      </pre>
    </div>
  )
}




function MdiArrowCollapseAll(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="m19.5 3.09l1.41 1.41l-4.5 4.5H20v2h-7V4h2v3.59zm1.41 16.41l-1.41 1.41l-4.5-4.5V20h-2v-7h7v2h-3.59zM4.5 3.09L9 7.59V4h2v7H4V9h3.59l-4.5-4.5zM3.09 19.5l4.5-4.5H4v-2h7v7H9v-3.59l-4.5 4.5z"></path></svg>)
}
function MdiArrowExpandAll(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="m9.5 13.09l1.41 1.41l-4.5 4.5H10v2H3v-7h2v3.59zm1.41-3.59L9.5 10.91L5 6.41V10H3V3h7v2H6.41zm3.59 3.59l4.5 4.5V14h2v7h-7v-2h3.59l-4.5-4.5zM13.09 9.5l4.5-4.5H14V3h7v7h-2V6.41l-4.5 4.5z"></path></svg>)
}
function MaterialSymbolsExpandMoreRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 14.95q-.2 0-.375-.062t-.325-.213l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213T12 14.95"></path></svg>)
}
function MaterialSymbolsAlarm(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 22q-1.875 0-3.512-.712t-2.85-1.925t-1.925-2.85T3 13t.713-3.512t1.924-2.85t2.85-1.925T12 4t3.513.713t2.85 1.925t1.925 2.85T21 13t-.712 3.513t-1.925 2.85t-2.85 1.925T12 22m2.8-4.8l1.4-1.4l-3.2-3.2V8h-2v5.4zM5.6 2.35L7 3.75L2.75 8l-1.4-1.4zm12.8 0l4.25 4.25l-1.4 1.4L17 3.75z"></path></svg>)
}