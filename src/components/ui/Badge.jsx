import { cn } from "../../lib/utils"

const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-[var(--neo-cyan)] text-black",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "bg-white text-black",
    success: "bg-[var(--neo-green)] text-black",
    warning: "bg-[var(--neo-yellow)] text-black",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center border-[2px] border-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export default Badge
