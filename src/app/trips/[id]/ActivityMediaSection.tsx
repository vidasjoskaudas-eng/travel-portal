"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type MediaUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type MediaItem = {
  id: number;
  imageUrl: string;
  comment: string;
  createdAt: string;
  user: MediaUser;
};

type Props = {
  tripId: number;
  activityId: string;
  canUpload: boolean;
  currentUserId: string;
  /** Organizer can delete anyone's photo; others only their own */
  canModerateMedia: boolean;
  initialMedia: MediaItem[];
};

export function ActivityMediaSection({
  tripId,
  activityId,
  canUpload,
  currentUserId,
  canModerateMedia,
  initialMedia,
}: Props) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canDeleteMedia = (media: MediaItem) =>
    canModerateMedia || media.user.id === currentUserId;

  const handleDelete = async (media: MediaItem) => {
    if (!canDeleteMedia(media)) return;
    setError("");
    setDeletingId(media.id);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/activities/${activityId}/media?mediaId=${media.id}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Nepavyko ištrinti nuotraukos."
        );
      }

      setMediaItems((prev) => prev.filter((m) => m.id !== media.id));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Įvyko klaida trinant nuotrauką.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Pasirinkite nuotrauką.");
      return;
    }
    if (!comment.trim()) {
      setError("Parašykite komentarą.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("comment", comment.trim());

      const response = await fetch(
        `/api/trips/${tripId}/activities/${activityId}/media`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Nepavyko išsaugoti nuotraukos.");
      }

      setMediaItems((prev) => [data.media as MediaItem, ...prev]);
      setComment("");
      setFile(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Įvyko klaida įkeliant.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <h4 className="text-sm font-semibold text-white mb-3">Nuotraukos ir komentarai</h4>

      {mediaItems.length > 0 ? (
        <div className="space-y-3">
          {mediaItems.map((media) => (
            <div
              key={media.id}
              className="rounded-lg border border-white/10 bg-black/20 p-3"
            >
              <div className="flex justify-end mb-2">
                {canDeleteMedia(media) && (
                  <Button
                    type="button"
                    variant="dark"
                    size="sm"
                    className="!bg-red-900/80 hover:!bg-red-800"
                    isLoading={deletingId === media.id}
                    disabled={deletingId !== null}
                    onClick={() => handleDelete(media)}
                  >
                    Šalinti
                  </Button>
                )}
              </div>
              <img
                src={media.imageUrl}
                alt="Veiklos nuotrauka"
                className="w-full max-h-64 object-cover rounded-md border border-white/10"
              />
              <p className="text-sm text-gray-200 mt-2">{media.comment}</p>
              <p className="text-xs text-gray-400 mt-1">
                Įkėlė: {media.user.name || media.user.email}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Dar nėra įkeltų nuotraukų.</p>
      )}

      {canUpload && (
        <form
          onSubmit={handleUpload}
          className="mt-4 rounded-lg border border-white/20 bg-black/30 p-4 space-y-3"
        >
          <h5 className="text-sm font-medium text-white">Pridėti naują nuotrauką</h5>
          {error && (
            <div className="text-sm text-red-200 bg-red-900/40 border border-red-300/50 rounded-lg p-2">
              {error}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-white/15 file:px-3 file:py-2 file:text-white"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Parašykite komentarą apie šią veiklą..."
            className="w-full min-h-20 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            variant="dark"
            isLoading={isUploading}
            disabled={isUploading}
          >
            Įkelti nuotrauką
          </Button>
        </form>
      )}
    </div>
  );
}
