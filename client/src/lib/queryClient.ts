import { QueryClient } from "@tanstack/react-query";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest<TData = any>(
  method: Method,
  endpoint: string,
  bodyData?: any
): Promise<TData> {
  try {
    // Make sure endpoint starts with slash
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const res = await fetch(url, {
      method,
      headers: bodyData ? { "Content-Type": "application/json" } : {},
      body: bodyData ? JSON.stringify(bodyData) : undefined,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "An error occurred" }));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    console.error("API Request Error:", error);
    throw new Error(error.message || "Failed to complete request");
  }
}

export default queryClient;