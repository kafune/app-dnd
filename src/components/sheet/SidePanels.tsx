import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { X } from "lucide-react";
import { useMediaQuery } from "@/lib/useMediaQuery";

export type SidePanel = {
  key: string;
  /** Rótulo curto: cabe embaixo do ícone na barra do celular. */
  label: string;
  icon: ComponentType<{ className?: string }>;
  content: ReactNode;
};

/** A partir daqui a ficha tem largura para duas colunas (Tailwind `lg`). */
const DESKTOP = "(min-width: 1024px)";

/**
 * A coluna de consulta da ficha (lembretes, dados, ações, mesa, log).
 *
 * No computador e no tablet ela é a coluna da direita, com rolagem própria: antes
 * era `sticky` sem `overflow`, então o que passava da altura da tela só aparecia
 * quando a página inteira chegava ao fim — para ler a Mesa você tinha de rolar a
 * ficha toda, sendo que a Mesa estava ali do lado.
 *
 * No celular virar uma pilha embaixo da ficha significava rolar tudo para rolar um
 * d20. Então vira uma barra fixa embaixo: um toque abre a gaveta do painel, outro
 * fecha. Deitado, a gaveta entra pela direita em vez de subir (ver `.dock-drawer`
 * em `globals.css`), porque 85% de uma tela deitada não é altura nenhuma.
 *
 * Os dois caminhos montam o mesmo painel uma vez só — daí a media query em JS, e
 * não duas árvores escondidas com `hidden`/`lg:hidden`.
 */
export function SidePanels({ panels }: { panels: SidePanel[] }) {
  const desktop = useMediaQuery(DESKTOP);
  if (desktop) {
    return (
      <aside className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pb-1 lg:pr-1">
        {panels.map((panel) => (
          <div key={panel.key}>{panel.content}</div>
        ))}
      </aside>
    );
  }
  return <PanelDock panels={panels} />;
}

function PanelDock({ panels }: { panels: SidePanel[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const active = panels.find((panel) => panel.key === openKey) ?? null;

  // Gaveta aberta trava a rolagem da ficha atrás dela.
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenKey(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <>
      {active && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            aria-hidden="true"
            onClick={() => setOpenKey(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.label}
            className="dock-drawer z-40 border border-zinc-200 bg-[var(--background)] shadow-2xl dark:border-zinc-800"
          >
            {/* Só a alça e o X: o título vem do cabeçalho do próprio painel. */}
            <div className="relative flex shrink-0 items-center justify-center px-4 py-2">
              <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <button
                type="button"
                onClick={() => setOpenKey(null)}
                aria-label="Fechar painel"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">{active.content}</div>
          </div>
        </>
      )}

      <nav className="dock-bar z-50 border-t border-zinc-200 bg-[var(--background)]/95 backdrop-blur dark:border-zinc-800">
        {panels.map((panel) => {
          const isOpen = panel.key === openKey;
          return (
            <button
              key={panel.key}
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenKey(isOpen ? null : panel.key)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition ${
                isOpen
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <panel.icon className="h-5 w-5" />
              <span className="max-w-full truncate">{panel.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
