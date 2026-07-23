import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";
import ErrorTooltip from "./ErrorTooltip";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium mb-1.5 transition-colors duration-200",
              error
                ? "text-gray-700 group-focus-within:text-red-500"
                : "text-gray-700 group-focus-within:text-primary-500",
            )}
          >
            {label}
          </label>
        )}
        <ErrorTooltip error={error}>
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full px-4 py-2.5 text-sm border rounded-lg",
              "placeholder:text-gray-400",
              "focus:outline-none transition-colors duration-200",
              error
                ? "border-red-500 group-focus-within:ring-1 group-focus-within:ring-red-500 group-focus-within:border-red-500"
                : "border-gray-300 group-focus-within:ring-1 group-focus-within:ring-primary-500 group-focus-within:border-primary-500",
              className,
            )}
            {...props}
          />
        </ErrorTooltip>
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
