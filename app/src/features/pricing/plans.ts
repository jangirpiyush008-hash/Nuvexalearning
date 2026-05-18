export type PlanId = "starter" | "builder" | "founder";

export type Plan = {
  id: PlanId;
  name: string;
  pricePaise: number;
  courseSlots: number;
  perCourse: number;
  highlight: string;
  perks: string[];
  popular?: boolean;
  badge?: string;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    pricePaise: 49900,
    courseSlots: 2,
    perCourse: 25000,
    highlight: "Test the waters",
    perks: [
      "2 courses · lifetime access",
      "60-second trial on any course",
      "Daily AI Sprint",
      "Pass tier reward → up to ₹400",
      "Voices wall + Knowledge Cards",
    ],
  },
  {
    id: "builder",
    name: "Builder",
    pricePaise: 99900,
    courseSlots: 5,
    perCourse: 20000,
    highlight: "Most popular",
    popular: true,
    badge: "★ MOST POPULAR",
    perks: [
      "5 courses · lifetime access",
      "Everything in Starter",
      "Pass tier → up to ₹1,000",
      "Top tier eligible (95%+ → ₹10,000)",
      "Study Squad matching",
      "Priority moderation on Voices",
    ],
  },
  {
    id: "founder",
    name: "Founder",
    pricePaise: 199900,
    courseSlots: 12,
    perCourse: 16659,
    highlight: "Net-positive territory",
    badge: "BEST VALUE",
    perks: [
      "12 courses · lifetime access",
      "Everything in Builder",
      "Up to ₹120,000 lifetime reward ceiling",
      "Skip-lesson speedrun mode",
      "Verifiable certificate with proctored proof",
      "AI Coach DMs · 1:1 personality",
      "Beta access to new courses",
    ],
  },
];

// Reward math used by the ROI calculator.
// 95%+ score → ₹10,000 credits (capped by monthly pool)
// 70%+ score → ₹200 credits
// <70%       → ₹0 (retry after 30d or pay ₹99)
export function calcRoi(
  plan: Plan,
  topTierWins: number,
  passTierWins: number,
): { earned: number; net: number; netPct: number } {
  const earned = topTierWins * 1_000_000 + passTierWins * 20_000; // paise
  const net = earned - plan.pricePaise;
  const netPct = plan.pricePaise > 0 ? Math.round((net / plan.pricePaise) * 100) : 0;
  return { earned, net, netPct };
}
