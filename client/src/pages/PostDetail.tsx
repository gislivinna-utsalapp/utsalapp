import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, Heart, ExternalLink, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { SalePostWithDetails } from '@shared/schema';
import { formatPrice, formatDate, getTimeRemaining } from '@/lib/utils';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/favorites';
import { useState, useEffect } from 'react';
import { is } from '@/i18n/is';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function PostDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [favorite, setFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  const { data: post, isLoading } = useQuery<SalePostWithDetails>({
    queryKey: [`/api/v1/posts/${id}`],
    enabled: !!id,
  });

  const viewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/v1/posts/${id}/view`, {});
    },
  });

  useEffect(() => {
    if (id) {
      setFavorite(isFavorite(id));
      viewMutation.mutate();
    }
  }, [id]);

  const toggleFavorite = () => {
    if (!id) return;
    if (favorite) {
      removeFavorite(id);
      setFavorite(false);
    } else {
      addFavorite(id);
      setFavorite(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: `${post?.title} - ${formatPrice(post?.priceSale || 0)}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Hlekkur afritaður',
        description: 'Hlekkurinn hefur verið afritaður í klemmuspjald',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{is.home.noResults}</p>
          <Button onClick={() => setLocation('/')} data-testid="button-go-home">
            {is.errors.goHome}
          </Button>
        </div>
      </div>
    );
  }

  const savings = post.priceOriginal - post.priceSale;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2 p-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-lg font-semibold flex-1 truncate">{post.title}</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleShare}
            data-testid="button-share"
          >
            <Share2 size={20} />
          </Button>
        </div>
      </div>

      <div className="relative aspect-[16/9] bg-muted">
        {post.images.length > 0 ? (
          <>
            <img
              src={post.images[currentImageIndex]?.url}
              alt={post.images[currentImageIndex]?.alt || post.title}
              className="w-full h-full object-cover"
              data-testid="img-post"
            />
            {post.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50'
                    }`}
                    data-testid={`button-image-${index}`}
                  />
                ))}
              </div>
            )}
            {post.images.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1}/{post.images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Engin mynd</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        <Link href={`/store/${post.store.id}`}>
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 p-2 -m-2 rounded-lg">
            <Avatar className="h-12 w-12 border-2 border-card-border">
              <AvatarImage src={post.store.logoUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.store.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold" data-testid="text-store-name">{post.store.name}</p>
              {post.store.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} />
                  {post.store.address}
                </p>
              )}
            </div>
          </div>
        </Link>

        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="text-2xl font-bold flex-1" data-testid="text-title">{post.title}</h2>
            <Badge variant="destructive" className="text-xl font-bold px-3 py-1">
              -{post.discountPercent}%
            </Badge>
          </div>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(post.priceOriginal)}
            </span>
            <span className="text-3xl font-bold text-primary" data-testid="text-price">
              {formatPrice(post.priceSale)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {is.post.youSave} {formatPrice(savings)}
          </p>
        </Card>

        <div className="flex gap-2">
          <Button
            variant={favorite ? "default" : "outline"}
            onClick={toggleFavorite}
            className="flex-1"
            data-testid="button-favorite"
          >
            <Heart className={favorite ? "fill-current mr-2" : "mr-2"} size={20} />
            {favorite ? is.post.removeFromFavorites : is.post.addToFavorites}
          </Button>
        </div>

        {post.description && (
          <div>
            <h3 className="font-semibold mb-2">{is.post.description}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
              {post.description}
            </p>
          </div>
        )}

        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={18} className="text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">{is.post.validFrom}</p>
              <p className="font-medium">{formatDate(post.startsAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={18} className="text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">{is.post.validUntil}</p>
              <p className="font-medium">{formatDate(post.endsAt)}</p>
            </div>
          </div>
          <Badge variant="secondary">{getTimeRemaining(post.endsAt)}</Badge>
        </Card>

        {post.store.address && (
          <Card className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <MapPin size={20} className="text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="font-medium mb-1">{is.post.location}</p>
                <p className="text-sm text-muted-foreground">{post.store.address}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              asChild
              data-testid="button-show-map"
            >
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.store.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={18} className="mr-2" />
                {is.post.showOnMap}
              </a>
            </Button>
          </Card>
        )}

        {post.viewCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye size={16} />
            <span>{post.viewCount} {is.post.viewsCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
