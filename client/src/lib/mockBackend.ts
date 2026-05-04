import { getQueryFn } from "./queryClient";

// A generic mock backend that uses localStorage
const originalFetch = window.fetch;

class LocalDB {
  private getStore(key: string): any[] {
    const data = localStorage.getItem(`db_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private setStore(key: string, data: any[]) {
    localStorage.setItem(`db_${key}`, JSON.stringify(data));
  }

  public get(key: string) {
    return this.getStore(key);
  }
  
  public getById(key: string, id: number | string) {
    return this.getStore(key).find(item => String(item.id) === String(id));
  }

  public insert(key: string, item: any) {
    const store = this.getStore(key);
    const newId = store.length > 0 ? Math.max(...store.map(i => i.id || 0)) + 1 : 1;
    const newItem = { id: newId, ...item };
    store.push(newItem);
    this.setStore(key, store);
    return newItem;
  }

  public update(key: string, id: number | string, patch: any) {
    const store = this.getStore(key);
    const index = store.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;
    store[index] = { ...store[index], ...patch };
    this.setStore(key, store);
    return store[index];
  }

  public remove(key: string, id: number | string) {
    const store = this.getStore(key);
    const filtered = store.filter(item => String(item.id) !== String(id));
    this.setStore(key, filtered);
    return true;
  }
}

const db = new LocalDB();

// Initialize some default data if empty
if (db.get('goals').length === 0) {
  db.insert('goals', { name: "Revenue Target", current: 50000, target: 200000, unit: "$", color: "primary", deadline: "2026-12-31" });
}
if (db.get('metrics').length === 0) {
  db.insert('metrics', { name: "ARR", value: 50000, category: "revenue", target: 200000, unit: "$", icon: "DollarSign" });
}
if (db.get('prospects').length === 0) {
  db.insert('prospects', { companyName: "Acme Corp", contactName: "John Doe", value: 15000, stage: "lead" });
}

window.fetch = async (...args) => {
  const requestInfo = args[0];
  const urlString = typeof requestInfo === 'string' ? requestInfo : (requestInfo as Request).url;
  
  // Only intercept /api requests
  if (!urlString.startsWith('/api') && !urlString.startsWith('http://localhost') && !urlString.includes('/api/')) {
    return originalFetch(...args);
  }

  const urlObj = new URL(urlString, window.location.origin);
  const path = urlObj.pathname;
  const parts = path.split('/').filter(Boolean); // e.g. ["api", "goals", "1"]
  const resource = parts[1]; // e.g. "goals"
  const id = parts[2]; // e.g. "1" (optional)

  const method = args[1]?.method || 'GET';
  const body = args[1]?.body ? JSON.parse(args[1].body as string) : undefined;

  console.log(`[MockBackend] ${method} ${path}`, body);

  const mockResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    // Basic REST API Mocks
    if (method === 'GET') {
      if (id) {
        const item = db.getById(resource, id);
        return mockResponse(item || { error: "Not found" }, item ? 200 : 404);
      } else {
        // Special aggregates or endpoints
        if (path === '/api/gamification/profile') return mockResponse({ level: 1, xp: 0, nextLevelXp: 100, rank: "Novice" });
        if (path === '/api/hubspot/deals/summary') return mockResponse({ totalDeals: 0, value: 0 });
        if (path === '/api/startup-metrics') return mockResponse({ mrr: 0, activeUsers: 0, churn: 0 });
        
        return mockResponse(db.get(resource));
      }
    }
    
    if (method === 'POST') {
      if (path === '/api/reset-data') {
        localStorage.clear();
        return mockResponse({ success: true });
      }
      if (path.includes('/gamification/')) {
        return mockResponse({ success: true });
      }
      const newItem = db.insert(resource, body);
      return mockResponse(newItem, 201);
    }
    
    if (method === 'PATCH' || method === 'PUT') {
      if (id) {
        const updatedItem = db.update(resource, id, body);
        return mockResponse(updatedItem || { error: "Not found" }, updatedItem ? 200 : 404);
      }
      return mockResponse({ error: "No ID provided" }, 400);
    }
    
    if (method === 'DELETE') {
      if (id) {
        db.remove(resource, id);
        return mockResponse({ success: true });
      }
      return mockResponse({ error: "No ID provided" }, 400);
    }
  } catch (error) {
    console.error(`[MockBackend] Error handling ${method} ${path}`, error);
    return mockResponse({ error: String(error) }, 500);
  }

  // Fallback
  return mockResponse({ message: "Mock endpoint not implemented yet", path }, 404);
};

export {};
