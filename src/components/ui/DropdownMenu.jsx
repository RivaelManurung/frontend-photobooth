import * as React from "react";
import { cn } from "../../lib/utils";
import { Check, ChevronRight, Circle } from "lucide-react";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(!open) });
        }
        if (child.type === DropdownMenuContent) {
          return open ? child : null;
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = React.forwardRef(({ children, className, onClick, ...props }, ref) => (
  <div ref={ref} className={cn("cursor-pointer", className)} onClick={onClick} {...props}>
    {children}
  </div>
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = ({ children, className, align = "right" }) => (
  <div
    className={cn(
      "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 scale-in-95",
      align === "right" ? "right-0" : "left-0",
      className
    )}
  >
    {children}
  </div>
);

export const DropdownMenuItem = ({ children, className, onClick }) => (
  <div
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

export const DropdownMenuCheckboxItem = ({ children, className, checked, onCheckedChange }) => (
  <div
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={() => onCheckedChange?.(!checked)}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
);

export const DropdownMenuSeparator = ({ className }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
);

export { DropdownMenu };
