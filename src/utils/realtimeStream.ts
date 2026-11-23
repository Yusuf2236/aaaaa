export interface StreamMessage {
  type: 'start' | 'output' | 'done' | 'error';
  text?: string;
  command?: string;
  exitCode?: number;
  error?: string;
}

export async function streamRealtimeCommand(
  endpoint: string,
  body: Record<string, any>,
  callbacks: {
    onStart?: (command: string) => void;
    onLine: (line: string) => void;
    onDone?: (exitCode: number) => void;
    onError?: (err: string) => void;
  }
) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify(body)
    });

    if (!res.body) {
      throw new Error('Streaming response body not supported');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const line = event.trim();
        if (line.startsWith('data: ')) {
          try {
            const data: StreamMessage = JSON.parse(line.slice(6));
            if (data.type === 'start' && data.command && callbacks.onStart) {
              callbacks.onStart(data.command);
            } else if (data.type === 'output' && data.text) {
              callbacks.onLine(data.text);
            } else if (data.type === 'done' && callbacks.onDone) {
              callbacks.onDone(data.exitCode ?? 0);
            } else if (data.type === 'error' && data.error && callbacks.onError) {
              callbacks.onError(data.error);
            }
          } catch {
            // ignore non-json
          }
        }
      }
    }
  } catch (err: any) {
    if (callbacks.onError) {
      callbacks.onError(err?.message || 'Serverga ulanishda xatolik yuz berdi');
    }
  }
}
