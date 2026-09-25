import { useCallback, useEffect, useState } from "react";
import { BookmarkPlus, Map as MapIcon, Play, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { api, errorMessage } from "@/lib/api";
import { presetBackgroundUrl, type MapPreset } from "@/lib/map";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Mapas prontos do Hub do Mestre: ele monta a cena (fundo, grade, terreno, monstros)
 * antes da sessão, salva com um nome e, na hora, põe na mesa com um clique. Depois
 * de usado, apaga.
 */
export function MapPresets({ folderId }: { folderId: string }) {
  const masterPin = useStore((s) => s.masterPin);
  const applyMapPreset = useStore((s) => s.applyMapPreset);
  const pushToast = useStore((s) => s.pushToast);

  const [presets, setPresets] = useState<MapPreset[] | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "usar" | "apagar" | "substituir"; preset: MapPreset } | null>(null);

  const fail = useCallback(
    (title: string, e: unknown) => pushToast({ title, description: errorMessage(e), tone: "danger" }),
    [pushToast],
  );

  useEffect(() => {
    if (!masterPin) return;
    let active = true;
    api
      .listMapPresets(folderId, masterPin)
      .then(({ presets }) => active && setPresets(presets))
      .catch((e) => {
        if (!active) return;
        setPresets([]);
        fail("Não deu para carregar os mapas prontos", e);
      });
    return () => {
      active = false;
    };
  }, [folderId, masterPin, fail]);

  if (!masterPin) return null;

  const save = async () => {
    const clean = name.trim();
    if (!clean || busy) return;
    setBusy(true);
    try {
      const { presets } = await api.saveMapPreset(folderId, clean, masterPin);
      setPresets(presets);
      setName("");
      pushToast({ title: `Mapa "${clean}" salvo`, description: "Use quando a cena chegar.", tone: "success" });
    } catch (e) {
      fail("Não deu para salvar o mapa", e);
    } finally {
      setBusy(false);
    }
  };

  const onSave = () => {
    const clean = name.trim().toLowerCase();
    const existing = presets?.find((p) => p.name.toLowerCase() === clean);
    if (existing) setConfirm({ kind: "substituir", preset: existing });
    else void save();
  };

  const use = async (preset: MapPreset) => {
    setBusy(true);
    try {
      if (await applyMapPreset(folderId, preset.id)) {
        pushToast({ title: `"${preset.name}" está na mesa`, tone: "success" });
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (preset: MapPreset) => {
    setBusy(true);
    try {
      const { presets } = await api.deleteMapPreset(folderId, preset.id, masterPin);
      setPresets(presets);
    } catch (e) {
      fail("Não deu para apagar o mapa", e);
    } finally {
      setBusy(false);
    }
  };

  const summary = (preset: MapPreset) =>
    [
      preset.background ? "com fundo" : "sem fundo",
      preset.tokens ? `${preset.tokens} token${preset.tokens > 1 ? "s" : ""}` : null,
      preset.tiles ? `${preset.tiles} marca${preset.tiles > 1 ? "s" : ""}` : null,
      preset.shapes ? `${preset.shapes} forma${preset.shapes > 1 ? "s" : ""}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="space-y-2 border-b border-zinc-100 px-3 py-2 text-xs dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold uppercase tracking-wide text-zinc-500">Mapas prontos</span>
        <span className="text-zinc-500">Monte a cena antes da sessão e salve; na hora, é só usar.</span>
      </div>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome do mapa (ex.: Caverna do dragão)"
          maxLength={80}
          className="h-8 min-w-0 flex-1 text-xs sm:max-w-xs"
          aria-label="Nome do mapa pronto"
        />
        <Button type="submit" size="sm" variant="outline" disabled={busy || !name.trim()} title="Guarda o fundo, a grade, as marcas, as formas e os tokens do mapa atual">
          <BookmarkPlus className="h-3 w-3" /> Salvar preset
        </Button>
      </form>

      {presets === null ? (
        <p className="text-zinc-500">Carregando…</p>
      ) : presets.length === 0 ? (
        <p className="text-zinc-500">Nenhum mapa pronto ainda. As áreas das magias dos jogadores não entram no preset.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => {
            const thumb = presetBackgroundUrl(folderId, preset);
            return (
              <li key={preset.id} className="flex items-center gap-2 rounded-md border border-zinc-200 p-1.5 dark:border-zinc-800">
                <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                  {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" /> : <MapIcon className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-zinc-800 dark:text-zinc-100">{preset.name}</span>
                  <span className="block truncate text-[11px] text-zinc-500">
                    {new Date(preset.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} · {summary(preset)}
                  </span>
                </span>
                <Button size="sm" variant="success" disabled={busy} onClick={() => setConfirm({ kind: "usar", preset })} title="Põe este mapa na mesa">
                  <Play className="h-3 w-3" /> Usar
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={busy}
                  aria-label={`Apagar o mapa pronto ${preset.name}`}
                  title="Apagar (o mapa que está na mesa não muda)"
                  onClick={() => setConfirm({ kind: "apagar", preset })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.kind === "usar"
            ? `Usar "${confirm.preset.name}"?`
            : confirm?.kind === "apagar"
              ? `Apagar "${confirm.preset.name}"?`
              : `Substituir "${confirm?.preset.name ?? ""}"?`
        }
        description={
          confirm?.kind === "usar"
            ? "O mapa da mesa (fundo, grade, marcas, formas e tokens) é trocado por este. Salve o atual antes se quiser guardá-lo."
            : confirm?.kind === "apagar"
              ? "O mapa pronto some da lista. O que está na mesa agora não muda."
              : "Já existe um mapa pronto com esse nome. Ele passa a ser o mapa atual da mesa."
        }
        confirmLabel={confirm?.kind === "usar" ? "Usar" : confirm?.kind === "apagar" ? "Apagar" : "Substituir"}
        tone={confirm?.kind === "apagar" ? "danger" : "success"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const current = confirm;
          setConfirm(null);
          if (!current) return;
          if (current.kind === "usar") void use(current.preset);
          else if (current.kind === "apagar") void remove(current.preset);
          else void save();
        }}
      />
    </div>
  );
}
