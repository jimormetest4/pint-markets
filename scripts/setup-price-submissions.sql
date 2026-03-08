-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/rsltfqxkzsrlxwejlygu/sql)

CREATE TABLE IF NOT EXISTS price_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pub_id UUID REFERENCES pubs(id),
  pub_submission_id UUID REFERENCES pub_submissions(id),
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  price_pence INTEGER NOT NULL,
  is_correction BOOLEAN DEFAULT FALSE,
  existing_price_id UUID REFERENCES prices(id),
  existing_price_pence INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  ip TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_submissions_status ON price_submissions(status);
CREATE INDEX IF NOT EXISTS idx_price_submissions_pub_id ON price_submissions(pub_id);
