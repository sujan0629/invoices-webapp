'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { suggestLineItemDescription } from '@/ai/flows/suggest-line-item-description';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AiDescriptionSuggesterProps {
  value: string;
  onChange: (...event: any[]) => void;
  previousEntries: string[];
  [key: string]: any;
}

const AiDescriptionSuggester = React.forwardRef<
  HTMLInputElement,
  AiDescriptionSuggesterProps
>(({ value, onChange, previousEntries, ...props }, ref) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [debouncedValue] = useDebounce(value, 500);

  const fetchSuggestions = useCallback(async (currentInput: string) => {
    if (currentInput.length < 3) {
      setSuggestions([]);
      setIsPopoverOpen(false);
      return;
    }
    setIsLoading(true);
    setIsPopoverOpen(true); 
    try {
      const result = await suggestLineItemDescription({
        currentInput: currentInput,
        previousEntries: previousEntries,
      });
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [previousEntries]);

  useEffect(() => {
    if (debouncedValue) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
      setIsPopoverOpen(false);
    }
  }, [debouncedValue, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setIsPopoverOpen(false);
  };
  
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Input
            ref={ref}
            placeholder="e.g. Website design and development"
            value={value}
            onChange={onChange}
            onFocus={() => {
                if(value.length >= 3) {
                   setIsPopoverOpen(true);
                }
            }}
            autoComplete="off"
            className="w-full"
            {...props}
          />
        </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-1" 
        side="bottom" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isLoading ? (
          <div className="p-2 text-sm text-muted-foreground">Loading suggestions...</div>
        ) : suggestions.length > 0 ? (
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full text-left p-2 text-sm rounded-sm hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(suggestion)
                  }}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          debouncedValue.length >= 3 && !isLoading && <div className="p-2 text-sm text-muted-foreground">No suggestions found.</div>
        )}
      </PopoverContent>
    </Popover>
  );
});

AiDescriptionSuggester.displayName = "AiDescriptionSuggester";

export default AiDescriptionSuggester;
