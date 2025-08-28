import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

const Select = ({ value, onValueChange, children, disabled }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn('relative', disabled && 'pointer-events-none opacity-50')}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error('SelectTrigger must be used within a Select component');
    }
    
    const { open, setOpen } = context;
    
    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-xl glass-effect backdrop-blur-md border border-white/20 bg-white/5 px-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children || <span className="text-muted-foreground">{placeholder}</span>}
        <ChevronDown className="h-4 w-4 text-white/70" />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('SelectValue must be used within a Select component');
  }
  
  const { value } = context;
  
  return (
    <span className={cn(!value && 'text-white/50')}>
      {value || placeholder}
    </span>
  );
};

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('SelectContent must be used within a Select component');
  }
  
  const { open, setOpen } = context;
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen, ref]);
  
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-full z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl glass-effect backdrop-blur-md border border-white/20 bg-black/40 text-white shadow-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value: itemValue, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error('SelectItem must be used within a Select component');
    }
    
    const { value, onValueChange, setOpen } = context;
    const isSelected = value === itemValue;
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-lg py-3 pl-4 pr-2 text-sm outline-none transition-all duration-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white',
          isSelected && 'bg-accent-blue/20 text-white font-medium',
          className
        )}
        onClick={() => {
          onValueChange(itemValue);
          setOpen(false);
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };