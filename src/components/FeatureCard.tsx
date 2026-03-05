"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface FeatureCardProps {
  isLoggedIn: boolean;
  href: string;
  infoHref: string;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
}

export function FeatureCard({
  isLoggedIn,
  href,
  infoHref,
  icon,
  title,
  description,
  actionLabel,
}: FeatureCardProps) {
  const router = useRouter();
  const clickHref = isLoggedIn ? href : infoHref;

  return (
    <div
      className="feature-card text-center p-6 bg-black/30 backdrop-blur-md border border-white/20 cursor-pointer"
      onClick={() => router.push(clickHref)}
    >
      <div className="w-14 h-14 bg-white/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-white mb-2 text-lg">{title}</h3>
      <p className="text-gray-300 text-sm mb-3">{description}</p>
      <span className="text-white/80 text-xs underline">
        {isLoggedIn ? `${actionLabel} →` : "Sužinok daugiau →"}
      </span>
      {isLoggedIn && (
        <p className="mt-2">
          <Link
            href={infoHref}
            className="text-white/60 text-xs hover:text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
            Daugiau
          </Link>
        </p>
      )}
    </div>
  );
}
