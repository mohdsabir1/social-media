'use client';

import { Wave } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Wave className="h-6 w-6 text-blue-600" />
      <span className="font-bold text-xl tracking-tight">
        Net<span className="text-blue-600">Wave</span>
      </span>
    </div>
  );
}
