// Server-side cache
const serverCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; 

async function queryWDQSDirect(sparql: string, timeoutMs: number = 10000): Promise<any> {
  const cached = serverCache.get(sparql);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const encodedQuery = encodeURIComponent(sparql);
    const res = await fetch(
      `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`,
      {
        method: "GET",
        headers: {
          Accept: "application/sparql-results+json",
          "User-Agent": "100-man-roster/1.0 (https://your-domain.com; contact@example.com)",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`WDQS error ${res.status}`);
    }
    
    const data = await res.json();
    
    serverCache.set(sparql, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Query timeout');
    }
    throw error;
  }
}

export async function queryWDQS(sparql: string, timeoutMs: number = 10000): Promise<any> {
  // Check if we're on the client-side or server-side
  if (typeof window !== 'undefined') {
    // Client-side: use API route to benefit from server-side caching and request queue
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs + 2000); // Add 2s buffer
      
      const res = await fetch('/api/wdqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sparql }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `WDQS API error ${res.status}`);
      }
      
      return res.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - Wikidata query took too long');
      }
      console.error('[WDQS] Client-side API call failed:', error);
      throw error;
    }
  } else {
    // Server-side: make direct call (used by API route and other server-side code)
    return queryWDQSDirect(sparql, timeoutMs);
  }
}
