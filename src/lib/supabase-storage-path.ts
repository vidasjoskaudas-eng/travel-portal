/**
 * Extracts object path inside bucket "activity-media" from a Supabase public object URL.
 */
export function getActivityMediaStoragePathFromPublicUrl(
  imageUrl: string
): string | null {
  try {
    const u = new URL(imageUrl);
    const marker = "/object/public/activity-media/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}
