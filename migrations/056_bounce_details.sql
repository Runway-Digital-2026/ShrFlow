-- Add bounce_type and bounce_reason to email_events
ALTER TABLE public.email_events ADD COLUMN IF NOT EXISTS bounce_type TEXT;
ALTER TABLE public.email_events ADD COLUMN IF NOT EXISTS bounce_reason TEXT;

-- Create index for fast bounce_type lookups
CREATE INDEX IF NOT EXISTS idx_email_events_bounce_type ON public.email_events(bounce_type);
