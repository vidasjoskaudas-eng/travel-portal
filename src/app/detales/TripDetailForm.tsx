"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TripDetailFormProps {
  glass?: boolean;
}

export function TripDetailForm({ glass }: TripDetailFormProps = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    budget: "",
    currency: "EUR",
    participantCount: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trip-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: form.budget ? Number(form.budget) : null,
          currency: form.currency || null,
          participantCount: form.participantCount
            ? Number(form.participantCount)
            : null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nepavyko išsaugoti");
        setLoading(false);
        return;
      }
      setForm({
        budget: "",
        currency: "EUR",
        participantCount: "",
        notes: "",
      });
      router.refresh();
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    }
    setLoading(false);
  };

  const labelClass = glass ? "block text-sm font-medium text-gray-200 mb-1" : "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = glass
    ? "w-full px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-white/30"
    : "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  if (glass) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-200 bg-red-900/40 p-2 rounded">{error}</p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Biudžetas</label>
            <input type="number" step="0.01" min={0} placeholder="pvz. 500" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Valiuta</label>
            <input placeholder="EUR" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Dalyvių skaičius</label>
          <input type="number" min={0} placeholder="pvz. 4" value={form.participantCount} onChange={(e) => setForm((p) => ({ ...p, participantCount: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Užrašai</label>
          <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Papildomos pastabos..." rows={2} className={inputClass} />
        </div>
        <Button type="submit" isLoading={loading} variant={glass ? "dark" : "primary"}>
          Išsaugoti detales
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Biudžetas"
          type="number"
          step="0.01"
          min="0"
          placeholder="pvz. 500"
          value={form.budget}
          onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
        />
        <Input
          label="Valiuta"
          placeholder="EUR"
          value={form.currency}
          onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
        />
      </div>
      <Input
        label="Dalyvių skaičius"
        type="number"
        min="0"
        placeholder="pvz. 4"
        value={form.participantCount}
        onChange={(e) =>
          setForm((p) => ({ ...p, participantCount: e.target.value }))
        }
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Užrašai
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Papildomos pastabos..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <Button type="submit" isLoading={loading}>
        Išsaugoti detales
      </Button>
    </form>
  );
}
