import * as React from "react"
import { cn } from "@/lib/utils"
import { glassInputClassName } from "./styles"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          glassInputClassName,
          "flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-white/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
