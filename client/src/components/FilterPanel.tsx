import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { is, categoryLabels } from '@/i18n/is';
import { cn } from '@/lib/utils';

export interface Filters {
  category: string | null;
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  activeOnly: boolean;
  sortBy: 'recent' | 'discount';
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

const categories = [
  { value: 'fatnad', label: is.categories.fatnad },
  { value: 'husgogn', label: is.categories.husgogn },
  { value: 'raftaeki', label: is.categories.raftaeki },
  { value: 'matvorur', label: is.categories.matvorur },
  { value: 'annad', label: is.categories.annad },
];

export function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const reset = () => {
    onFiltersChange({
      category: null,
      minPrice: 0,
      maxPrice: 1000000,
      minDiscount: 0,
      activeOnly: false,
      sortBy: 'recent',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" data-testid="panel-filter">
      <div className="fixed inset-x-0 bottom-0 bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="sticky top-0 bg-card border-b border-card-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{is.filters.title}</h2>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-filter">
            <X size={24} />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">{is.nav.categories}</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filters.category === null ? "default" : "secondary"}
                className="cursor-pointer hover-elevate active-elevate-2 px-4 py-2"
                onClick={() => updateFilter('category', null)}
                data-testid="badge-category-all"
              >
                {is.categories.all}
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={filters.category === cat.value ? "default" : "secondary"}
                  className="cursor-pointer hover-elevate active-elevate-2 px-4 py-2"
                  onClick={() => updateFilter('category', cat.value)}
                  data-testid={`badge-category-${cat.value}`}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{is.filters.priceRange}</Label>
            <div className="px-2">
              <Slider
                min={0}
                max={1000000}
                step={10000}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) => {
                  updateFilter('minPrice', min);
                  updateFilter('maxPrice', max);
                }}
                data-testid="slider-price"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{filters.minPrice.toLocaleString('is-IS')} kr</span>
                <span>{filters.maxPrice.toLocaleString('is-IS')} kr</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{is.filters.discount} (%)</Label>
            <div className="px-2">
              <Slider
                min={0}
                max={100}
                step={5}
                value={[filters.minDiscount]}
                onValueChange={([value]) => updateFilter('minDiscount', value)}
                data-testid="slider-discount"
              />
              <div className="mt-2 text-sm text-muted-foreground">
                Að minnsta kosti {filters.minDiscount}% afsláttur
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="active-only" className="text-sm font-medium">
              {is.filters.activeToday}
            </Label>
            <Switch
              id="active-only"
              checked={filters.activeOnly}
              onCheckedChange={(checked) => updateFilter('activeOnly', checked)}
              data-testid="switch-active-only"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{is.filters.sortBy}</Label>
            <div className="flex gap-2">
              <Badge
                variant={filters.sortBy === 'recent' ? "default" : "secondary"}
                className="cursor-pointer hover-elevate active-elevate-2 px-4 py-2 flex-1 justify-center"
                onClick={() => updateFilter('sortBy', 'recent')}
                data-testid="badge-sort-recent"
              >
                {is.filters.sortRecent}
              </Badge>
              <Badge
                variant={filters.sortBy === 'discount' ? "default" : "secondary"}
                className="cursor-pointer hover-elevate active-elevate-2 px-4 py-2 flex-1 justify-center"
                onClick={() => updateFilter('sortBy', 'discount')}
                data-testid="badge-sort-discount"
              >
                {is.filters.sortDiscount}
              </Badge>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-card-border p-4 flex gap-2">
          <Button variant="outline" onClick={reset} className="flex-1" data-testid="button-reset-filter">
            {is.filters.reset}
          </Button>
          <Button onClick={onClose} className="flex-1" data-testid="button-apply-filter">
            {is.filters.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}
