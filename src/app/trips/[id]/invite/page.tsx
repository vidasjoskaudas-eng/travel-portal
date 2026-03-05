"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Įvyko klaida");
        return;
      }

      setSuccess(`Kvietimas išsiųstas: ${email}`);
      setEmail("");
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
          href={`/trips/${tripId}`}
          className="text-sm text-gray-200 hover:text-white mb-4 inline-block"
        >
          ← Grįžti į kelionę
        </Link>

        <Card variant="glass">
          <CardHeader>
            <h1 className="text-2xl font-bold text-white">
              Pakviesti dalyvį
            </h1>
            <p className="text-gray-200 mt-1">
              Įveskite draugo el. pašto adresą
            </p>
          </CardHeader>
          <CardContent className="text-white [&_label]:text-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-200 bg-red-900/40 border border-red-300/50 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-200 bg-green-900/40 border border-green-300/50 rounded-lg">
                  {success}
                </div>
              )}

              <Input
                id="email"
                type="email"
                label="El. pašto adresas"
                placeholder="draugas@email.lt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="dark"
                  onClick={() => router.push(`/trips/${tripId}`)}
                  className="!bg-gray-700"
                >
                  Grįžti
                </Button>
                <Button type="submit" isLoading={isLoading} variant="dark">
                  Siųsti kvietimą
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
