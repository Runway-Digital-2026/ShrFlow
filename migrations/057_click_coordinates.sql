-- Add click_x and click_y to email_events
ALTER TABLE public.email_events ADD COLUMN IF NOT EXISTS click_x INT;
ALTER TABLE public.email_events ADD COLUMN IF NOT EXISTS click_y INT;

-- Create indexes for coordinates if queries require filtering
CREATE INDEX IF NOT EXISTS idx_email_events_coords ON public.email_events(campaign_id) WHERE click_x IS NOT NULL;
