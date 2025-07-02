'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { suggestLineItemDescription } from '@/ai/flows/suggest-line-item-description';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface AiDescriptionSuggesterProps {
  value: string;
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  previousEntries: string[];
  [key: string]: any;
}

const AiDescriptionSuggester = React.forwardRef<
  HTMLInputElement,
  AiDescriptionSuggesterProps
>(({ value, onChange, onBlur, previousEntries, ...props }, ref) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
  const [debouncedValue] = useDebounce(value, 500);

  const fetchSuggestions = useCallback(
    async (currentInput: string) => {
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
        const hasSuggestions = result.suggestions && result.suggestions.length > 0;
        setSuggestions(hasSuggestions ? result.suggestions : []);
        setSuggestionsVisible(hasSuggestions);
      } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [previousEntries]
  );

  useEffect(() => {
    if (debouncedValue) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
      setSuggestionsVisible(false);
    }
  }, [debouncedValue, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestionsVisible(false);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events on them to register
    setTimeout(() => {
      setSuggestionsVisible(false);
      onBlur();
    }, 150);
  };

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        placeholder="e.g. Website design and development"
        value={value}
        onChange={onChange}
        onBlur={handleInputBlur}
        onFocus={() => {
          if (suggestions.length > 0) {
            setSuggestionsVisible(true);
          }
        }}
        autoComplete="off"
        className="w-full"
        {...props}
      />
      {isSuggestionsVisible && (
        <Card className="absolute z-50 w-full mt-1 overflow-hidden p-1">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">
              Loading suggestions...
            </div>
          ) : (
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="w-full text-left p-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(suggestion);
                    }}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
});

AiDescriptionSuggester.displayName = 'AiDescriptionSuggester';

export default AiDescriptionSuggester;
