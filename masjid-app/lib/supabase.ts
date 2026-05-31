import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bfbvnjyhrsjxysvcmowz.supabase.co";
const supabaseKey = "sb_publishable_6XrQ4OJULtIxrCnAfa3ffA_sHDgkwnB";

export const supabase = createClient(supabaseUrl, supabaseKey);