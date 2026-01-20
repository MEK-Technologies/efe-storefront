/**
 * Converts a string to a URL-safe slug
 * Examples:
 * "Sistemas Pod (Pod Systems)" -> "sistemas-pod-pod-systems"
 * "Equipos y Kits (Devices)" -> "equipos-y-kits-devices"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize to decomposed form for accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Decodes a URL-encoded string and handles edge cases
 * Examples:
 * "Sistemas%20Pod%20(Pod%20Systems)" -> "Sistemas Pod (Pod Systems)"
 * "sistemas-pod-pod-systems" -> "sistemas-pod-pod-systems"
 */
export function decodeHandle(encodedHandle: string): string {
  try {
    return decodeURIComponent(encodedHandle)
  } catch (e) {
    // If decoding fails, return as-is
    return encodedHandle
  }
}
