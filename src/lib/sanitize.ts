/** Prevent CRLF injection in email subject / display names (RFC 5322 header safety). */
export function stripHeaderInjection(value: string): string {
  return value.replace(/[\r\n\x00]/g, " ").trim();
}

/** HTML body escape (user-controlled content in emails). */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
