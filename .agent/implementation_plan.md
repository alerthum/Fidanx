# Implementation Plan - Fixing Vercel API URL

## Problem
The Vercel deployment of FidanX is not loading data because the client-side code is hardcoded to use `http://localhost:3201/api` as a fallback `NEXT_PUBLIC_API_URL`. This works locally but fails in production where the API is served via Vercel's proxy.

## Solution
Update all instances where `NEXT_PUBLIC_API_URL` is used to default to a relative path `/api` instead of `http://localhost:3201/api`. This ensures that in production, the client makes requests to the same origin, which Vercel will then proxy to the backend.

## Proposed Changes

### Client-Side Updates
- [x] Update `client/app/uretim/page.tsx`
- [x] Update `client/app/stoklar/page.tsx`
- [x] Update `client/app/page.tsx`
- [x] Update `client/app/analizler/page.tsx`
- [x] Update `client/app/sera/page.tsx`
- [x] Update `client/app/satislar/page.tsx`
- [x] Update `client/app/satinalma/page.tsx`
- [x] Update `client/app/receteler/page.tsx`
- [x] Update `client/app/raporlar/page.tsx`
- [x] Update `client/app/operasyon/page.tsx`
- [x] Update `client/app/hareketler/page.tsx`
- [x] Update `client/app/firmalar/page.tsx`
- [x] Update `client/app/finans/page.tsx`
- [x] Update `client/app/destek/page.tsx`
- [x] Update `client/app/ayarlar/veri-yukle/page.tsx`
- [x] Update `client/app/ayarlar/page.tsx`
- [x] Update `client/app/analizler/maliyetler/page.tsx`
- [x] Update `client/components/NotificationCenter.tsx`

## Verification
- [x] Verify no other hardcoded `localhost:3201` strings exist in `client/app` and `client/components` (except `.env.local`).

## Next Steps
1. Commit changes.
2. Push to repository to trigger Vercel deployment.
3. User verifies the fix on Vercel.
