"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface DeleteTripButtonProps {
  tripId: number;
  tripTitle: string;
}

export function DeleteTripButton({ tripId, tripTitle }: DeleteTripButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm(`Ar tikrai norite ištrinti kelionę „${tripTitle}"? Šis veiksmas negrįžtamas.`)) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nepavyko ištrinti");
        setLoading(false);
        return;
      }
      router.push("/trips");
      router.refresh();
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Trinama..." : "Ištrinti kelionę"}
      </Button>
      {error && (
        <p className="text-sm text-red-200">{error}</p>
      )}
    </div>
  );
}
