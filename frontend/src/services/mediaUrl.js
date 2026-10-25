import { API_URL } from "@/services/apiUrl";

/** Resolves both legacy API paths (/uploads/...) and absolute object-storage URLs. */
export function getMediaUrl(value, fallback = "") {
  if (typeof value !== "string" || !value.trim()) return fallback;

  const mediaPath = value.trim();
  if (/^(?:https?:)?\/\//i.test(mediaPath) || /^(?:data:|blob:)/i.test(mediaPath)) {
    return mediaPath;
  }

  if (mediaPath.startsWith("/images/")) return mediaPath;

  return `${API_URL}/${mediaPath.replace(/^\/+/, "")}`;
}
