/**
 * Shared security utilities used across API routes.
 * Import these instead of duplicating validation logic.
 */

/**
 * Validates that a string is a well-formed YYYY-MM-DD date.
 * Rejects path traversal attempts like "../../etc/passwd".
 */
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Validates that a storyId contains only safe URL-safe characters.
 * Prevents injection into Redis keys or filesystem paths.
 */
export function isValidStoryId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

/**
 * Curated ElevenLabs voice IDs that the application allows.
 * Whitelisting prevents arbitrary voice IDs being injected into API URLs
 * or used to probe other accounts' voices.
 */
export const ALLOWED_VOICE_IDS: ReadonlySet<string> = new Set([
  'onwK4e9ZLuTAKqWW03F9', // Daniel  — British · Broadcaster
  'nPczCjzI2devNBz1zQrb', // Brian   — British · Deep
  'JBFqnCBsd6RMkjVDRZzb', // George  — British · Warm
  'EXAVITQu4vr4xnSDxMaL', // Sarah   — British · Confident
  'XrExE9yKIg1WjnnlVkGX', // Matilda — British · Clear
]);

/**
 * Returns true only if the voice ID is in the application's curated whitelist.
 * Always prefer this over isValidVoiceId for security-sensitive code paths.
 */
export function isWhitelistedVoiceId(id: string): boolean {
  return ALLOWED_VOICE_IDS.has(id);
}

/**
 * @deprecated Use isWhitelistedVoiceId instead — regex alone cannot prevent
 * abuse of arbitrary ElevenLabs voice IDs. Kept for backwards compatibility.
 */
export function isValidVoiceId(id: string): boolean {
  return /^[a-zA-Z0-9]{15,30}$/.test(id);
}

/**
 * Validates that a slug contains only lowercase alphanumeric characters and hyphens.
 * Used to validate /firms/[slug] route params before Map lookups — prevents path traversal.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{1,64}$/.test(slug);
}

/**
 * Validates that an application status is one of the allowed enum values.
 */
const VALID_APP_STATUSES = new Set([
  'not-started', 'in-progress', 'submitted', 'interview', 'offer', 'rejected',
]);
export function isValidApplicationStatus(s: unknown): boolean {
  return typeof s === 'string' && VALID_APP_STATUSES.has(s);
}

/**
 * Returns a safe, sanitised error message from an upstream API response.
 * Never leaks raw API error bodies to the client.
 */
export function sanitizeUpstreamError(status: number): string {
  if (status === 401) return 'Upstream API authentication failed.';
  if (status === 429) return 'Upstream API rate limit reached. Please try again later.';
  if (status >= 500) return 'Upstream API error. Please try again later.';
  return 'Upstream API request failed.';
}
