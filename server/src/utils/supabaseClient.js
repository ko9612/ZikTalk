// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL, // Supabase 프로젝트 URL
  process.env.SUPABASE_KEY // .env에 넣은 service_role 키
);

export default supabase;
