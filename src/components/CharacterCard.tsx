import { Link } from "react-router";
import { Card, CardBody } from "@/components/ui/Card";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { abilityMod, formatMod, type Character } from "@/lib/types";

/** Card de uma ficha na lista da pasta. */
export function CharacterCard({ character: c }: { character: Character }) {
  const cls = c.sheet.classes.map((k) => `${k.name}${k.subclass ? ` (${k.subclass})` : ""} ${k.level}`).join(" / ");
  return (
    <Link to={`/personagem/${c.id}`} className="block">
      <Card className="transition hover:scale-[1.01] hover:shadow-md" style={{ borderTopColor: c.color, borderTopWidth: 4 }}>
        <CardBody>
          <div className="flex items-center gap-3">
            <CharacterAvatar character={c} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-xs uppercase tracking-wide text-zinc-500">{c.playerName}</div>
                <div className="truncate text-right text-xs text-zinc-500">{c.sheet.species}</div>
              </div>
              <div className="break-words font-mono text-xl font-semibold">{c.characterName}</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{cls}</div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            {c.protected ? (
              <span>
                <strong className="text-zinc-900 dark:text-zinc-200">PIN necessário</strong>
              </span>
            ) : (
              <>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-200">
                    PV {c.hpCurrent}/{c.hpMax}
                  </strong>
                </span>
                <span>CA {c.sheet.ac}</span>
                <span>Iniciativa {formatMod(c.sheet.initiativeBonus || abilityMod(c.sheet.abilityScores.dex))}</span>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
