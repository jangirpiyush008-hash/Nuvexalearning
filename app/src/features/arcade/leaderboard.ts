// Weekly Prompt Pop leaderboard. Dummy data for demo — wire to Supabase
// `arcade_scores` table later.

export type LeaderboardEntry = {
  rank: number;
  handle: string;
  score: number;
  reward?: string; // "₹1L" etc for top 3
  isYou?: boolean;
};

export const WEEKLY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1,  handle: "arjun_ml",     score: 2840, reward: "1L tokens" },
  { rank: 2,  handle: "priya_ai",     score: 2710, reward: "50K tokens" },
  { rank: 3,  handle: "neha_nocode",  score: 2580, reward: "25K tokens" },
  { rank: 4,  handle: "vikram_llm",   score: 2390 },
  { rank: 5,  handle: "ananya_voice", score: 2180 },
  { rank: 6,  handle: "rohan_codes",  score: 2050 },
  { rank: 7,  handle: "maya_ships",   score: 1920 },
  { rank: 8,  handle: "kabir_ai",     score: 1740 },
  { rank: 9,  handle: "isha_rag",     score: 1580 },
  { rank: 10, handle: "sahil_agent",  score: 1450 },
];

// Compute the user's hypothetical rank given a score.
export function rankFor(score: number): number {
  let r = 1;
  for (const e of WEEKLY_LEADERBOARD) {
    if (score >= e.score) return r;
    r++;
  }
  return r;
}
