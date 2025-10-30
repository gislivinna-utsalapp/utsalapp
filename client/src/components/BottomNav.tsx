import { Home, Search, Grid3x3, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { is } from '@/i18n/is';

const navItems = [
  { href: '/', icon: Home, label: is.nav.home, testId: 'nav-home' },
  { href: '/leit', icon: Search, label: is.nav.search, testId: 'nav-search' },
  { href: '/flokkar', icon: Grid3x3, label: is.nav.categories, testId: 'nav-categories' },
  { href: '/profill', icon: User, label: is.nav.profile, testId: 'nav-profile' },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[48px] min-h-[48px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={item.testId}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
