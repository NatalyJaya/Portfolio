/**
 * Static export for GitHub Pages.
 *
 * PAGES_BASE_PATH is provided by the CD workflow (actions/configure-pages
 * output), e.g. "/Portfolio" for a project site, or "" for a custom domain.
 * Locally it is unset, so the site is served from "/".
 *
 * Security headers are not configured here: GitHub Pages serves static files
 * and ignores Next.js `headers()`. Configure them at the CDN if you move hosts.
 */
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
};

export default nextConfig;
