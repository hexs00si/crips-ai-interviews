import { cn } from "@/lib/utils";

export function Label({ htmlFor, children, className, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}