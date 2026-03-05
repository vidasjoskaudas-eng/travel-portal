"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Slaptažodžiai nesutampa");
      return;
    }

    if (password.length < 6) {
      setError("Slaptažodis turi būti bent 6 simbolių");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Įvyko klaida");
        return;
      }

      // Redirect to login after successful registration
      router.push("/login?registered=true");
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    } finally {
      setIsLoading(false);
    }
  };

  const bgImage =
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <Card variant="glass" className="relative z-10 w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-white text-center">
            Sukurti paskyrą
          </h1>
          <p className="text-gray-200 text-center mt-1">
            Prisijunkite prie kelionių portalo
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
              id="name"
              label="Vardas"
              type="text"
              placeholder="Jonas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/10 border-white/30 text-white placeholder-gray-400"
            />

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

            <Input
              id="confirmPassword"
              label="Pakartokite slaptažodį"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Registruotis
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-200">
            Jau turite paskyrą?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-200 hover:text-white"
            >
              Prisijunkite
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
