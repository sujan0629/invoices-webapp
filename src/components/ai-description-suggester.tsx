
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { suggestLineItemDescription } from '@/ai/flows/suggest-line-item-description';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AiDescriptionSuggesterProps {
  value: string;
  onChange: (value: string) => void;
  previousEntries: string[];
}

export default function AiDescriptionSuggester({
  value,
  onChange,
  previousEntries,
}: AiDescriptionSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [debouncedValue] = useDebounce(value, 500);

  const fetchSuggestions = useCallback(async (currentInput: string) => {
    if (currentInput.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await suggestLineItemDescription({
        currentInput: currentInput,
        previousEntries: previousEntries,
      });
      setSuggestions(result.suggestions || []);
      if(result.suggestions && result.suggestions.length > 0){
        setIsPopoverOpen(true);
      }
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
            placeholder="e.g. Website design and development"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
                if(suggestions.length > 0) setIsPopoverOpen(true);
            }}
            autoComplete="off"
            className="w-full"
          />
        </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1" side="bottom" align="start">
        {isLoading ? (
          <div className="p-2 text-sm text-muted-foreground">Loading suggestions...</div>
        ) : suggestions.length > 0 ? (
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full text-left p-2 text-sm rounded-sm hover:bg-accent"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && debouncedValue.length > 2 && <div className="p-2 text-sm text-muted-foreground">No suggestions found.</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
