import { createClient } from '@supabase/supabase-js';

// Queste variabili devono essere configurate nel tuo ambiente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log("Supabase Config Check:", {
  urlExists: !!supabaseUrl,
  urlLength: supabaseUrl?.length,
  keyExists: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  mode: import.meta.env.MODE
});

/**
 * MOCK QUERY BUILDER
 * Simula il comportamento di PostgrestBuilder per supportare il chaining
 * (.select().order().eq()...) e l'esecuzione asincrona (thenable).
 */
class MockQueryBuilder {
  private tableName: string;
  private key: string;

  private op: 'select' | 'insert' | 'update' | 'delete' | null = null;
  private filters: { col: string; val: any }[] = [];
  private orderRule: { col: string; ascending: boolean } | null = null;
  private limitVal: number | null = null;
  private singleResult = false;
  private payload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.key = `gauf_db_${tableName}`;
  }

  private getData(): any[] {
    const json = localStorage.getItem(this.key);
    return json ? JSON.parse(json) : [];
  }

  private setData(data: any[]) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  // --- CHANABLE METHODS ---

  select(columns = '*') {
    this.op = 'select';
    return this;
  }

  insert(data: any) {
    this.op = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.op = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, val });
    return this;
  }

  order(col: string, { ascending } = { ascending: true }) {
    this.orderRule = { col, ascending };
    return this;
  }

  limit(n: number) {
    this.limitVal = n;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  // --- EXECUTION (THENABLE) ---

  then(resolve: (res: { data: any, error: any }) => void, reject: (err: any) => void) {
    // Simuliamo latenza di rete
    setTimeout(() => {
      try {
        const result = this.execute();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }, 100);
  }

  private execute() {
    let currentData = this.getData();
    let resultData: any = null;

    if (this.op === 'insert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const newRows = rows.map((r: any) => ({ ...r, id: r.id || crypto.randomUUID(), created_at: new Date().toISOString() }));
      currentData = [...currentData, ...newRows];
      this.setData(currentData);
      resultData = newRows; // Return inserted rows
    }
    else if (this.op === 'update') {
      let updatedCount = 0;
      currentData = currentData.map((row: any) => {
        const match = this.filters.every(f => row[f.col] === f.val);
        if (match) {
          updatedCount++;
          return { ...row, ...this.payload };
        }
        return row;
      });
      this.setData(currentData);
      // Return updated rows (simulated by re-filtering)
      resultData = currentData.filter((row: any) => this.filters.every(f => row[f.col] === f.val));
    }
    else if (this.op === 'delete') {
      const initialLen = currentData.length;
      currentData = currentData.filter((row: any) => !this.filters.every(f => row[f.col] === f.val));
      this.setData(currentData);
      resultData = null;
    }
    else {
      // SELECT (default)
      resultData = currentData.filter((row: any) => this.filters.every(f => row[f.col] === f.val));
    }

    // Apply Sort
    if (this.orderRule && Array.isArray(resultData)) {
      resultData.sort((a: any, b: any) => {
        const valA = a[this.orderRule!.col];
        const valB = b[this.orderRule!.col];
        if (valA < valB) return this.orderRule!.ascending ? -1 : 1;
        if (valA > valB) return this.orderRule!.ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply Limit
    if (this.limitVal && Array.isArray(resultData)) {
      resultData = resultData.slice(0, this.limitVal);
    }

    // Handle .single()
    if (this.singleResult) {
      if (Array.isArray(resultData) && resultData.length > 0) resultData = resultData[0];
      else if (Array.isArray(resultData) && resultData.length === 0) return { data: null, error: { message: 'No rows found', code: 'PGRST116' } };
    }

    return { data: resultData, error: null };
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
      signUp: async ({ email, password, options }: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          const users = JSON.parse(localStorage.getItem('gauf_mock_users') || '[]');
          if (users.find((u: any) => u.email === email)) {
            return { data: { user: null, session: null }, error: { message: "User already registered" } };
          }

          const newUser = {
            id: crypto.randomUUID(),
            email,
            password, // In a real app never store passwords plainly, but this is a local mock
            user_metadata: options?.data || {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          };

          users.push(newUser);
          localStorage.setItem('gauf_mock_users', JSON.stringify(users));

          // Auto-login on signup for mock convenience, or mimic Supabase requiring email confirmation (optional)
          // For now, let's return the user but NO session if we want to simulate "check email"
          // Or return session to allow immediate access. Login.tsx handles "check email" if session is missing.
          // Let's mimic auto-confirm for mock speed:
          const session = { access_token: 'mock-token-' + newUser.id, user: newUser };
          localStorage.setItem('gauf_auth_session', JSON.stringify(session));

          return { data: { user: newUser, session }, error: null };
        } catch (e: any) {
          return { data: { user: null, session: null }, error: { message: e.message } };
        }
      },
      signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = JSON.parse(localStorage.getItem('gauf_mock_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (!user) {
          return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } };
        }

        const mockSession = { user: user, access_token: 'mock-token-' + user.id };
        localStorage.setItem('gauf_auth_session', JSON.stringify(mockSession));
        return { data: { user, session: mockSession }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem('gauf_auth_session');
        return { error: null };
      },
    },
    from: (table: string) => {
      return new MockQueryBuilder(table);
    }
  };
};

const client = (supabaseUrl && supabaseUrl.trim() !== '' && supabaseAnonKey && supabaseAnonKey.trim() !== '')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createMockSupabase() as any);

export const supabase = client;
