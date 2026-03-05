"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface IdeaFormProps {
  glass?: boolean;
}

export function IdeaForm({ glass }: IdeaFormProps = {}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nepavyko pridėti idėjos");
        setLoading(false);
        return;
      }
      setContent("");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className={`text-sm p-2 rounded ${glass ? "text-red-200 bg-red-900/40" : "text-red-600 bg-red-50"}`}>{error}</p>
      )}
      <div>
        <label htmlFor="idea" className={labelClass}>
          Jūsų idėja
        </label>
        <textarea
          id="idea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Parašykite idėją arba pastabą..."
          rows={3}
          className={inputClass}
          required
        />
      </div>
      <Button type="submit" isLoading={loading} variant={glass ? "dark" : "primary"}>
        Pridėti idėją
      </Button>
    </form>
  );
}
