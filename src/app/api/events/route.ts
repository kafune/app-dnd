import { eventBus } from "@/lib/eventBus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let keepalive: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (data: unknown, event?: string) => {
        try {
          const payload = `${event ? `event: ${event}\n` : ""}data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // controller fechado
        }
      };

      send({ ok: true }, "hello");

      unsubscribe = eventBus.subscribe((e) => send(e, e.type));

      keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          // ignore
        }
      }, 25_000);

      // Fechamento limpo se o cliente abortar a requisição
      req.signal.addEventListener("abort", () => {
        unsubscribe?.();
        if (keepalive) clearInterval(keepalive);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
    cancel() {
      unsubscribe?.();
      if (keepalive) clearInterval(keepalive);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // nginx: desabilita buffering
    },
  });
}
