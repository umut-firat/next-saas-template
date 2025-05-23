"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FacetedValue<Multiple extends boolean> = Multiple extends true
  ? string[]
  : string;

interface FacetedContextValue<Multiple extends boolean = boolean> {
  value?: FacetedValue<Multiple>;
  onItemSelect?: (value: string) => void;
  multiple?: Multiple;
}

interface FacetedProps<Multiple extends boolean = false>
  extends React.ComponentProps<typeof Popover> {
  value?: FacetedValue<Multiple>;
  onValueChange?: (value: FacetedValue<Multiple> | undefined) => void;
  children?: React.ReactNode;
  multiple?: Multiple;
}

interface FacetedBadgeListProps extends React.ComponentProps<"div"> {
  options?: { label: string; value: string }[];
  max?: number;
  badgeClassName?: string;
  placeholder?: string;
}

const FacetedContext = createContext<FacetedContextValue<boolean> | null>(null);

function useFacetedContext(name: string) {
  const context = useContext(FacetedContext);

  if (!context) {
    throw new Error(`\`${name}\` must be within Faceted`);
  }

  return context;
}

export function Faceted<Multiple extends boolean = false>(
  props: FacetedProps<Multiple>,
) {
  const {
    open: openProp,
    onOpenChange: onOpenChangeProp,
    value,
    onValueChange,
    children,
    multiple = false,
    ...facetedProps
  } = props;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const onOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChangeProp?.(newOpen);
    },
    [isControlled, onOpenChangeProp],
  );

  const onItemSelect = useCallback(
    (selectedValue: string) => {
      if (!onValueChange) return;

      if (multiple) {
        const currentValue = (Array.isArray(value) ? value : []) as string[];
        const newValue = currentValue.includes(selectedValue)
          ? currentValue.filter((v) => v !== selectedValue)
          : [...currentValue, selectedValue];
        onValueChange(newValue as FacetedValue<Multiple>);
      } else {
        if (value === selectedValue) {
          onValueChange(undefined);
        } else {
          onValueChange(selectedValue as FacetedValue<Multiple>);
        }

        requestAnimationFrame(() => onOpenChange(false));
      }
    },
    [multiple, value, onValueChange, onOpenChange],
  );

  const contextValue = useMemo<FacetedContextValue<typeof multiple>>(
    () => ({ value, onItemSelect, multiple }),
    [value, onItemSelect, multiple],
  );

  return (
    <FacetedContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={onOpenChange} {...facetedProps}>
        {children}
      </Popover>
    </FacetedContext.Provider>
  );
}

export function FacetedTrigger(
  props: React.ComponentProps<typeof PopoverTrigger>,
) {
  const { className, children, ...triggerProps } = props;

  return (
    <PopoverTrigger
      {...triggerProps}
      className={cn("justify-between text-left", className)}
    >
      {children}
    </PopoverTrigger>
  );
}

export function FacetedBadgeList(props: FacetedBadgeListProps) {
  const {
    options = [],
    max = 2,
    placeholder = "Select options...",
    className,
    badgeClassName,
    ...badgeListProps
  } = props;

  const context = useFacetedContext("FacetedBadgeList");
  const values = Array.isArray(context.value)
    ? context.value
    : ([context.value].filter(Boolean) as string[]);

  const getLabel = useCallback(
    (value: string) => {
      const option = options.find((opt) => opt.value === value);
      return option?.label ?? value;
    },
    [options],
  );

  if (!values || values.length === 0) {
    return (
      <div
        {...badgeListProps}
        className="flex w-full items-center gap-1 text-muted-foreground"
      >
        {placeholder}
        <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
      </div>
    );
  }

  return (
    <div
      {...badgeListProps}
      className={cn("flex flex-wrap items-center gap-1", className)}
    >
      {values.length > max ? (
        <Badge
          variant="secondary"
          className={cn("rounded-sm px-1 font-normal", badgeClassName)}
        >
          {values.length} selected
        </Badge>
      ) : (
        values.map((value) => (
          <Badge
            key={value}
            variant="secondary"
            className={cn("rounded-sm px-1 font-normal", badgeClassName)}
          >
            <span className="truncate">{getLabel(value)}</span>
          </Badge>
        ))
      )}
    </div>
  );
}

export function FacetedContent(
  props: React.ComponentProps<typeof PopoverContent>,
) {
  const { className, children, ...contentProps } = props;

  return (
    <PopoverContent
      {...contentProps}
      align="start"
      className={cn(
        "w-[200px] origin-(--radix-popover-content-transform-origin) p-0",
        className,
      )}
    >
      <Command>{children}</Command>
    </PopoverContent>
  );
}

export const FacetedInput = CommandInput;

export const FacetedList = CommandList;

export const FacetedEmpty = CommandEmpty;

export const FacetedGroup = CommandGroup;

interface FacetedItemProps extends React.ComponentProps<typeof CommandItem> {
  value: string;
}

export function FacetedItem(props: FacetedItemProps) {
  const { value, onSelect, className, children, ...itemProps } = props;
  const context = useFacetedContext("FacetedItem");

  const isSelected = context.multiple
    ? Array.isArray(context.value) && context.value.includes(value)
    : context.value === value;

  const onItemSelect = useCallback(
    (currentValue: string) => {
      if (onSelect) {
        onSelect(currentValue);
      } else if (context.onItemSelect) {
        context.onItemSelect(currentValue);
      }
    },
    [onSelect, context.onItemSelect],
  );

  return (
    <CommandItem
      aria-selected={isSelected}
      data-selected={isSelected}
      className={cn("gap-2", className)}
      onSelect={() => onItemSelect(value)}
      {...itemProps}
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-sm border border-primary",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible",
        )}
      >
        <Check className="size-4" />
      </span>
      {children}
    </CommandItem>
  );
}

export const FacetedSeparator = CommandSeparator;
