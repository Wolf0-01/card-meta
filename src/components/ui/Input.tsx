import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full
          rounded-lg
          border
          bg-surface
          px-4
          py-2.5
          text-sm
          text-foreground
          placeholder:text-foreground-muted
          outline-none
          transition-all
          duration-200
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          }
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;