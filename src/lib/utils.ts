/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Prefix a /public path with the deployment base path (GitHub Pages). */
export function withBase(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);
