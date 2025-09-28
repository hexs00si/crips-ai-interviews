import React from "react";
import { cn } from "@/lib/utils";

export function GridBackground({ children, className }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white bg-grid-black/[0.05] relative flex items-center justify-center",
        className
      )}
    >
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  );
}

export function DotBackground({ children, className }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white bg-dot-black/[0.2] relative flex items-center justify-center",
        className
      )}
    >
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  );
}