"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    } finally {
      setIsLoading(false);
    }
  };

  const bgImage =
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <Card variant="glass" className="relative z-10 w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-white text-center">
            Prisijungti
          </h1>
          <p className="text-gray-200 text-center mt-1">
            Sveiki sugrįžę! Įveskite savo duomenis.
          </p>
        </CardHeader>
        <CardContent className="text-white [&_label]:text-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-200 bg-red-900/40 border border-red-300/50 rounded-lg">
                {error}
              </div>
            )}

            <Input
              id="email"
              label="El. paštas"
              type="email"
              placeholder="jusu@pastas.lt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/30 text-white placeholder-gray-400"
            />

            <Input
              id="password"
              label="Slaptažodis"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/30 text-white placeholder-gray-400"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              variant="dark"
            >
              Prisijungti
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-200">
            Neturite paskyros?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-200 hover:text-white"
            >
              Registruokitės
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
