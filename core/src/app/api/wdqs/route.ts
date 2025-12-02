import { NextRequest, NextResponse } from "next/server";

// Server-side shared cache (shared across all users)
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; 

const requestQueue: Array<{
  sparql: string;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}> = [];
let isProcessing = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; 

let rateLimitUntil = 0;

async function makeWDQSRequest(sparql: string): Promise<any> {
  const now = Date.now();
  
  if (rateLimitUntil > now) {
    const waitTime = rateLimitUntil - now;
    console.warn(`[WDQS Server] Rate limited, waiting ${Math.ceil(waitTime / 1000)}s`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
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
    
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitTime = retryAfter 
        ? parseInt(retryAfter) * 1000 
        : 60000; 
      
      rateLimitUntil = Date.now() + waitTime;
      throw new Error(`WDQS rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    if (!res.ok) {
      throw new Error(`WDQS error ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Query timeout');
    }
    throw error;
  }
}

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) {
    return;
  }
  
  isProcessing = true;
  const { sparql, resolve, reject } = requestQueue.shift()!;
  
  try {
    const data = await makeWDQSRequest(sparql);
    
    queryCache.set(sparql, { data, timestamp: Date.now() });
    
    resolve(data);
  } catch (error) {
    reject(error instanceof Error ? error : new Error(String(error)));
  } finally {
    isProcessing = false;
    if (requestQueue.length > 0) {
      setTimeout(() => processQueue(), MIN_REQUEST_INTERVAL);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sparql } = await req.json();
    
    if (!sparql || typeof sparql !== 'string') {
      return NextResponse.json(
        { error: "Missing or invalid sparql query" },
        { status: 400 }
      );
    }
    
    const cached = queryCache.get(sparql);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }
    
    return new Promise((resolve) => {
      requestQueue.push({
        sparql,
        resolve: (data) => {
          resolve(NextResponse.json(data));
        },
        reject: (error) => {
          const errorMessage = error.message || "Unknown error";
          const isRateLimit = errorMessage.includes("rate limit");
          resolve(
            NextResponse.json(
              { error: errorMessage },
              { status: isRateLimit ? 429 : 500 }
            )
          );
        },
      });
      
      processQueue();
    });
  } catch (error) {
    console.error("[WDQS API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isRateLimit = errorMessage.includes("rate limit");
    
    return NextResponse.json(
      { error: errorMessage },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}

