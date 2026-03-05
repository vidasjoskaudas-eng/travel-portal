"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function NewTripPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    notes: "",
    startDate: "",
    endDate: "",
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

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Pradžios data negali būti vėlesnė už pabaigos datą");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Įvyko klaida");
        return;
      }

      router.push(`/trips/${data.trip.id}`);
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    } finally {
      setIsLoading(false);
    }
  };

  const bgImage =
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <Card variant="glass">
          <CardHeader>
            <h1 className="text-2xl font-bold text-white">
              Nauja kelionė
            </h1>
            <p className="text-gray-200 mt-1">
              Užpildykite informaciją apie planuojamą kelionę
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
              label="Kelionės pavadinimas"
              placeholder="pvz. Savaitgalis Paryžiuje"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <Input
              id="location"
              name="location"
              label="Vieta (šalis / miestas)"
              placeholder="pvz. Paryžius, Prancūzija"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pastabos (neprivaloma)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Trumpai apie kelionę..."
                value={formData.notes}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="startDate"
                name="startDate"
                label="Pradžios data"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <Input
                id="endDate"
                name="endDate"
                label="Pabaigos data"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

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
                Sukurti kelionę
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
