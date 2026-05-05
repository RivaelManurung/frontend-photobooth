import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Reusable FormField component — label + input wrapper with error support
 */
export const FormField = ({ label, required, error, children, className }) => (
  <div className={cn('space-y-1.5', className)}>
    {label && (
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/**
 * Textarea component
 */
export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/**
 * Switch / Toggle component
 */
export const Switch = React.forwardRef(({ checked, onChange, label, className }, ref) => (
  <div className={cn('flex items-center gap-2', className)}>
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked ? 'bg-primary' : 'bg-input'
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
    {label && <span className="text-sm font-medium">{label}</span>}
  </div>
));
Switch.displayName = 'Switch';

/**
 * Spinner / Loading indicator
 */
export const Spinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizes[size],
        className
      )}
    />
  );
};

/**
 * Empty state component
 */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    )}
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/**
 * Stat card - mini card for showing metrics
 */
export const StatCard = ({ title, value, icon: Icon, iconColor = 'text-muted-foreground', trend, className }) => (
  <div className={cn('rounded-xl border bg-card p-6', className)}>
    <div className="flex items-center justify-between space-y-0 pb-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {Icon && <Icon className={cn('h-4 w-4', iconColor)} />}
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
  </div>
);

/**
 * Page header component
 */
export const PageHeader = ({ title, description, action, className }) => (
  <div className={cn('flex items-center justify-between', className)}>
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/**
 * Pagination component
 */
export const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;
  return (
    <div className={cn('flex items-center justify-between px-4 py-3', className)}>
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/**
 * Search bar component
 */
import { Search } from 'lucide-react';
export const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search...', className }) => (
  <div className={cn('relative', className)}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
  </div>
);

export { default as Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose } from './Drawer';
export { default as Separator } from './Separator';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
