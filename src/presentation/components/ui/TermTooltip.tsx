'use client';

import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/presentation/components/ui/tooltip';
import { GLOSSARY, type TermKey } from '@/lib/glossary';
import { cn } from '@/lib/utils';

interface TermTooltipProps {
  term: TermKey;
  children?: ReactNode;
  className?: string;
  iconClassName?: string;
}

export function TermTooltip({ term, children, className, iconClassName }: TermTooltipProps) {
  const entry = GLOSSARY[term];
  const label = children ?? entry.short;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            'inline-flex items-center gap-1 cursor-help underline decoration-dotted underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
            className
          )}
          aria-label={`${entry.short}: ${entry.tooltip}`}
        >
          {label}
          <Info className={cn('h-3.5 w-3.5 text-muted-foreground', iconClassName)} aria-hidden />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
        {entry.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
