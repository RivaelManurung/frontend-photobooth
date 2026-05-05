import * as React from 'react';
import { cn } from '../../lib/utils';

const TabsContext = React.createContext({ value: '', onChange: () => {} });

/**
 * Stateful Tabs component (Shadcn pattern)
 * Usage:
 *   <Tabs defaultValue="tab1">
 *     <TabsList>
 *       <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="tab1">Content</TabsContent>
 *   </Tabs>
 */
const Tabs = React.forwardRef(({ className, defaultValue, value: controlledValue, onValueChange, children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const value = controlledValue ?? internalValue;
  const onChange = onValueChange ?? setInternalValue;

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-1',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { value: activeValue, onChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      onClick={() => onChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('mt-2 ring-offset-background focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
