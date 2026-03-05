"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface EditTripFormProps {
  tripId: number;
  initialData: {
    title: string;
    location: string;
    notes: string;
    startDate: string;
    endDate: string;
  };
  glass?: boolean;
}

export function EditTripForm({ tripId, initialData, glass }: EditTripFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Pradžios data negali būti vėlesnė už pabaigos datą");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const cardVariant = glass ? ("glass" as const) : ("default" as const);
  const titleClass = glass ? "text-2xl font-bold text-white" : "text-2xl font-bold text-gray-900";
  const subtitleClass = glass ? "text-gray-200 mt-1" : "text-gray-600 mt-1";
  const labelClass = glass ? "block text-sm font-medium text-gray-200 mb-1" : "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = glass
    ? "block w-full px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-white/30"
    : "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const errorClass = glass
    ? "p-3 text-sm text-red-200 bg-red-900/40 border border-red-300/50 rounded-lg"
    : "p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg";

  return (
    <Card variant={cardVariant}>
      <CardHeader>
        <h1 className={titleClass}>
          Redaguoti kelionę
        </h1>
        <p className={subtitleClass}>
          Pakeiskite kelionės informaciją
        </p>
      </CardHeader>
      <CardContent className={glass ? "text-white [&_label]:text-gray-200" : ""}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className={errorClass}>
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
            className={glass ? "bg-white/10 border-white/30 text-white placeholder-gray-400" : ""}
          />

          <Input
            id="location"
            name="location"
            label="Vieta (šalis / miestas)"
            placeholder="pvz. Paryžius, Prancūzija"
            value={formData.location}
            onChange={handleChange}
            required
            className={glass ? "bg-white/10 border-white/30 text-white placeholder-gray-400" : ""}
          />

          <div>
            <label htmlFor="notes" className={labelClass}>
              Pastabos (neprivaloma)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Trumpai apie kelionę..."
              value={formData.notes}
              onChange={handleChange}
              className={inputClass}
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
              className={glass ? "bg-white/10 border-white/30 text-white placeholder-gray-400" : ""}
            />
            <Input
              id="endDate"
              name="endDate"
              label="Pabaigos data"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              className={glass ? "bg-white/10 border-white/30 text-white placeholder-gray-400" : ""}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant={glass ? "dark" : "outline"}
              onClick={() => router.back()}
              className={glass ? "!bg-gray-700" : ""}
            >
              Atšaukti
            </Button>
            <Button type="submit" isLoading={isLoading} variant={glass ? "dark" : "primary"}>
              Išsaugoti pakeitimus
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
