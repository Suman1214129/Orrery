"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Simplified resizable components for production build
const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { direction?: "horizontal" | "vertical" }
>(({ className, direction = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    data-slot="resizable-panel-group"
    data-panel-group-direction={direction}
    className={cn(
      "flex h-full w-full",
      direction === "vertical" && "flex-col",
      className
    )}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="resizable-panel"
    className={cn("flex-1", className)}
    {...props}
  />
))
ResizablePanel.displayName = "ResizablePanel"

const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }
>(({ withHandle, className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="resizable-handle"
    className={cn(
      "bg-border relative flex w-px items-center justify-center",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
        <GripVerticalIcon className="size-2.5" />
      </div>
    )}
  </div>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
