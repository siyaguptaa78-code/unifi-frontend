import React from "react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-stone-700 border-t-amber-500",
        sizeMap[size],
        className
      )}
    />
  );
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8">
      <Spinner size="lg" />
      <p className="mt-3 text-xs text-stone-400 tracking-wide">{message}</p>
    </div>
  );
}

