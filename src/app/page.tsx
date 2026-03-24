import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/FeatureCard";

export default async function Home() {
  const session = await getServerSession(authOptions).catch((error) => {
    console.error("Home session error:", error);
    return null;
  });
  const isLoggedIn = !!session?.user;
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background Image - Vietnam Ha Long Bay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Planuok keliones su draugais
            <span className="text-gray-300 italic"> lengvai</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl mx-auto drop-shadow-md">
            Privatus portalas, kuriame galite kartu planuoti keliones, dalintis
            idėjomis ir kurti neišdildomus prisiminimus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="outline" size="lg" pulse>
                Pradėti nemokamai
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" pulse>
                Jau turiu paskyrą
              </Button>
            </Link>
          </div>
        </div>

        {/* Kortelės: prisijungus → href, neprisijungus → infoHref (feature puslapiai) */}
        {/* 1) Planuok keliones → /trips/new (veiksmas) arba /planuok (forma + kelionių sąrašas) */}
        {/* 2) Bendradarbiaukite → /trips arba /bendradarbiaukite (idėjų lenta) */}
        {/* 3) Tvarkykite detales → /trips arba /detales (biudžetas, valiuta, dalyviai, užrašai) */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
          <FeatureCard
            isLoggedIn={isLoggedIn}
            href="/trips/new"
            infoHref="/info/planuok"
            icon="🗓️"
            title="Planuok keliones"
            description="Sukurk kelionę, nustatyk datas ir pakviesk draugus prisijungti."
            actionLabel="Sukurti kelionę"
          />
          <FeatureCard
            isLoggedIn={isLoggedIn}
            href="/bendradarbiaukite"
            infoHref="/info/bendradarbiaukite"
            icon="👥"
            title="Bendradarbiaukite"
            description="Visi dalyviai gali siūlyti veiklas ir balsuoti už mėgstamiausias."
            actionLabel="Idėjų lenta"
          />
          <FeatureCard
            isLoggedIn={isLoggedIn}
            href="/detales"
            infoHref="/info/detales"
            icon="📍"
            title="Tvarkykite detales"
            description="Vietos, laikas, išlaidos – viskas vienoje vietoje."
            actionLabel="Detalės"
          />
        </div>
      </div>
    </div>
  );
}
