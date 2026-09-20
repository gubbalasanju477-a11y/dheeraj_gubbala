import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({ checked, onCheckedChange, id, className, ...rest }: CheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
        checked ? "bg-accent border-accent" : "border-border-strong bg-white",
        className
      )}
      {...rest}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </button>
  );
}
