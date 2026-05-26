# Supabase Edge Functions

The tracking pixel logic (open/click analytics) is currently handled by a **Supabase Edge Function** for high-performance global execution.

## Deployment

Ensure you are logged into the Supabase CLI, then run:

```bash
supabase functions deploy track --project-ref your-project-ref
```

## Migrating off Supabase

If you wish to move this logic to a standard microservice (Node.js or Python):

1.  **Logic:** The logic is in `supabase/functions/track/index.ts`. It is standard TypeScript/Deno.
2.  **Infrastructure:** Host it anywhere (AWS Lambda, Vercel, or a Docker container).
3.  **Integration:** Update the `NEXT_PUBLIC_TRACKING_URL` in your `.env` to point to your new service. The platform will automatically start using your new tracker for all future emails.
