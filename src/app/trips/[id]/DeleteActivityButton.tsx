"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface DeleteActivityButtonProps {
  tripId: number;
  activityId: string;
  activityTitle: string;
}

export function DeleteActivityButton({
  tripId,
  activityId,
  activityTitle,
}: DeleteActivityButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (
      !confirm(
        `Ar tikrai norite ištrinti veiklą „${activityTitle}"? Šis veiksmas negrįžtamas.`
      )
    ) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/activities/${activityId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nepavyko ištrinti");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Įvyko klaida. Bandykite dar kartą.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Trinama..." : "Ištrinti"}
      </Button>
      {error && <p className="text-xs text-red-200 max-w-[12rem] text-right">{error}</p>}
    </div>
  );
}
