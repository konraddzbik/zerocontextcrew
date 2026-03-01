export interface ADKEvent {
  id: string;
  invocationId: string;
  author: string;
  timestamp: number;
  content: {
    role: string;
    parts: { text?: string; functionCall?: unknown; functionResponse?: unknown }[];
  };
  partial: boolean;
  actions: {
    stateDelta?: Record<string, unknown>;
    transferToAgent?: string;
    escalate?: boolean;
  };
}

export interface SSECallbacks {
  onEvent: (event: ADKEvent) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

/**
 * Connect to ADK's /run_sse endpoint via fetch + ReadableStream.
 * (We can't use EventSource because it only supports GET.)
 */
export async function connectSSE(
  baseUrl: string,
  body: {
    appName: string;
    userId: string;
    sessionId: string;
    newMessage: { role: string; parts: { text: string }[] };
    streaming?: boolean;
  },
  callbacks: SSECallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${baseUrl}/run_sse`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    callbacks.onError(
      err instanceof Error ? err : new Error('Failed to connect to story server'),
    );
    return;
  }

  if (!response.ok) {
    callbacks.onError(new Error(`Server error: ${response.status} ${response.statusText}`));
    return;
  }

  if (!response.body) {
    callbacks.onError(new Error('No response body'));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE format: lines starting with "data: " separated by \n\n
      const lines = buffer.split('\n');
      buffer = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // If this is the last line and doesn't end with \n, it's incomplete — buffer it
        if (i === lines.length - 1 && !buffer && line !== '') {
          buffer = line;
          continue;
        }

        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6).trim();
        if (!data) continue;

        if (data === '[DONE]') {
          callbacks.onDone();
          return;
        }

        try {
          const event: ADKEvent = JSON.parse(data);
          callbacks.onEvent(event);
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    // Stream ended without [DONE]
    callbacks.onDone();
  } catch (err) {
    if (signal?.aborted) return;
    callbacks.onError(
      err instanceof Error ? err : new Error('Stream read error'),
    );
  }
}
