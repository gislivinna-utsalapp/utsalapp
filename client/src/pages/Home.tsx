import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel, type Filters } from '@/components/FilterPanel';
import { SalePostCard } from '@/components/SalePostCard';
import { Badge } from '@/components/ui/badge';
import { is } from '@/i18n/is';
import type { SalePostWithDetails } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { value: 'all', label: is.categories.all },
  { value: 'fatnad', label: is.categories.fatnad },
  { value: 'husgogn', label: is.categories.husgogn },
  { value: 'raftaeki', label: is.categories.raftaeki },
  { value: 'matvorur', label: is.categories.matvorur },
  { value: 'annad', label: is.categories.annad },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: null,
    minPrice: 0,
    maxPrice: 1000000,
    minDiscount: 0,
    activeOnly: false,
    sortBy: 'recent',
  });

  const { data: posts, isLoading } = useQuery<SalePostWithDetails[]>({
    queryKey: ['/api/v1/posts', { 
      q: search, 
      category: filters.category,
      activeOnly: filters.activeOnly,
      sort: filters.sortBy,
    }],
  });

  const filteredPosts = posts?.filter(post => {
    if (filters.minPrice > 0 && post.priceSale < filters.minPrice) return false;
    if (filters.maxPrice < 1000000 && post.priceSale > filters.maxPrice) return false;
    if (filters.minDiscount > 0 && post.discountPercent < filters.minDiscount) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-title">
              {is.home.title}
            </h1>
            <p className="text-sm text-muted-foreground">{is.home.subtitle}</p>
          </div>
          
          <SearchBar
            value={search}
            onChange={setSearch}
            onFilterClick={() => setShowFilters(true)}
          />

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Badge
                key={cat.value}
                variant={
                  (cat.value === 'all' && !filters.category) || filters.category === cat.value
                    ? "default"
                    : "secondary"
                }
                className="cursor-pointer hover-elevate active-elevate-2 whitespace-nowrap px-4 py-2"
                onClick={() => setFilters(f => ({ ...f, category: cat.value === 'all' ? null : cat.value }))}
                data-testid={`badge-category-${cat.value}`}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !filteredPosts || filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-results">
              {is.home.noResults}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <SalePostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
