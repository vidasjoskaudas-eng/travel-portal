"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface CreateTripFormProps {
  /** Pusiau skaidrus stilius ant fono nuotraukos (be baltos kortelės) */
  glass?: boolean;
}

export function CreateTripForm({ glass }: CreateTripFormProps = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    location: "",
    notes: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          location: form.location,
          notes: form.notes || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create trip");
        setLoading(false);
        return;
      }
      setForm({ title: "", location: "", notes: "", startDate: "", endDate: "" });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const wrapperClass = glass
    ? "border border-white/20 rounded-lg"
    : "";
  const titleClass = glass
    ? "text-lg font-semibold text-white"
    : "text-lg font-semibold text-gray-900";
  const labelClass = glass
    ? "block text-sm font-medium text-gray-200 mb-1"
    : "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = glass
    ? "w-full px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white placeholder-gray-400"
    : "w-full px-3 py-2 border border-gray-300 rounded-lg";

  if (glass) {
    return (
      <div className={wrapperClass}>
        <div className="flex flex-row items-center justify-between p-4">
          <h2 className={titleClass}>Nauja kelionė</h2>
          <Button variant={glass ? "dark" : "outline"} size="sm" onClick={() => setOpen(!open)}>
            {open ? "Slėpti" : "Rodyti formą"}
          </Button>
        </div>
        {open && (
          <div className="px-4 pb-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-200 bg-red-900/40 p-2 rounded">{error}</p>
              )}
              <div>
                <label className={labelClass}>Pavadinimas</label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="pvz. Savaitgalis Paryžiuje"
                />
              </div>
              <div>
                <label className={labelClass}>Vieta (šalis / miestas)</label>
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  required
                  placeholder="pvz. Paryžius, Prancūzija"
                />
              </div>
              <div>
                <label className={labelClass}>Pastabos (neprivaloma)</label>
                <textarea
                  className={`${inputClass} min-h-[80px]`}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Trumpas aprašymas arba pastabos"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Pradžios data</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Pabaigos data</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={loading} variant={glass ? "dark" : "primary"}>
                  Sukurti kelionę
                </Button>
                <Button type="button" variant={glass ? "dark" : "outline"} onClick={() => setOpen(false)} className={glass ? "!bg-gray-700 hover:!bg-gray-600" : ""}>
                  Atšaukti
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card variant="bordered" className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Nauja kelionė</h2>
        <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
          {open ? "Slėpti" : "Rodyti formą"}
        </Button>
      </CardHeader>
      {open && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2">{error}</p>
            )}
            <Input
              label="Pavadinimas"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder="pvz. Savaitgalis Paryžiuje"
            />
            <Input
              label="Vieta (šalis / miestas)"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              required
              placeholder="pvz. Paryžius, Prancūzija"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pastabos (neprivaloma)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Trumpas aprašymas arba pastabos"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pradžios data"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                required
              />
              <Input
                label="Pabaigos data"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" isLoading={loading}>
                Sukurti kelionę
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Atšaukti
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
