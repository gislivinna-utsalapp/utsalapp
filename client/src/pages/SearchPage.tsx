import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel, type Filters } from '@/components/FilterPanel';
import { SalePostCard } from '@/components/SalePostCard';
import { is } from '@/i18n/is';
import type { SalePostWithDetails } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: null,
    minPrice: 0,
    maxPrice: 1000000,
    minDiscount: 0,
    activeOnly: true,
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
          <h1 className="text-2xl font-bold">{is.nav.search}</h1>
          
          <SearchBar
            value={search}
            onChange={setSearch}
            onFilterClick={() => setShowFilters(true)}
          />
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : !filteredPosts || filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{is.home.noResults}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredPosts.length} útsölur fundust
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <SalePostCard key={post.id} post={post} />
              ))}
            </div>
          </>
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
