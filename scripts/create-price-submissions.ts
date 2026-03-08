import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rsltfqxkzsrlxwejlygu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbHRmcXhrenNybHh3ZWpseWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3NzM4MywiZXhwIjoyMDg4NDUzMzgzfQ.sYARDlHMoIpbHO87qkZYYf8I-I_1cE6HlNbt6WcVzv4";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function main() {
  // Check if table already exists
  const { error: checkErr } = await supabase
    .from("price_submissions")
    .select("id")
    .limit(1);

  if (!checkErr) {
    console.log("price_submissions table already exists");
    return;
  }

  if (!checkErr.message.includes("does not exist")) {
    console.log("Unexpected error:", checkErr.message);
    return;
  }

  // Table doesn't exist — try to create via insert (will fail but confirms)
  // Supabase JS client can't run raw DDL, so we need to use the REST SQL endpoint
  console.log("Table does not exist. Creating via Supabase Management API...");

  const res = await fetch(
    `${supabaseUrl}/rest/v1/rpc/`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  // If RPC doesn't work, output SQL for manual creation
  console.log("\nPlease run this SQL in the Supabase SQL Editor:\n");
  console.log(`CREATE TABLE IF NOT EXISTS price_submissions (
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

CREATE INDEX idx_price_submissions_status ON price_submissions(status);
CREATE INDEX idx_price_submissions_pub_id ON price_submissions(pub_id);
`);
}

main().catch(console.error);
