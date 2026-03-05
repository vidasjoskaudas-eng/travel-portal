"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function NewActivityPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    cost: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Įvyko klaida");
        return;
      }

      router.push(`/trips/${tripId}`);
      router.refresh();
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    } finally {
      setIsLoading(false);
    }
  };

  const bgImage =
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/trips/${tripId}`}
          className="text-sm text-gray-200 hover:text-white mb-4 inline-block"
        >
          ← Grįžti į kelionę
        </Link>

        <Card variant="glass">
          <CardHeader>
            <h1 className="text-2xl font-bold text-white">Nauja veikla</h1>
            <p className="text-gray-200 mt-1">
              Pridėkite veiklą prie kelionės plano
            </p>
          </CardHeader>
          <CardContent className="text-white [&_label]:text-gray-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-200 bg-red-900/40 border border-red-300/50 rounded-lg">
                  {error}
                </div>
              )}

            <Input
              id="title"
              name="title"
              label="Veiklos pavadinimas"
              placeholder="pvz. Eifelio bokšto lankymas"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Aprašymas (neprivaloma)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Papildoma informacija..."
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Input
              id="location"
              name="location"
              label="Vieta (neprivaloma)"
              placeholder="pvz. Champ de Mars, 5 Avenue Anatole France"
              value={formData.location}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="date"
                name="date"
                label="Data"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <Input
                id="time"
                name="time"
                label="Laikas (neprivaloma)"
                type="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>

            <Input
              id="cost"
              name="cost"
              label="Kaina € (neprivaloma)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.cost}
              onChange={handleChange}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="dark"
                onClick={() => router.back()}
                className="!bg-gray-700"
              >
                Atšaukti
              </Button>
              <Button type="submit" isLoading={isLoading} variant="dark">
                Pridėti veiklą
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
