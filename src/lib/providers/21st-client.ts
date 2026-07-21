const API_BASE_URL = "https://relay.an.dev";

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | undefined>;
};

export type CreateSandboxPayload = {
  template?: string;
  metadata?: Record<string, unknown>;
};

function resolve21stApiKey() {
  return process.env.API_KEY_21ST || process.env.TWENTY_FIRST_DEV_API_KEY;
}

export function has21stApiKey() {
  return Boolean(resolve21stApiKey());
}

function get21stApiKey() {
  const apiKey = resolve21stApiKey();

  if (!apiKey) {
    throw new Error("API_KEY_21ST/TWENTY_FIRST_DEV_API_KEY nao configurada");
  }

  return apiKey;
}

function buildUrl(path: string, searchParams?: Record<string, string | undefined>) {
  const url = new URL(path, API_BASE_URL);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url;
}

export async function request21st<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(buildUrl(path, options.searchParams), {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${get21stApiKey()}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.message ||
      `21st API respondeu com status ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function create21stSandbox(payload: CreateSandboxPayload = {}) {
  return request21st("/v1/sandboxes", {
    method: "POST",
    body: payload,
  });
}

export async function get21stSandbox(sandboxId: string) {
  return request21st(`/v1/sandboxes/${sandboxId}`);
}

export async function delete21stSandbox(sandboxId: string) {
  return request21st(`/v1/sandboxes/${sandboxId}`, {
    method: "DELETE",
  });
}
