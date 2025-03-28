import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function CollapsibleRow(props: ComponentProps<"div"> & { 'data-opened': boolean }) {
  return (
    <div {...props} className={cn(
      "grid grid-rows-[0fr] opened:grid-rows-[1fr] overflow-clip",
      "transition-[grid-template-rows] duration-500",
      props.className
    )}
      data-opened={props['data-opened'] ? "" : undefined}
    >
      <div className="min-h-0 min-w-0">
        {props.children}
      </div>
    </div>
  )
}
export function CollapsibleColumn(props: ComponentProps<"div"> & { 'data-opened': boolean }) {
  return (
    <div {...props} className={cn(
      "grid grid-columns-[0fr] opened:grid-columns-[1fr] overflow-clip",
      "transition-[grid-template-columns,opacity] duration-500",
      props.className
    )}
      data-opened={props['data-opened'] ? "" : undefined}
    >
      <div className="min-w-0 min-h-0">
        {props.children}
      </div>
    </div>
  )
}