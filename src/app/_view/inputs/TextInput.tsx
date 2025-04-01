import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function TextInputCard(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "flex rounded-full bg-background-input min-w-0",
      "transition-[outline]",
      "outline-0 outline-transparent hover:outline-2 hover:outline-focus",
      "px-4",
      "[&_input]:outline-0",
      "border border-border",
      props.className
    )} />
  )
}

export function TextInputIconStart(props: ComponentProps<"div">) {
  return (<div {...props} className={cn(
    "flex items-center justify-center",
    "text-foreground-muted",
    // "outline",
    "pr-1",
    props.className
  )} />)
}