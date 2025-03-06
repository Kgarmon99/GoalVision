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
export const getQueryFn: <TData = unknown>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<TData, unknown[]> =
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
        return ([] as unknown) as TData;
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as unknown as TData;
      }

      await throwIfResNotOk(res);
      
      try {
        return await res.json() as TData;
      } catch (jsonError) {
        // Handle empty responses or invalid JSON
        if ((jsonError as Error).message.includes("Unexpected end of JSON input")) {
          return null as unknown as TData; // Return null for empty responses
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
      return ([] as unknown) as TData;
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
      gcTime: 30 * 60 * 1000,      // Keep unused data in cache for 30 minutes
      retry: (failureCount, error) => {
        // Only retry network errors, not API errors
        if (error instanceof Error) {
          const isNetworkError = !error.message.includes("API Error") && 
                                 (error.message.includes("network") || 
                                  error.message.includes("Failed to fetch"));
          return failureCount < 2 && isNetworkError;
        }
        return false;
      },
      // Performance optimizations for React Query v5
      placeholderData: (previousData: unknown) => previousData, // Similar to keepPreviousData
      refetchOnMount: true,        // Fetch fresh data when component mounts if stale
    },
    mutations: {
      retry: false,
      // Use optimistic updates for better UX
      onError: (err) => {
        console.error('Mutation error:', err);
      }
    },
  },
});
