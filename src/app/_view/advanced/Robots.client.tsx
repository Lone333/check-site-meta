"use client"

import type { ParsedRobotRules } from "@/app/lib/get-robots";
import { cn } from "lazy-cn";
import { useState, type SVGProps } from "react";
import { FormButton } from "../inputs/InputForm";

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

  

  const [expandedList, setExpandedList] = useState([...Array.from(rules, () => true)])
  const isExpanded = (index: number) => expandedList[index]
  const toggaleExpanse = (index: number) => {
    setExpandedList((prev) => {
      const copy = [...prev]
      copy[index] = !copy[index]
      return copy
    })
  }
  const expandAll = () => {
    setExpandedList([...Array.from(rules, () => true)])
  }
  const collapseAll = () => {
    setExpandedList([...Array.from(rules, () => false)])
  }





  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 grow items-center max-w-2xl">
        <div className="grow card p-0 flex h-9 rounded-full bg-foreground-body/5 overflow-hidden px-4">
          <input
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search rules"
            className="grow focus:outline-none font-normal" />
        </div>
        <div>
          <FormButton
            onClick={collapseAll}
          >
            <MdiArrowCollapseAll className="w-4 h-4" />
          </FormButton>
          <FormButton
            onClick={expandAll}
          >
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
                <button className="flex items-baseline gap-2 p-2 pl-3 grow"
                  onClick={() => toggaleExpanse(i)}
                >
                  <MaterialSymbolsExpandMoreRounded className={cn("w-4 h-4 transition-all",
                    expanded ? "self-start rotate-180" : "self-end rotate-0"
                  )} />
                  <span className="font-semibold">{rule.userAgent}</span>
                  <div className="text-xs flex gap-2">
                    {rule.userAgent === "*" && (
                      <span className="text-foreground-muted-2">(All)</span>
                    )}
                    <span className="text-foreground-muted-2">({rule.rule.length} rules)</span>
                  </div>
                </button>
              </div>
              <div className={cn(
                "grid grid-rows-[0fr] opened:grid-rows-[1fr] transition-[grid-template-rows]",
                "duration-300 overflow-hidden",
              )}
                data-opened={expanded ? "" : undefined}
              >
                <div className="min-h-0">
                  <div className="text-xs p-2 pl-4">
                    {rule.rule.map((r, j) => {
                      return (
                        <div key={j} className="py-0.5">
                          <span className={cn(
                            "py-0.5 px-1 border border-border text-[0.6rem] rounded-full bg-background-muted-2 uppercase",
                            r.allow ? "text-green-600 bg-green-100" : "text-orange-500 bg-orange-500/20 border-orange-500/40"
                          )}>
                            {r.allow ? "Allow" : "Disallow"}
                          </span> {r.pattern}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </pre>
    </div>
  )
}




function MdiArrowCollapseAll(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="m19.5 3.09l1.41 1.41l-4.5 4.5H20v2h-7V4h2v3.59zm1.41 16.41l-1.41 1.41l-4.5-4.5V20h-2v-7h7v2h-3.59zM4.5 3.09L9 7.59V4h2v7H4V9h3.59l-4.5-4.5zM3.09 19.5l4.5-4.5H4v-2h7v7H9v-3.59l-4.5 4.5z"></path></svg>
  )
}

function MdiArrowExpandAll(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="m9.5 13.09l1.41 1.41l-4.5 4.5H10v2H3v-7h2v3.59zm1.41-3.59L9.5 10.91L5 6.41V10H3V3h7v2H6.41zm3.59 3.59l4.5 4.5V14h2v7h-7v-2h3.59l-4.5-4.5zM13.09 9.5l4.5-4.5H14V3h7v7h-2V6.41l-4.5 4.5z"></path></svg>
  )
}


export function MaterialSymbolsExpandMoreRounded(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 14.95q-.2 0-.375-.062t-.325-.213l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213T12 14.95"></path></svg>
  )
}