/**
 * Minimal typed ALLURE API client for a Vite/React frontend.
 * Pass a fresh Supabase access token for each request.
 */

export type AnalysisStatus = "awaiting_models" | "processing" | "completed" | "failed";
export type FindingDomain = "skin" | "hair" | "face";

export interface UploadResult {
  bucket: string;
  path: string;
  file_name: string;
  size_bytes: number;
  width: number;
  height: number;
  content_type: string;
  image_url: string | null;
}

export interface Finding {
  domain: FindingDomain;
  code: string;
  confidence: number;
  severity: "low" | "mild" | "moderate" | "high" | null;
  label?: string | null;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  actions: string[];
  ingredients_to_consider: string[];
  domain: FindingDomain;
  based_on: string;
}

export interface Analysis {
  id: string;
  status: AnalysisStatus;
  image_path: string;
  image_url: string | null;
  findings: Finding[];
  recommendations: Recommendation[];
  model_version: string | null;
  created_at: string | null;
  updated_at: string | null;
  message: string | null;
  disclaimer: string;
}

export interface ModelStatus {
  configured: boolean;
  ready: boolean;
  message: string;
}

export class AllureApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AllureApiError";
  }
}

export function createAllureApi(baseUrl: string, getAccessToken: () => Promise<string>) {
  const base = baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getAccessToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${base}/api/v1${path}`, { ...init, headers });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const message = body?.detail || body?.message || `ALLURE API request failed (${response.status})`;
      throw new AllureApiError(message, response.status);
    }
    return body as T;
  }

  return {
    getModelStatus: () => request<ModelStatus>("/models/status"),

    async uploadImage(file: File): Promise<UploadResult> {
      const form = new FormData();
      form.append("file", file);
      const result = await request<{ success: boolean; message: string; data: UploadResult }>("/upload", {
        method: "POST",
        body: form,
      });
      return result.data;
    },

    createAnalysis: (imagePath: string) =>
      request<Analysis>("/analyses", {
        method: "POST",
        body: JSON.stringify({ image_path: imagePath, consent_to_analysis: true }),
      }),

    getHistory: (limit = 20) =>
      request<Array<{ id: string; status: AnalysisStatus; created_at: string; updated_at: string; model_version: string | null }>>(
        `/analyses?limit=${Math.min(Math.max(limit, 1), 100)}`,
      ),

    getAnalysis: (id: string) => request<Analysis>(`/analyses/${encodeURIComponent(id)}`),
    runAnalysis: (id: string) => request<Analysis>(`/analyses/${encodeURIComponent(id)}/run`, { method: "POST" }),
    deleteAnalysis: (id: string) => request<{ success: boolean; message: string }>(`/analyses/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
