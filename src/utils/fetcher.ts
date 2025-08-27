/**
 * Fetcher utility for SWR data fetching
 * Provides a standardized way to fetch data with error handling
 */

interface FetchError extends Error {
  info?: unknown;
  status?: number;
}

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  console.log(`[Fetcher] Starting fetch for: ${url}`);
  
  try {
    const res = await fetch(url);
    console.log(`[Fetcher] Response received:`, {
      url,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries())
    });
    
    if (!res.ok) {
      const error: FetchError = new Error('An error occurred while fetching the data.');
      // Attach extra info to the error object
      try {
        error.info = await res.json();
      } catch {
        error.info = 'Failed to parse error response';
      }
      error.status = res.status;
      console.error(`[Fetcher] Error response:`, error);
      throw error;
    }
    
    const data = await res.json() as T;
    console.log(`[Fetcher] Successfully parsed JSON for ${url}:`, {
      dataType: typeof data,
      isArray: Array.isArray(data),
      hasData: !!data,
      keys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
    });
    
    return data;
  } catch (error) {
    console.error(`[Fetcher] Fetch failed for ${url}:`, error);
    throw error;
  }
};

/**
 * Fetcher with custom headers
 */
export const fetcherWithHeaders = (headers: Record<string, string>) => {
  return async <T = unknown>(url: string): Promise<T> => {
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      const error: FetchError = new Error('An error occurred while fetching the data.');
      try {
        error.info = await res.json();
      } catch {
        error.info = 'Failed to parse error response';
      }
      error.status = res.status;
      throw error;
    }
    
    return res.json() as Promise<T>;
  };
};

export default fetcher;