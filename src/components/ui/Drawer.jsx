import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";
import Button from "./Button";

const DrawerContext = React.createContext({
  open: false,
  onClose: () => {},
  direction: "right"
});

export const Drawer = ({ 
  children, 
  isOpen, 
  onClose, 
  direction = "right" 
}) => {
  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <DrawerContext.Provider value={{ open: isOpen, onClose, direction }}>
      <div className="fixed inset-0 z-50 flex overflow-hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        />
        
        {/* Panel */}
        <div 
          className={cn(
            "relative ml-auto flex h-full w-full max-w-md flex-col bg-background shadow-2xl animate-in slide-in-from-right duration-300 ease-in-out",
            direction === "right" ? "ml-auto" : "mr-auto",
            "sm:w-[450px]"
          )}
        >
          {children}
        </div>
      </div>
    </DrawerContext.Provider>
  );
};

export const DrawerHeader = ({ className, children }) => (
  <div className={cn("flex flex-col gap-2 p-6 pb-4", className)}>
    {children}
  </div>
);

export const DrawerTitle = ({ className, children }) => (
  <h2 className={cn("text-lg font-semibold text-foreground", className)}>
    {children}
  </h2>
);

export const DrawerDescription = ({ className, children }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

export const DrawerContent = ({ className, children }) => (
  <div className={cn("flex-1 overflow-y-auto px-6 py-2", className)}>
    {children}
  </div>
);

export const DrawerFooter = ({ className, children }) => (
  <div className={cn("mt-auto border-t p-6", className)}>
    <div className="flex gap-2 justify-end">
      {children}
    </div>
  </div>
);

export const DrawerClose = ({ asChild, children }) => {
  const { onClose } = React.useContext(DrawerContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e);
        onClose();
      }
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
      <X className="h-4 w-4" />
    </Button>
  );
};

export default Drawer;
