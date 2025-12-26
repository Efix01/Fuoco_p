
import { createClient } from '@supabase/supabase-js';

// Queste variabili devono essere configurate nel tuo ambiente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * LOCAL STORAGE ADAPTER FOR MOCK SUPABASE
 * Questo permette all'applicazione di funzionare in modalità "offline/demo"
 * mantenendo la stessa firma API di Supabase.
 */
class LocalStorageTable {
  tableName: string;

  constructor(tableName: string) {
    this.tableName = `gauf_db_${tableName}`;
  }

  getData(): any[] {
    const data = localStorage.getItem(this.tableName);
    return data ? JSON.parse(data) : [];
  }

  setData(data: any[]) {
    localStorage.setItem(this.tableName, JSON.stringify(data));
  }

  async select() {
    const data = this.getData();
    return {
      data,
      error: null,
      order: (col: string, { ascending }: { ascending: boolean } = { ascending: true }) => {
        const sorted = [...data].sort((a, b) => {
          if (a[col] < b[col]) return ascending ? -1 : 1;
          if (a[col] > b[col]) return ascending ? 1 : -1;
          return 0;
        });
        return { data: sorted, error: null };
      }
    };
  }

  async insert(rows: any | any[]) {
    const current = this.getData();
    const newRows = Array.isArray(rows) ? rows : [rows];
    // Add fake ID if missing
    const toInsert = newRows.map((r: any) => ({ ...r, id: r.id || crypto.randomUUID() }));
    this.setData([...current, ...toInsert]);
    return { data: toInsert, error: null };
  }

  update(updates: any) {
    return {
      eq: async (col: string, val: any) => {
        const current = this.getData();
        const updated = current.map(item => item[col] === val ? { ...item, ...updates } : item);
        this.setData(updated);
        return { data: updated, error: null };
      }
    };
  }

  delete() {
    return {
      eq: async (col: string, val: any) => {
        const current = this.getData();
        const filtered = current.filter(item => item[col] !== val);
        this.setData(filtered);
        return { error: null };
      }
    };
  }
}

const createMockSupabase = () => {
  console.warn("⚠️ SUPABASE KEYS MANCANTI: Utilizzo database locale (localStorage).");

  return {
    auth: {
      getSession: async () => {
        const session = localStorage.getItem('gauf_auth_session');
        return { data: { session: session ? JSON.parse(session) : null }, error: null };
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return { data: { subscription: { unsubscribe: () => { } } } };
      },
      signInWithPassword: async ({ email }: { email: string }) => {
        // Mock Login
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockUser = {
          id: 'mock-user-id',
          email: email,
          user_metadata: {
            full_name: email.split('@')[0],
            badge_id: 'GAUF-MOCK',
            rank: 'Operatore Simulato',
            unit: 'CFVA Locale'
          }
        };
        const mockSession = { user: mockUser, access_token: 'mock-token' };
        localStorage.setItem('gauf_auth_session', JSON.stringify(mockSession));
        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem('gauf_auth_session');
        return { error: null };
      },
    },
    from: (table: string) => {
      const db = new LocalStorageTable(table);
      return {
        select: (query?: string) => {
          // Mock semplice di select, ignora query string complessa per ora
          return db.select();
        },
        insert: (data: any) => db.insert(data),
        update: (data: any) => db.update(data),
        delete: () => db.delete(),
      };
    }
  };
};

export const supabase = (supabaseUrl && supabaseUrl.trim() !== '' && supabaseAnonKey && supabaseAnonKey.trim() !== '')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createMockSupabase() as any);
