'use client';

export function Spinner({ className = "" }) {
  return (
    <div className="flex items-center justify-center w-full min-h-[200px]">
      <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary ${className}`}></div>
    </div>
  );
}
