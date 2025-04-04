import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

interface HelpTooltipProps {
  content: React.ReactNode;
  className?: string;
}

export function HelpTooltip({ content, className = '' }: HelpTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`text-muted-foreground hover:text-foreground transition-colors ${className}`}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm text-sm">
        {content}
      </PopoverContent>
    </Popover>
  );
} 