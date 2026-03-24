"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type ActivityForEdit = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: Date;
  time: string | null;
  cost: number | null;
};

interface EditActivityFormProps {
  tripId: string;
  activity: ActivityForEdit;
}

function toDateInputValue(d: Date) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EditActivityForm({ tripId, activity }: EditActivityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: activity.title,
    description: activity.description ?? "",
    location: activity.location ?? "",
    date: toDateInputValue(activity.date),
    time: activity.time ?? "",
    cost: activity.cost != null ? String(activity.cost) : "",
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
      const response = await fetch(
        `/api/trips/${tripId}/activities/${activity.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            cost: formData.cost ? parseFloat(formData.cost) : null,
          }),
        }
      );

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
            <h1 className="text-2xl font-bold text-white">Redaguoti veiklą</h1>
            <p className="text-gray-200 mt-1">Pakeiskite veiklos duomenis</p>
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
                  className="block text-sm font-medium mb-1 text-gray-200"
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
                  className="block w-full px-3 py-2 rounded-lg shadow-sm bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>

              <Input
                id="location"
                name="location"
                label="Vieta (neprivaloma)"
                placeholder="pvz. Champ de Mars, 5 Avenue Anatole France"
                value={formData.location}
                onChange={handleChange}
                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
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
                  className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                />
                <Input
                  id="time"
                  name="time"
                  label="Laikas (neprivaloma)"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="bg-white/10 border-white/30 text-white placeholder-gray-400"
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
                className="bg-white/10 border-white/30 text-white placeholder-gray-400"
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
                  Išsaugoti
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
