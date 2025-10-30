import { Link } from 'wouter';
import { Heart, MapPin, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SalePostWithDetails } from '@shared/schema';
import { formatPrice, calculateDiscount, getTimeRemaining } from '@/lib/utils';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/favorites';
import { useState } from 'react';

interface SalePostCardProps {
  post: SalePostWithDetails;
}

export function SalePostCard({ post }: SalePostCardProps) {
  const [favorite, setFavorite] = useState(isFavorite(post.id));
  const mainImage = post.images[0]?.url || '/placeholder.png';
  const discount = calculateDiscount(post.priceOriginal, post.priceSale);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFavorite(post.id);
      setFavorite(false);
    } else {
      addFavorite(post.id);
      setFavorite(true);
    }
  };

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group" data-testid={`card-post-${post.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={mainImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          <div className="absolute top-2 right-2 z-10">
            <Badge 
              variant="destructive" 
              className="text-lg font-bold px-3 py-1 shadow-lg"
              data-testid={`badge-discount-${post.id}`}
            >
              -{discount}%
            </Badge>
          </div>

          <Button
            size="icon"
            variant={favorite ? "default" : "secondary"}
            className="absolute top-2 left-2 z-10 shadow-lg"
            onClick={toggleFavorite}
            data-testid={`button-favorite-${post.id}`}
          >
            <Heart className={favorite ? "fill-current" : ""} size={18} />
          </Button>

          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarImage src={post.store.logoUrl || undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {post.store.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-white text-sm font-medium drop-shadow-md">
              {post.store.name}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2 text-card-foreground" data-testid={`text-title-${post.id}`}>
            {post.title}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(post.priceOriginal)}
            </span>
            <span className="text-xl font-bold text-primary" data-testid={`text-price-${post.id}`}>
              {formatPrice(post.priceSale)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {post.store.address && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="line-clamp-1">{post.store.address.split(',')[0]}</span>
                </div>
              )}
              {post.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{post.viewCount}</span>
                </div>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {getTimeRemaining(post.endsAt)}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
