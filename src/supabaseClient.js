import { createClient } from '@supabase/supabase-js';

// URL ของโปรเจกต์ Supabase
const supabaseUrl = 'https://tuwfflsaiogidhbjqzxe.supabase.co';

// API Key (Publishable) แบบใหม่
const supabaseAnonKey = 'sb_publishable_uxx4TIrqUu8EsOyXvvanrw_kI7pD0j7';

// สร้างและส่งออกตัวเชื่อมต่อเพื่อให้ไฟล์ App.jsx เรียกใช้งานได้
export const supabase = createClient(supabaseUrl, supabaseAnonKey);