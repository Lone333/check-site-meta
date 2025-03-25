import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function CollapsibleRow(props: ComponentProps<"div"> & { 'data-opened': boolean }) {
  return (
    <div {...props} className={cn(
      "grid grid-rows-[0fr] opened:grid-rows-[1fr] overflow-hidden",
      "transition-[grid-template-rows] duration-500",
      props.className
    )}
      data-opened={props['data-opened'] ? "" : undefined}
    >
      <div className="min-h-0">
        {props.children}
      </div>
    </div>
  )
}