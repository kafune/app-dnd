import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Crown, FolderPlus, Lock } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { matchesSearch } from "@/lib/search";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { FolderAvatar } from "@/components/FolderAvatar";
import { FolderForm } from "@/components/FolderForm";
import { MasterKeyForm } from "@/components/MasterKeyForm";
import { RealtimeBadge } from "@/components/RealtimeBadge";
import { SearchInput } from "@/components/SearchInput";

export default function Home() {
  const navigate = useNavigate();
  const folders = useStore(useShallow((s) => Object.values(s.folders)));
  const foldersLoaded = useStore((s) => s.foldersLoaded);
  const isMaster = useStore((s) => !!s.masterPin);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const visible = folders
    .filter((folder) => matchesSearch(query, folder.name))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight">Fichas DnD</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">D&D 5e · cada mesa na sua pasta</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/mestre"
              className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Homebrew do Mestre: raças, talentos e traços"
            >
              <Crown className="h-4 w-4" /> Mestre
            </Link>
            <button
              type="button"
              onClick={() => setCreating((open) => !open)}
              aria-expanded={creating}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              title="Só o Mestre, com a chave mestra, cria pastas"
            >
              <FolderPlus className="h-4 w-4" /> Criar pasta
            </button>
          </div>
        </div>
        <RealtimeBadge className="mt-3" />
      </header>

      {creating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nova pasta</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {isMaster ? (
              <FolderForm
                onDone={(folder) => {
                  setCreating(false);
                  if (folder) navigate(`/pasta/${folder.id}`);
                }}
              />
            ) : (
              <div className="max-w-sm space-y-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Só o Mestre cria pastas. Digite a chave mestra para continuar.
                </p>
                <MasterKeyForm autoFocus />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {folders.length > 0 && (
        <div className="mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar pastas…" label="Pesquisar pastas" />
        </div>
      )}

      {/* grid-cols-1 = minmax(0, 1fr): nome longo não alarga a coluna no celular */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((folder) => (
          <Link key={folder.id} to={`/pasta/${folder.id}`} className="block">
            <Card className="transition hover:scale-[1.01] hover:shadow-md">
              <CardBody className="flex items-center gap-3">
                <FolderAvatar folder={folder} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="break-words font-mono text-xl font-semibold">{folder.name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{folder.characterCount === 1 ? "1 ficha" : `${folder.characterCount} fichas`}</span>
                    {folder.protected && (
                      <span className="inline-flex items-center gap-0.5">
                        <Lock className="h-3 w-3" /> com senha
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>

      {folders.length === 0 && (
        <p className="text-sm text-zinc-500">
          {foldersLoaded ? "Nenhuma pasta ainda. O Mestre cria a primeira em “Criar pasta”." : "Carregando pastas…"}
        </p>
      )}
      {folders.length > 0 && visible.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhuma pasta com “{query.trim()}”.</p>
      )}

      <footer className="mt-10 text-center text-xs text-zinc-400">
        Fichas DnD. Suas ações ficam salvas e sincronizam em tempo real entre celulares.
      </footer>
    </main>
  );
}
