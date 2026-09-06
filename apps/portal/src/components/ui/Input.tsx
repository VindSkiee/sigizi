import { cn } from "@/lib/utils";
import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import ErrorTooltip from "./ErrorTooltip";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, suffix, ...props }, ref) => {
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
          <div className="relative">
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
                suffix && "pr-10",
                className,
              )}
              {...props}
            />
            {suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {suffix}
              </span>
            )}
          </div>
        </ErrorTooltip>
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
