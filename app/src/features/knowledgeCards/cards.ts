export type KnowledgeCard = {
  id: string;
  course: string;
  front: string;
  back: string;
};

export const CARDS: KnowledgeCard[] = [
  {
    id: "k1",
    course: "Prompt Engineering",
    front: "What is temperature in an LLM?",
    back:
      "A sampling parameter (0–2) controlling randomness. Low = deterministic. Higher = more diverse but less reliable. 0 for extraction; 0.7+ for creativity.",
  },
  {
    id: "k2",
    course: "RAG in Production",
    front: "Why hybrid retrieval beats pure embeddings?",
    back:
      "Embeddings miss exact term matches (rare names, codes). Hybrid = BM25 (lexical) + vectors (semantic), reranked. Recall jumps 15–30% on technical corpora.",
  },
  {
    id: "k3",
    course: "RAG in Production",
    front: "What's reranking and why use it?",
    back:
      "A second model that scores each retrieved chunk against the query for relevance. Cheap cross-encoder (e.g. Cohere Rerank) on top-50 → top-5. Dramatically reduces hallucination.",
  },
  {
    id: "k4",
    course: "AI SaaS",
    front: "What's the wedge?",
    back:
      "The narrow, painful, urgent problem you solve uniquely well. Build for ONE archetype first — owner of a 5-person agency drowning in proposals. Beat them at that. Expand later.",
  },
  {
    id: "k5",
    course: "Prompt Engineering",
    front: "Structured output: how?",
    back:
      "Define a JSON schema in the prompt + use the model's structured-output mode. Validate with Zod. Reject and retry on schema failure. Output gets predictable enough to ship to prod.",
  },
];
