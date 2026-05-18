# Nuvexa Studio

AI course-learning app with Voices wall, 1-minute trials, proctored tests, and AI Credits rewards.
**Stack:** React Native + Expo (TypeScript), Supabase (Postgres + Auth + Storage + Edge Functions), Apple IAP via StoreKit, Cloudflare Stream, Anthropic Claude.

---

## Repo layout

```
nuvexastudio app/
├── app/                          # React Native + Expo (TypeScript)
│   ├── app/                      # expo-router file-based routes
│   │   ├── (auth)/               # welcome, email
│   │   ├── (tabs)/               # home, library, voices, wallet, profile
│   │   └── course/[slug], player # course detail + player
│   ├── src/
│   │   ├── core/                 # supabase client, secure storage, models
│   │   ├── designSystem/         # tokens + components (Nuvexa palette)
│   │   └── features/             # auth, voices, wallet, etc. (MVVM-style)
│   ├── app.json
│   ├── package.json
│   └── .env.example
├── supabase/
│   ├── migrations/               # 20260517000001_init_schema.sql + RLS
│   ├── functions/                # Edge Functions (Deno + Zod)
│   │   ├── verify-iap-receipt/
│   │   ├── grade-test/
│   │   ├── grant-reward/
│   │   ├── redeem-credit/
│   │   ├── moderate-voice/
│   │   ├── get-video-url/
│   │   ├── claude-pdf-qa/
│   │   └── retake-fee-checkout/
│   └── seed.sql                  # 3 demo courses
└── .env.example
```

---

## 1. Supabase setup

```bash
# Install the CLI
brew install supabase/tap/supabase

# Login + link to your project
supabase login
cd "nuvexastudio app"
supabase link --project-ref <your-project-ref>

# Push migrations + seed data
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql

# Set Edge Function secrets
supabase secrets set \
  APPLE_SHARED_SECRET=... \
  ANTHROPIC_API_KEY=... \
  CF_ACCOUNT_ID=... \
  CF_STREAM_CUSTOMER=... \
  CF_STREAM_API_TOKEN=...

# Deploy all Edge Functions
supabase functions deploy verify-iap-receipt
supabase functions deploy grade-test
supabase functions deploy grant-reward
supabase functions deploy redeem-credit
supabase functions deploy moderate-voice
supabase functions deploy get-video-url
supabase functions deploy claude-pdf-qa
supabase functions deploy retake-fee-checkout
```

---

## 2. App Store Connect — IAP products

Create these in App Store Connect → My Apps → Nuvexa Studio → In-App Purchases:

| Product ID                      | Type           | Price | Notes                              |
| ------------------------------- | -------------- | ----- | ---------------------------------- |
| `nuvexa.course.<slug>`          | Non-consumable | varies| One per course (matches DB slug)   |
| `nuvexa.retake.skip`            | Consumable     | ₹99   | Skip 30-day test cooldown          |

Grab the **App-Specific Shared Secret** under App Information → App-Specific Shared Secret and add it as `APPLE_SHARED_SECRET`.

---

## 3. Run the app (Expo)

```bash
cd app
cp .env.example .env.local
# fill in EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY

npm install
npx expo prebuild --platform ios --clean
```

This generates the `ios/` folder with `NuvexaStudio.xcworkspace`.

### Open in Xcode

```bash
open ios/NuvexaStudio.xcworkspace
```

In Xcode:
1. Select a simulator (iPhone 15 Pro, iOS 17+) or your physical device
2. Set your **Team** under Signing & Capabilities
3. Press **⌘R** to build and run

### Or run from Metro

```bash
npx expo run:ios
```

---

## 4. Hard rules (do not skip)

- **RLS** is enabled on every table — verified in `supabase/migrations/20260517000002_rls_policies.sql`
- **Service-role key** is never bundled into the iOS app — only Edge Functions use it
- **Apple IAP receipts** are verified server-side before unlocking content
- **Currency** is always integer paise; never float
- **Claude API** is called only from Edge Functions, never from the client
- **Tokens** go in `expo-secure-store` (Keychain), never AsyncStorage
- **Reward grant** is idempotent on `test_attempt.id`

---

## 5. Locked product decisions

- Reward cap: top **100/month per course** earn the ₹10,000 prize (95%+ score). Throttled via `reward_pools` table.
- Test retake: free after 30 days, or pay **₹99** (`nuvexa.retake.skip` IAP) to skip cooldown.
- Color palette: indigo→violet→cyan signature gradient, near-black surface (`#0A0B14`), warm amber reserved for AI Credits/rewards only.

---

## 6. Build order (per PRD)

| Week | Scope                                                         | Status         |
| ---- | ------------------------------------------------------------- | -------------- |
| 1    | Supabase schema + RLS + Auth + Profile                        | ✅ scaffolded  |
| 2    | Home + Course Detail + Trial Player + IAP unlock              | 🚧 skeleton    |
| 3    | Library + full player + PDF reader + Ask Nuvexa AI            | ⏳             |
| 4    | Voices wall (compose, feed, reactions, replies, moderation)   | ⏳             |
| 5    | Test engine + grading + reward grant + Credits + redemption   | 🚧 backend done|
| 6    | Global Voices feed + Profile + follows + notifications        | ⏳             |
| 7    | Instructor dashboard + creator onboarding                     | ⏳             |
| 8    | Polish, animations, haptics, App Store submission             | ⏳             |

---

## 7. Self-audit checklist (run before every commit)

- [ ] `npm run typecheck` passes with zero errors
- [ ] No `service_role`, `sk-`, or `ANTHROPIC_API_KEY` in client source (`grep -r` to confirm)
- [ ] Every new table has RLS enabled + at least one policy
- [ ] Every Edge Function validates input with Zod
- [ ] Currency is integer paise, never float
- [ ] No leftover `console.log` for sensitive data
