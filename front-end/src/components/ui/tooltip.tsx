"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = ({ children, ...props }: TooltipPrimitive.TooltipProviderProps) => (
  <TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={0} disableHoverableContent {...props}>
    {children}
  </TooltipPrimitive.Provider>
)

const Tooltip = ({ delayDuration = 0, ...props }: TooltipPrimitive.TooltipProps) => (
  <TooltipPrimitive.Root delayDuration={delayDuration} {...props} />
)

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-white/90 px-2.5 py-1 text-xs text-black shadow-md",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } 