---
description: Firebase Quota Exceeded Troubleshoot
---

# Firebase Quota Exceeded Troubleshoot

Final troubleshooting steps regarding the persistent "Quota Exceeded" error.

## Diagnosis
The backend is correctly configured to connect to Firebase project `fidanx-ea0eb`. The error persists because either:
1. The wrong project was upgraded in Firebase Console.
2. Google Cloud billing changes are propagating (can take 15-20 mins).
3. The server process cached the old quota state (a restart was triggered to fix this).

## Actions Taken
- **Verified Project ID:** Confirmed that `server/firebase-admin.json` points to project `fidanx-ea0eb`.
- **Triggered Server Restart:** Touched `server/src/main.ts` to force a `nodemon` restart, clearing any cached states.
- **Strict Error Handling:** Reaffirmed that no mock data will be served; the application will error out if the database is unreachable, ensuring data consistency.

## Required User Action
- Verify in Firebase Console that project `fidanx-ea0eb` is the one upgraded to **Blaze**.
- Wait for Google to propagate the billing changes.
