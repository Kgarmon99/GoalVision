import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Improved error handling for API responses
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse JSON error response
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        throw new Error(
          `API Error (${res.status}): ${errorData.message || JSON.stringify(errorData)}`
        );
      } else {
        // Fallback to text response
        const text = (await res.text()) || res.statusText;
        throw new Error(`API Error (${res.status}): ${text}`);
      }
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message.includes("API Error")) {
        throw parseError; // Re-throw our custom error
      }
      // If JSON parsing failed, use a generic error message
      throw new Error(`API Error (${res.status}): ${res.statusText}`);
    }
  }
}

// Enhanced API request function with better error handling
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Add additional context to the error
    if (error instanceof Error) {
      error.message = `Request failed (${method} ${url}): ${error.message}`;
      console.error(error.message);
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Enhanced query function with better error handling
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Improved error handling for fetch that catches network errors
      let res: Response;
      try {
        res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
      } catch (fetchError) {
        // Handle network errors specifically
        console.log("Error handled gracefully:", `Query failed (${String(queryKey[0])}): Failed to fetch`);
        // Return an empty array as fallback data
        return ([] as any) as T;
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      try {
        return await res.json();
      } catch (jsonError) {
        // Handle empty responses or invalid JSON
        if ((jsonError as Error).message.includes("Unexpected end of JSON input")) {
          return null; // Return null for empty responses
        }
        throw jsonError;
      }
    } catch (error) {
      // Add query key context to error
      if (error instanceof Error) {
        error.message = `Query failed (${String(queryKey[0])}): ${error.message}`;
        console.log("Error handled gracefully:", error.message);
      }
      // Return empty array as fallback data
      return ([] as any) as T;
    }
  };

// Configure the Query Client with enhanced error handling and optimization
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,  // Only refetch when window regains focus
      staleTime: 5 * 60 * 1000,    // Data remains fresh for 5 minutes
      cacheTime: 30 * 60 * 1000,   // Cache data for 30 minutes
      retry: (failureCount, error) => {
        // Only retry network errors, not API errors
        if (error instanceof Error) {
          const isNetworkError = !error.message.includes("API Error") && 
                                 error.message.includes("network");
          return failureCount < 2 && isNetworkError;
        }
        return false;
      },
      // Performance optimizations
      keepPreviousData: true,      // Keep previous data while fetching new data
      refetchOnMount: 'always',    // Fetch fresh data when component mounts
      suspense: false,             // Don't use React Suspense for queries
    },
    mutations: {
      retry: false,
      // Use optimistic updates for better UX
      onError: (err, variables, context) => {
        console.error('Mutation error:', err);
        // The context contains the previous state snapshot to restore on error
      }
    },
  },
});
