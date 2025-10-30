import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { is } from '@/i18n/is';

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border">
        <div className="flex items-center gap-2 p-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-lg font-semibold">{is.about.title}</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{is.about.title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {is.about.description}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Hvernig virkar þetta?</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Fyrir notendur:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Skoða útsölur án innskráningar</li>
                <li>Leita og síá eftir flokki, verði og afslætti</li>
                <li>Vista uppáhald í tækinu þínu</li>
                <li>Sjá staðsetningu og opnunartíma</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">Fyrir verslanir:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Skrá verslunina þína ókeypis</li>
                <li>Búa til útsöluauglýsingar með myndum</li>
                <li>Setja verð áður og núna</li>
                <li>Sjá hversu margir skoða tilboðin þín</li>
                <li>Stjórna öllum útsölum í einu</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Tengiliðir</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Netfang:</span>{' '}
              <a href="mailto:info@utsalapp.is" className="text-primary hover:underline">
                info@utsalapp.is
              </a>
            </p>
          </div>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>&copy; 2025 Útsalapp. Allur réttur áskilinn.</p>
        </div>
      </main>
    </div>
  );
}
