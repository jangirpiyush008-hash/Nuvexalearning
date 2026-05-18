export type Sprint = {
  id: string;
  title: string;
  topic: string;
  body: string;
  question: { prompt: string; options: string[]; correct: number };
  estReadSeconds: number;
};

// Demo daily sprints (rotates by day). In prod these come from Supabase.
export const SPRINTS: Sprint[] = [
  {
    id: "s1",
    title: "Why temperature=0 isn't always best",
    topic: "PROMPTING",
    body:
      "Temperature controls randomness. At 0, the model picks the highest-probability token every time — deterministic but bland.\n\nFor creative work (taglines, story ideas) try 0.7–0.9. For extraction (parsing receipts, classifying tickets) keep it at 0. For code generation, 0.2 usually balances accuracy with sane variation.\n\nGotcha: even at temp=0, identical inputs can still drift slightly because of GPU non-determinism. If you need 100% repeatability, hash the output for caching.",
    question: {
      prompt: "Best temperature for classifying support tickets?",
      options: ["0.0", "0.5", "0.8", "1.0"],
      correct: 0,
    },
    estReadSeconds: 45,
  },
  {
    id: "s2",
    title: "RAG chunk size that doesn't suck",
    topic: "RAG",
    body:
      "Tiny chunks (under 256 tokens) lose context — your retrieved 'fact' has no surrounding rationale, so the model hallucinates filler.\n\nGiant chunks (over 2048) blow your context window and hurt recall — the embedding ends up generic.\n\nSweet spot for technical docs: 512–1024 tokens with 10–20% overlap between chunks. For chat logs / FAQs: 256–512. Re-chunk on semantic boundaries, not character counts.",
    question: {
      prompt: "Recommended chunk size for technical docs?",
      options: ["64–128", "256–512", "512–1024", "2048+"],
      correct: 2,
    },
    estReadSeconds: 50,
  },
  {
    id: "s3",
    title: "Prompt caching: 90% cost drop, 1 line of code",
    topic: "CACHING",
    body:
      "Anthropic's prompt caching marks long stable prefixes (system prompt, big doc) as cacheable. Next call with the same prefix → reads from cache at ~10% the input cost.\n\nThe magic is in cache_control on the message block. Put your stable instructions + large reference doc as one cached block, append the user's question after.\n\nCache TTL is 5 minutes (ephemeral) or 1 hour (extended). For Q&A on a single doc, this is the biggest cost lever you have.",
    question: {
      prompt: "Cheapest move for high-volume Q&A on the same doc?",
      options: [
        "Smaller model",
        "Lower temperature",
        "Prompt caching with cache_control",
        "Fewer max_tokens",
      ],
      correct: 2,
    },
    estReadSeconds: 55,
  },
];

export function todaysSprint(): Sprint {
  // Pick by day-of-year so it's stable within a day
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return SPRINTS[day % SPRINTS.length];
}
