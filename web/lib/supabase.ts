import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anon
    ? createClient(url, anon)
    : null;

export type ProductRow = {
  id: string;            // bytes32 hex
  serial_number: string;
  batch_number: string;
  name: string;
  category: string | null;
  origin_country: string | null;
  manufacturer_name: string | null;
  manufacturer_address: string;
  image_url: string | null;
  metadata_cid: string;
  qr_url: string | null;
  created_at: string;
};
