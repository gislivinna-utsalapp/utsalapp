import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Plus, LogOut, Settings, Eye, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { is } from '@/i18n/is';
import type { SalePostWithDetails } from '@shared/schema';
import { formatPrice, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { authUser, logout, isStore } = useAuth();
  const [, setLocation] = useLocation();

  const { data: posts, isLoading } = useQuery<SalePostWithDetails[]>({
    queryKey: authUser?.store?.id ? [`/api/v1/stores/${authUser.store.id}/posts`] : [],
    enabled: !!authUser?.store?.id,
  });

  if (!isStore) {
    setLocation('/innskraning');
    return null;
  }

  const activePosts = posts?.filter(p => p.isActive) || [];
  const totalViews = posts?.reduce((sum, p) => sum + (p.viewCount || 0), 0) || 0;

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" data-testid="text-title">{is.dashboard.title}</h1>
            <p className="text-sm text-muted-foreground">
              {is.dashboard.welcome}, {authUser?.store?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation('/stillingar')}
              data-testid="button-settings"
            >
              <Settings size={20} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Package size={18} />
              <span className="text-sm">{is.dashboard.stats.totalPosts}</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-posts">
              {posts?.length || 0}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp size={18} />
              <span className="text-sm">{is.dashboard.stats.activePosts}</span>
            </div>
            <p className="text-2xl font-bold text-primary" data-testid="text-active-posts">
              {activePosts.length}
            </p>
          </Card>

          <Card className="p-4 col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye size={18} />
              <span className="text-sm">{is.dashboard.stats.totalViews}</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-views">
              {totalViews}
            </p>
          </Card>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => setLocation('/stofna')}
          data-testid="button-create-post"
        >
          <Plus size={20} className="mr-2" />
          {is.dashboard.createPost}
        </Button>

        <div>
          <h2 className="text-lg font-semibold mb-3">{is.dashboard.myPosts}</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !posts || posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-2" data-testid="text-no-posts">
                {is.dashboard.noPosts}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {is.dashboard.createFirst}
              </p>
              <Button onClick={() => setLocation('/stofna')} data-testid="button-create-first">
                <Plus size={18} className="mr-2" />
                {is.dashboard.createPost}
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => setLocation(`/breyta/${post.id}`)}
                  data-testid={`card-post-${post.id}`}
                >
                  <div className="flex gap-3">
                    {post.images[0] && (
                      <img
                        src={post.images[0].url}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                        <Badge
                          variant={post.isActive ? "default" : "secondary"}
                          className="flex-shrink-0"
                        >
                          {post.isActive ? 'Virkt' : 'Óvirkt'}
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(post.priceOriginal)}
                        </span>
                        <span className="font-bold text-primary">
                          {formatPrice(post.priceSale)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          -{post.discountPercent}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Gildir til: {formatDate(post.endsAt)}</span>
                        {post.viewCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{post.viewCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
