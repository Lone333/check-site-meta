"use client"

import { logCheckButton } from "@/app/lib/analytics"
import type { UserSettings } from "@/app/lib/get-settings"
import { recentSuggestionsLocal } from "@/app/lib/localstorage"
import { getUrlFromQuery, parseUrlFromQuery } from "@/app/lib/parse-url"
import { useAppNavigation } from "@/app/lib/searchParams"
import { cn } from "lazy-cn"
import Form from "next/form"
import { useEffect, useRef, useState, type ComponentProps, type SVGProps } from "react"
import { InputSettings } from "./InputSettings"

export function InputForm(props: {
  query: Record<string, string | string[] | undefined>,
  settings: UserSettings
}) {
  const navigation = useAppNavigation()
  const existingSp = navigation.getAll().filter(([key]) => key !== 'url')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const query = Array.isArray(props.query.url) ? props.query.url[0] : props.query.url
    if (query) recentSuggestionsLocal.add(query)
  }, [props.query.url])

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const [settingsOpen, setSettingsOpen] = useState(false)

  const dialogRef = useRef<HTMLDialogElement>(null)

  return <Form
    id="lookup_url"
    onSubmit={() => logCheckButton()}
    onKeyDown={(event) => {
      // Allow submitting the form with Ctrl+Enter or Cmd+Enter
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) event.currentTarget.requestSubmit()
    }}
    action="/"
    autoComplete="off"
    style={{
      '--h': 'calc(var(--spacing) * 11)',
    }}
  >
    <div
      onClick={() => {
        if (inputRef.current) inputRef.current.focus()
      }}
      className="relative card flex flex-col box-content h-auto p-0 rounded-[calc(var(--h)/2)] input-box-shadow input-outline-hover transition-[outline,box-shadow,height] z-50 overflow-hidden"
    >
      <div className="h-(--h) flex items-center">
        <CiSearchMagnifyingGlass className="size-4 ml-4.5 mr-0 " />
        <input
          required id="lookup_url_input"
          name="url"
          ref={inputRef}
          className="grow border-none rounded-full focus:outline-0 pl-3 px-1 h-8 ml-1 text-[0.85rem] font-normal placeholder:text-foreground-muted-3/80 placeholder:font-normal placeholder:italic placeholder:whitespace-pre"
          defaultValue={props.query['url'] as string}
          placeholder="localhost:3000              ↪ Enter"
        />
        <div
          className="self-end shrink-0 h-11 closed:w-24 w-0 min-w-0 flex items-center justify-start transition-all overflow-hidden"
          data-closed={props.query.url ? "" : undefined}
        >
          <FormButton type="button" onClick={() => {
            
            window.open(parseUrlFromQuery(getUrlFromQuery(props.query['url'])!), "_blank");
          }}>
            <MaterialSymbolsOpenInNew className="w-4 h-4" />
          </FormButton>
          <FormButton type="submit">
            <MaterialSymbolsRefresh className="w-4 h-4" />
          </FormButton>
          <FormButton type="button"
            onClick={(e) => { navigation.navigate('url', undefined) }}>
            <MaterialSymbolsCloseRounded className="w-4 h-4" />
          </FormButton>
        </div>
        <div className="pr-1.5">
          <FormButton type="button" onClick={() => {
            dialogRef.current?.showModal()
            setSettingsOpen(!settingsOpen)
          }}>
            <MingcuteSettings4Line className="w-4 h-4" />
          </FormButton>
        </div>
      </div>

    </div>
    {existingSp.map(([key, value]) => <input key={key} readOnly type="hidden" name={key} value={String(value)} />)}

    <div className="grid grid-rows-[0fr] opened:grid-rows-[1fr] opacity-0 opened:opacity-100 transition-[grid-template-rows,opacity]  duration-300 overflow-hidden" data-opened={settingsOpen ? "" : undefined}>
      <div className="min-h-0">
        <InputSettings
          settings={props.settings}
          onSettingsClose={() => setSettingsOpen(false)}
        />
      </div>
    </div>
  </Form>
}


export function FormButton(props: ComponentProps<"button">) {
  return <button {...props} className={cn(
    `button p-2 rounded-full text-foreground-muted hover:bg-foreground-muted/8`,
    props.className
  )} />
}


function CiSearchMagnifyingGlass(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 15l6 6m-11-4a7 7 0 1 1 0-14a7 7 0 0 1 0 14"></path></svg>)
}

export function MaterialSymbolsCloseRounded(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"></path></svg>)
}
function MaterialSymbolsRefresh(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12t1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20"></path></svg>)
}

export function MingcuteSettings4Line(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{'<!-- Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE -->'}<g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M13.414 2.1a2 2 0 0 0-2.828 0L8.686 4H6a2 2 0 0 0-2 2v2.686l-1.9 1.9a2 2 0 0 0 0 2.828l1.9 1.9V18a2 2 0 0 0 2 2h2.686l1.9 1.9a2 2 0 0 0 2.828 0l1.9-1.9H18a2 2 0 0 0 2-2v-2.686l1.9-1.9a2 2 0 0 0 0-2.828l-1.9-1.9V6a2 2 0 0 0-2-2h-2.686zM12 3.516l1.9 1.9A2 2 0 0 0 15.313 6H18v2.686a2 2 0 0 0 .586 1.415l1.9 1.9l-1.9 1.899A2 2 0 0 0 18 15.314V18h-2.686a2 2 0 0 0-1.415.586l-1.9 1.9l-1.899-1.9A2 2 0 0 0 8.686 18H6v-2.686a2 2 0 0 0-.586-1.415L3.514 12l1.9-1.9A2 2 0 0 0 6 8.687V6h2.686a2 2 0 0 0 1.414-.586l1.9-1.9ZM10 12a2 2 0 1 1 4 0a2 2 0 0 1-4 0m2-4a4 4 0 1 0 0 8a4 4 0 0 0 0-8"></path></g></svg>)
}

export function MaterialSymbolsOpenInNew(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h14v-7h2v7q0 .825-.587 1.413T19 21zm4.7-5.3l-1.4-1.4L17.6 5H14V3h7v7h-2V6.4z"></path></svg>
  )
}
