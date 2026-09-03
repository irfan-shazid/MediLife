// This file exists ONLY to catch a common mistake in this monorepo: running
// `expo start` (or `npx expo`) from the repo root instead of from the actual
// Expo project, which lives in apps/mobile. When Expo's default (non-router)
// entry point can't find its usual root App file, it resolves to exactly
// this path — so instead of a confusing "Unable to resolve ../../App"
// bundler error, you get this clear one instead.
//
// Fix: stop this process (Ctrl+C), then run one of:
//   npm run dev:mobile          (from the repo root)
//   cd apps/mobile && npx expo start
throw new Error(
  "MediTime: you're running Expo from the monorepo root. " +
    "cd into apps/mobile first (or run `npm run dev:mobile` from the root) — " +
    "the real app lives in apps/mobile, not here.",
);
