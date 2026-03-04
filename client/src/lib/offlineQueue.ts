const QUEUE_KEY = "vinogora_offline_queue";

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  body?: unknown;
  timestamp: number;
}

function getQueue(): QueuedRequest[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedRequest[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueRequest(method: string, url: string, body?: unknown) {
  const queue = getQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    method,
    url,
    body,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export async function flushQueue(): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  let flushed = 0;
  const remaining: QueuedRequest[] = [];

  for (const req of queue) {
    try {
      const res = await fetch(req.url, {
        method: req.method,
        headers: req.body ? { "Content-Type": "application/json" } : {},
        body: req.body ? JSON.stringify(req.body) : undefined,
      });
      if (res.ok || res.status === 409) {
        flushed++;
      } else {
        remaining.push(req);
      }
    } catch {
      remaining.push(req);
    }
  }

  saveQueue(remaining);
  return flushed;
}

export function queueLength(): number {
  return getQueue().length;
}
