import { useLocation } from 'wouter';
import { Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { is } from '@/i18n/is';

const categories = [
  { value: 'fatnad', label: is.categories.fatnad, icon: '👕' },
  { value: 'husgogn', label: is.categories.husgogn, icon: '🛋️' },
  { value: 'raftaeki', label: is.categories.raftaeki, icon: '📱' },
  { value: 'matvorur', label: is.categories.matvorur, icon: '🍕' },
  { value: 'annad', label: is.categories.annad, icon: '📦' },
];

export default function CategoriesPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold">{is.nav.categories}</h1>
        <p className="text-sm text-muted-foreground">Veldu flokk til að sjá útsölur</p>
      </header>

      <main className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.value}
              className="p-6 hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => setLocation(`/?category=${cat.value}`)}
              data-testid={`card-category-${cat.value}`}
            >
              <div className="text-center space-y-3">
                <div className="text-4xl">{cat.icon}</div>
                <p className="font-semibold">{cat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
