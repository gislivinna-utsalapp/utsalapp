import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { is } from '@/i18n/is';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onFilterClick, placeholder }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || is.home.searchPlaceholder}
          className="pl-10 rounded-full h-12 bg-card border-card-border"
          data-testid="input-search"
        />
      </div>
      {onFilterClick && (
        <Button
          size="icon"
          variant="secondary"
          onClick={onFilterClick}
          className="rounded-full h-12 w-12 flex-shrink-0"
          data-testid="button-filter"
        >
          <SlidersHorizontal size={20} />
        </Button>
      )}
    </div>
  );
}
