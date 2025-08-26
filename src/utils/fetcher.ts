/**
 * Fetcher utility for SWR data fetching
 * Provides a standardized way to fetch data with error handling
 */

interface FetchError extends Error {
  info?: unknown;
  status?: number;
}

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error: FetchError = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object
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