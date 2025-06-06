"use client"

import { useEffect, useState } from "react"
import { CollapsibleRow } from "../lib/Collapsible"
import { FormButton, MaterialSymbolsCloseRounded } from "./inputs/InputForm"

export function HostedLimitationAlert(props: {
  show: boolean | undefined
  searchId?: string
}) {
  const [ignored, setIgnored] = useState(false)
  const ignore = () => setIgnored(true)

  // Reset ignored state when searchId changes
  useEffect(() => {
    if (props.searchId) setIgnored(false)
  }, [props.searchId])

  return (
    <CollapsibleRow data-opened={
      !!props.show && !ignored
    }   className="-mb-8"
    
    >
      <div className="card frow-3 relative mb-8">
        <FormButton className="absolute p-1 top-2 right-2" type="button" onClick={ignore}>
          <MaterialSymbolsCloseRounded className="w-5 h-5" />
        </FormButton>

        <div className="shrink-0">
          ⚠️
        </div>
        <div>
          <div className="pb-1 text-foreground-muted">Warning</div>
          <div className="text-foreground-muted">
            This result may be blocked by the target website (e.g., via Cloudflare).
            Hosted version may not work for this site. Try running the version locally.
          </div>
        </div>
        
      </div>
    </CollapsibleRow>
  )
}