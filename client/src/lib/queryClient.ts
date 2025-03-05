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
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

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
        console.error(error.message);
      }
      throw error;
    }
  };

// Configure the Query Client with enhanced error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Only retry network errors, not API errors
        if (error instanceof Error) {
          const isNetworkError = !error.message.includes("API Error") && 
                                 error.message.includes("network");
          return failureCount < 2 && isNetworkError;
        }
        return false;
      },
      onError: (error) => {
        // Log errors in a user-friendly way
        console.log("Data fetch error:", error instanceof Error ? error.message : "Unknown error");
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // Log mutation errors in a user-friendly way
        console.log("Data update error:", error instanceof Error ? error.message : "Unknown error");
      },
    },
  },
});
