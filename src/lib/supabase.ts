import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
export const SUPABASE_PROJECT_ID = 'vweyqbvhvuwiprtnygbj';
export const SUPABASE_URL =
  (import.meta.env?.VITE_SUPABASE_URL as string) ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// Publishable (anon) API key safe for client-side usage
export const SUPABASE_ANON_KEY =
  (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_bUXfOrljoYtQB_3w7F3ARg_3oJwUb6T';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  authHealthStatus: number;
  authVersion?: string;
  projectId: string;
  tablesFound?: string[];
  tablesMissing?: string[];
  timestamp: string;
}

/**
 * Tests connectivity to the user's Supabase backend
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const timestamp = new Date().toISOString();
  try {
    // 1. Check Auth / GoTrue Health endpoint
    const healthRes = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });

    let authVersion = '';
    if (healthRes.ok) {
      try {
        const data = await healthRes.json();
        authVersion = data.version || 'v2.x';
      } catch {}
    }

    // 2. Check if main tables exist in schema cache
    const checkTables = ['orders', 'products', 'categories', 'profiles'];
    const tablesFound: string[] = [];
    const tablesMissing: string[] = [];

    await Promise.all(
      checkTables.map(async (table) => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
            method: 'GET',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          });
          if (res.status === 200) {
            tablesFound.push(table);
          } else if (res.status === 404 || res.status === 400) {
            tablesMissing.push(table);
          }
        } catch {
          tablesMissing.push(table);
        }
      })
    );

    if (healthRes.ok) {
      return {
        success: true,
        message: 'Supabase প্রজেক্টের সঙ্গে সফলভাবে সংযোগ স্থাপিত হয়েছে।',
        authHealthStatus: healthRes.status,
        authVersion,
        projectId: SUPABASE_PROJECT_ID,
        tablesFound,
        tablesMissing,
        timestamp,
      };
    } else {
      return {
        success: false,
        message: `সার্ভার রেসপন্স কোড: ${healthRes.status}`,
        authHealthStatus: healthRes.status,
        projectId: SUPABASE_PROJECT_ID,
        tablesFound,
        tablesMissing,
        timestamp,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Supabase সার্ভারে সংযোগ করা সম্ভব হয়নি।',
      authHealthStatus: 0,
      projectId: SUPABASE_PROJECT_ID,
      timestamp,
    };
  }
}
