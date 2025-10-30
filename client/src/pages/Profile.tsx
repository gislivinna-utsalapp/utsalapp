import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { LogIn, Heart, Store as StoreIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SalePostCard } from '@/components/SalePostCard';
import { useAuth } from '@/lib/auth';
import { getFavorites } from '@/lib/favorites';
import { is } from '@/i18n/is';
import type { SalePostWithDetails } from '@shared/schema';

export default function Profile() {
  const { authUser, isStore } = useAuth();
  const favorites = getFavorites();

  const { data: posts } = useQuery<SalePostWithDetails[]>({
    queryKey: ['/api/v1/posts', { activeOnly: false }],
  });

  const favoritePosts = posts?.filter(p => favorites.includes(p.id)) || [];

  if (!authUser) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold">{is.nav.profile}</h1>
        </header>

        <div className="p-4 space-y-4">
          <Card className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-muted p-4 rounded-full">
                <LogIn size={32} className="text-muted-foreground" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Skráðu þig inn</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Skráðu þig inn til að vista uppáhöld og fá aðgang að stjórnborði
              </p>
            </div>
            <Link href="/innskraning">
              <Button className="w-full" data-testid="button-login">
                {is.common.login}
              </Button>
            </Link>
          </Card>

          {favoritePosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart size={20} />
                <h2 className="text-lg font-semibold">Uppáhald ({favoritePosts.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoritePosts.map((post) => (
                  <SalePostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          <Card className="p-4">
            <Link href="/um">
              <div className="flex items-center gap-3 hover-elevate active-elevate-2 p-2 -m-2 rounded-lg">
                <Info size={20} />
                <span className="font-medium">{is.nav.about}</span>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold">{is.nav.profile}</h1>
        <p className="text-sm text-muted-foreground">{authUser.user.email}</p>
      </header>

      <div className="p-4 space-y-4">
        {isStore && (
          <Link href="/dashboard">
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                  <StoreIcon size={24} />
                </div>
                <div>
                  <h2 className="font-semibold">{is.nav.dashboard}</h2>
                  <p className="text-sm text-muted-foreground">
                    {authUser.store?.name}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {favoritePosts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} />
              <h2 className="text-lg font-semibold">Uppáhald ({favoritePosts.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoritePosts.map((post) => (
                <SalePostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        <Card className="p-4">
          <Link href="/um">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 p-2 -m-2 rounded-lg">
              <Info size={20} />
              <span className="font-medium">{is.nav.about}</span>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
}
