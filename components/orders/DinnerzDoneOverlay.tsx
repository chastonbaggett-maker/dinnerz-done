import { cn } from "@/lib/utils";

interface DinnerzDoneOverlayProps {
  className?: string;
}

export function DinnerzDoneOverlay({ className }: DinnerzDoneOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center rounded-xl",
        "bg-violet-950/90 backdrop-blur-[2px] dark:bg-violet-950/95",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <p className="px-4 text-center text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
        Dinnerz Done :)
      </p>
    </div>
  );
}
