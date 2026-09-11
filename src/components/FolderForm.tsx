import { useState } from "react";
import { useStore } from "@/lib/store";
import { folderAvatarUrl } from "@/lib/avatar";
import type { Folder } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/create/common";
import { AvatarPicker } from "@/components/create/AvatarPicker";

// Mesmos limites do servidor.
const NAME_MAX = 60;
const PIN_MAX = 64;

type Props = {
  /** Pasta a editar; sem ela, cria uma nova. */
  folder?: Folder;
  onDone: (saved?: Folder) => void;
};

/** Criar ou editar pasta (só o Mestre): nome, foto e senha — nada mais. */
export function FolderForm({ folder, onDone }: Props) {
  const createFolder = useStore((s) => s.createFolder);
  const updateFolder = useStore((s) => s.updateFolder);
  const pushToast = useStore((s) => s.pushToast);
  const [name, setName] = useState(folder?.name ?? "");
  const [pin, setPin] = useState("");
  const [avatar, setAvatar] = useState<Blob | null>(null);
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError("Dê um nome à pasta.");
    if (!folder && !pin.trim()) return setError("Defina a senha da pasta.");
    setBusy(true);
    const result = folder
      ? await updateFolder(folder.id, trimmed, pin, avatar ?? (removeCurrent ? null : undefined))
      : await createFolder(trimmed, pin.trim(), avatar);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    pushToast({ title: folder ? `Pasta ${result.folder.name} salva` : `Pasta ${result.folder.name} criada`, tone: "success" });
    onDone(result.folder);
  };

  const pinHint = !folder
    ? "Os jogadores usam esta senha para entrar na pasta e criar fichas."
    : folder.protected
      ? "Deixe em branco para manter a senha atual."
      : "Esta pasta está sem senha: defina uma para protegê-la.";

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <AvatarPicker
        square
        value={avatar}
        onChange={setAvatar}
        name={name}
        color="#3f3f46"
        currentUrl={folder && !removeCurrent ? folderAvatarUrl(folder) : null}
        onRemoveCurrent={() => setRemoveCurrent(true)}
        label="Foto da pasta (opcional)"
        hint="Aparece na lista de pastas da página inicial."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome da pasta">
          <Input
            value={name}
            maxLength={NAME_MAX}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Mesa de sábado"
            autoFocus={!folder}
          />
        </Field>
        <Field label={folder ? "Nova senha (opcional)" : "Senha da pasta"} hint={pinHint}>
          <Input
            value={pin}
            maxLength={PIN_MAX}
            onChange={(event) => setPin(event.target.value)}
            autoComplete="off"
            placeholder={folder ? "manter a atual" : "ex.: dragao42"}
          />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onDone()} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" variant="success" disabled={busy}>
          {busy ? "Salvando…" : folder ? "Salvar pasta" : "Criar pasta"}
        </Button>
      </div>
    </form>
  );
}
