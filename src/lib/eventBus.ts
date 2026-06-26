import type { Character, DiceRoll } from "./types";

export type AppEvent =
  | { type: "character"; character: Character }
  | { type: "character-deleted"; id: string }
  | { type: "roll"; roll: DiceRoll }
  | { type: "rolls-cleared"; characterId: string | null };

type Subscriber = (e: AppEvent) => void;

// O bus é um singleton process-wide. Para múltiplos processos (cluster, multiple
// VPS instances) seria preciso um broker (Redis pub/sub). Pra mesa pequena com
// um Node rodando, EventEmitter in-memory é suficiente.
class EventBus {
  private subscribers = new Set<Subscriber>();

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  publish(e: AppEvent) {
    for (const fn of this.subscribers) {
      try {
        fn(e);
      } catch {
        // ignore
      }
    }
  }
}

const globalKey = "__app_dnd_bus__";
type BusGlobal = typeof globalThis & { [globalKey]?: EventBus };
const g = globalThis as BusGlobal;
if (!g[globalKey]) g[globalKey] = new EventBus();
export const eventBus = g[globalKey]!;
