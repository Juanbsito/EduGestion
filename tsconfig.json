
import { createClient } from '@supabase/supabase-js';
import { INITIAL_STUDENTS, INITIAL_CAREERS, INITIAL_SUBJECTS, INITIAL_PAYMENTS, INITIAL_ACADEMIC_RECORDS } from './constants';

const supabaseUrl = (window as any)._env_?.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (window as any)._env_?.SUPABASE_ANON_KEY || 'your-anon-key';

const isMockMode = supabaseUrl.includes('your-project') || supabaseAnonKey === 'your-anon-key';

const getStorage = (key: string, initial: any) => {
  const stored = localStorage.getItem(`edumanager_${key}`);
  if (!stored) {
    localStorage.setItem(`edumanager_${key}`, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const saveStorage = (key: string, data: any) => {
  localStorage.setItem(`edumanager_${key}`, JSON.stringify(data));
};

let mockUser: any = JSON.parse(localStorage.getItem('edumanager_user') || 'null');
let listeners: any[] = [];

const createMockSupabase = () => {
  const getTableData = (table: string) => {
    let initial: any[] = [];
    if (table === 'students') initial = INITIAL_STUDENTS;
    else if (table === 'careers') initial = INITIAL_CAREERS;
    else if (table === 'subjects') initial = INITIAL_SUBJECTS;
    else if (table === 'payments') initial = INITIAL_PAYMENTS;
    else if (table === 'academic_records') initial = INITIAL_ACADEMIC_RECORDS;
    
    return getStorage(table, initial);
  };

  const chain = (table: string, filters: any = {}) => {
    const obj = {
      select: () => obj,
      eq: (c: string, v: any) => { filters[c] = v; return obj; },
      range: (f: number, t: number) => { obj._range = [f, t]; return obj; },
      order: () => obj,
      single: async () => {
        if (table === 'school_stats') {
          const students = getTableData('students');
          return { data: { total_students: students.length, active_students: students.filter((s:any) => s.status === 'ACTIVE').length, total_revenue_month: 1240000, pending_payments_count: 8 }, error: null };
        }
        
        const db = getTableData(table);
        const filtered = db.filter((i: any) => Object.entries(filters).every(([k, v]) => !v || i[k] === v));
        
        if (table === 'profiles' && filtered.length === 0 && filters.id) {
           return { data: { id: filters.id, school_id: 'school-1', role: mockUser?.email?.includes('superadmin') ? 'superadmin' : 'school_admin', full_name: 'Usuario Demo' }, error: null };
        }
        
        return { data: filtered[0] || null, error: null };
      },
      then: (onfulfilled: any) => {
        const db = getTableData(table);
        const filtered = db.filter((i: any) => Object.entries(filters).every(([k, v]) => !v || i[k] === v));
        const result = obj._range ? filtered.slice(obj._range[0], obj._range[1] + 1) : filtered;
        
        return Promise.resolve(onfulfilled({
          data: result,
          count: filtered.length,
          error: null
        }));
      },
      _range: null as any
    };
    return obj;
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: mockUser ? { user: mockUser } : null }, error: null }),
      onAuthStateChange: (cb: any) => { 
        listeners.push(cb); 
        cb('INITIAL', mockUser ? { user: mockUser } : null); 
        return { data: { subscription: { unsubscribe: () => {} } } }; 
      },
      signInWithOtp: async ({ email }: any) => { 
        mockUser = { id: 'u1', email }; 
        localStorage.setItem('edumanager_user', JSON.stringify(mockUser));
        listeners.forEach(l => l('SIGNED_IN', { user: mockUser })); 
        return { error: null }; 
      },
      signOut: async () => { 
        mockUser = null; 
        localStorage.removeItem('edumanager_user');
        listeners.forEach(l => l('SIGNED_OUT', null)); 
        return { error: null }; 
      }
    },
    from: (table: string) => ({
      ...chain(table),
      insert: async (data: any) => {
        const db = getTableData(table);
        const payload = Array.isArray(data) ? data : [data];
        const newItems = payload.map(item => ({ 
          ...item, 
          id: item.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          created_at: new Date().toISOString()
        }));
        saveStorage(table, [...newItems, ...db]);
        return { data: newItems, error: null };
      },
      update: (data: any) => ({
        eq: async (col: string, val: any) => {
          const db = getTableData(table);
          const updated = db.map((item: any) => item[col] === val ? { ...item, ...data } : item);
          saveStorage(table, updated);
          return { data: updated.filter((i: any) => i[col] === val), error: null };
        }
      }),
      delete: () => ({
        eq: async (c: string, v: any) => {
          const db = getTableData(table);
          const filtered = db.filter((s: any) => s[c] !== v);
          saveStorage(table, filtered);
          return { error: null };
        }
      })
    })
  } as any;
};

export const supabase = isMockMode ? createMockSupabase() : createClient(supabaseUrl, supabaseAnonKey);
