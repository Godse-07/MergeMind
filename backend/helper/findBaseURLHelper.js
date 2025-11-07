export function getFrontendBaseUrl(req) {
  const origin = req.headers.origin || req.headers.referer;
  if (origin && /^https?:\/\/(localhost|.*mergemind\.me|.*vercel\.app)/.test(origin)) {
    return origin.replace(/\/$/, "");
  }
  return process.env.FRONTEND_URL;
}
