// Static thumbnail registry. RN bundler requires literal require() paths,
// so dynamic asset URIs can't be built at runtime. Map slug → bundled image.
// Demo data sets `thumbnail_url: "asset:<slug>"`; helper below resolves it.

const REGISTRY: Record<string, number> = {
  "prompt-engineering-builders": require("../../assets/thumbnails/prompt-engineering-builders.png"),
  "rag-in-production": require("../../assets/thumbnails/rag-in-production.png"),
  "launch-ai-saas-30-days": require("../../assets/thumbnails/launch-ai-saas-30-days.png"),
};

export function resolveThumbnail(thumb: string | null | undefined):
  | { type: "asset"; source: number }
  | { type: "uri"; source: { uri: string } }
  | null {
  if (!thumb) return null;
  if (thumb.startsWith("asset:")) {
    const slug = thumb.slice("asset:".length);
    const source = REGISTRY[slug];
    return source ? { type: "asset", source } : null;
  }
  return { type: "uri", source: { uri: thumb } };
}
