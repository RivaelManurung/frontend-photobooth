import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative group">
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between border-[3px] border-black bg-white px-3 py-2 text-sm font-black uppercase tracking-tighter ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none neo-shadow-sm transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-black stroke-[3px] pointer-events-none group-focus-within:rotate-180 transition-transform" />
  </div>
))
Select.displayName = "Select"

export default Select
