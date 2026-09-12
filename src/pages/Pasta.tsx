import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, KeyRound, LockKeyhole, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { matchesSearch } from "@/lib/search";
import type { Folder } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CharacterCard } from "@/components/CharacterCard";
import { FolderAvatar } from "@/components/FolderAvatar";
import { FolderForm } from "@/components/FolderForm";
import { RealtimeBadge } from "@/components/RealtimeBadge";
import { SearchInput } from "@/components/SearchInput";

type Status = "loading" | "ready" | "locked" | "missing" | "error";

export default function Pasta() {
  const { folderId = "" } = useParams<{ folderId: string }>();
  const enterFolder = useStore((s) => s.enterFolder);
  const folder = useStore((s) => s.folders[folderId]);
  const opened = useStore((s) => s.openedFolders[folderId]);
  const [status, setStatus] = useState<Status>("loading");

  // Sempre reabre ao entrar: atualiza a lista e passa a acompanhar a mesa desta pasta.
  // Senha guardada, chave mestra ou pasta sem senha entram direto; senão, pede a senha.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    void enterFolder(folderId).then((result) => {
      if (cancelled) return;
      setStatus(result === "ok" ? "ready" : result === "bad_pin" ? "locked" : result === "not_found" ? "missing" : "error");
    });
    return () => {
      cancelled = true;
    };
  }, [folderId, enterFolder]);

  if (folder && opened && status !== "locked" && status !== "missing") {
    return <FolderView folder={folder} canCreate={opened.canCreate} />;
  }
  if (status === "locked") {
    return <FolderGate folderId={folderId} folder={folder} onOpen={() => setStatus("ready")} />;
  }
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        <ArrowLeft className="h-3 w-3" /> Fichas DnD
      </Link>
      <p className="mt-6 text-zinc-500">
        {status === "loading"
          ? "Carregando…"
          : status === "error"
            ? "Sem conexão com o servidor. Tente de novo em instantes."
            : "Pasta não encontrada (talvez tenha sido apagada)."}
      </p>
    </main>
  );
}

function FolderGate({ folderId, folder, onOpen }: { folderId: string; folder?: Folder; onOpen: () => void }) {
  const enterFolder = useStore((s) => s.enterFolder);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        <ArrowLeft className="h-3 w-3" /> Fichas DnD
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>
            <LockKeyhole className="mr-1 inline h-3.5 w-3.5" /> Pasta protegida
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            {folder && <FolderAvatar folder={folder} size={56} />}
            <h1 className="min-w-0 break-words font-mono text-2xl font-bold">{folder?.name ?? folderId}</h1>
          </div>
          <p className="text-sm text-zinc-500">Digite a senha da pasta para ver e criar fichas.</p>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              const result = await enterFolder(folderId, pin);
              setBusy(false);
              if (result === "ok") onOpen();
              else
                setError(
                  result === "bad_pin"
                    ? "Senha inválida."
                    : result === "not_found"
                      ? "Pasta não encontrada."
                      : "Sem conexão com o servidor.",
                );
            }}
          >
            <Input
              autoFocus
              type="password"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                setError(null);
              }}
              placeholder="Senha da pasta"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || !pin.trim()}>
              {busy ? "verificando…" : "entrar na pasta"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}

function FolderView({ folder, canCreate }: { folder: Folder; canCreate: boolean }) {
  const navigate = useNavigate();
  const characters = useStore(useShallow((s) => Object.values(s.characters).filter((c) => c.folderId === folder.id)));
  const isMaster = useStore((s) => !!s.masterPin);
  const hasSavedPin = useStore((s) => !!s.folderPins[folder.id]);
  const leaveFolder = useStore((s) => s.leaveFolder);
  const deleteFolder = useStore((s) => s.deleteFolder);
  const pushToast = useStore((s) => s.pushToast);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const count = characters.length;
  const visible = characters
    .filter((c) => matchesSearch(query, c.characterName, c.playerName))
    .sort((a, b) => a.characterName.localeCompare(b.characterName, "pt-BR"));

  const onDeleteClick = () => {
    if (count > 0) {
      pushToast({
        title: "A pasta ainda tem fichas",
        description: `Apague ${count === 1 ? "a ficha" : `as ${count} fichas`} dela antes de apagar a pasta.`,
        tone: "danger",
      });
      return;
    }
    setConfirmDelete(true);
  };

  const onConfirmDelete = async () => {
    setDeleting(true);
    const ok = await deleteFolder(folder.id);
    setDeleting(false);
    setConfirmDelete(false);
    if (!ok) return; // a store já mostrou o motivo
    pushToast({ title: `Pasta ${folder.name} apagada`, tone: "success" });
    navigate("/");
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3 w-3" /> Fichas DnD
          </Button>
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {isMaster && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing((open) => !open)}>
                <Pencil className="h-3 w-3" /> Editar pasta
              </Button>
              <Button variant="ghost" size="sm" onClick={onDeleteClick}>
                <Trash2 className="h-3 w-3" /> Apagar pasta
              </Button>
            </>
          )}
          {hasSavedPin && (
            <Button
              variant="ghost"
              size="sm"
              title="Esquecer a senha desta pasta neste aparelho"
              onClick={() => {
                leaveFolder(folder.id);
                navigate("/");
              }}
            >
              <LogOut className="h-3 w-3" /> sair da pasta
            </Button>
          )}
        </div>
      </div>

      {/* No celular o botão desce para a linha de baixo: dividir a linha espremia o título e quebrava palavra no meio. */}
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <FolderAvatar folder={folder} size={72} />
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-mono text-2xl font-bold tracking-tight sm:text-3xl">{folder.name}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {count === 1 ? "1 ficha" : `${count} fichas`}
            {folder.protected ? "" : " · pasta sem senha"}
          </p>
          <RealtimeBadge className="mt-2" />
        </div>
        {canCreate && (
          <Link
            to={`/pasta/${folder.id}/criar-ficha`}
            className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Criar ficha
          </Link>
        )}
      </header>

      {editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Editar pasta</CardTitle>
          </CardHeader>
          <CardBody>
            <FolderForm folder={folder} onDone={() => setEditing(false)} />
          </CardBody>
        </Card>
      )}

      {count > 0 && (
        <div className="mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar fichas…" label="Pesquisar fichas pelo nome" />
        </div>
      )}

      {/* grid-cols-1 = minmax(0, 1fr): nome longo não alarga a coluna no celular */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* O hub mora na pasta como se fosse uma ficha, mas só abre com a chave mestra. */}
        <MasterHubCard folderId={folder.id} locked={!isMaster} />
        {visible.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </section>

      {count === 0 && (
        <p className="text-sm text-zinc-500">
          Nenhuma ficha nesta pasta ainda.{canCreate ? " Use “Criar ficha” para começar." : ""}
        </p>
      )}
      {count > 0 && visible.length === 0 && <p className="text-sm text-zinc-500">Nenhuma ficha com “{query.trim()}”.</p>}

      <ConfirmDialog
        open={confirmDelete}
        title={`Apagar a pasta ${folder.name}?`}
        description="A pasta está vazia. Ela some da página inicial para todos."
        confirmLabel="Apagar pasta"
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void onConfirmDelete()}
      />
    </main>
  );
}

/** Atalho para o Hub do Mestre desta pasta. Fica junto das fichas, mas pede a chave mestra. */
function MasterHubCard({ folderId, locked }: { folderId: string; locked: boolean }) {
  return (
    <Link to={`/pasta/${folderId}/hub`} className="block">
      <Card
        className="h-full border-dashed transition hover:scale-[1.01] hover:shadow-md"
        style={{ borderTopColor: "#d97706", borderTopWidth: 4 }}
      >
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Mestre</div>
              <div className="break-words font-mono text-xl font-semibold">Hub do Mestre</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Vida, CA, iniciativa, espaços de magia e recursos de toda a mesa — e as criaturas da cena.
          </div>
          <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-zinc-200">
              {locked ? "Chave mestra necessária" : "Chave mestra liberada neste aparelho"}
            </strong>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
