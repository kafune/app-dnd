import { useState } from "react";
import { BellRing, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { isAlways, remindersFor, type Reminder, type ReminderTone } from "@/lib/reminders";

const TONE: Record<ReminderTone, string> = {
  good: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  bad: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
  info: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300",
};

const PREVIEW = 6;

/**
 * Lembretes: o que o personagem tem de permanente e o que só liga em certas
 * situações. A separação é o ponto do painel — juntar os dois numa lista só fazia
 * a ficha parecer dizer que o bônus de uma transformação vale o tempo todo.
 */
export function Reminders({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  const [open, setOpen] = useState(false);
  if (!character) return null;

  const reminders = remindersFor(character);
  if (reminders.length === 0) return null;
  const always = reminders.filter(isAlways);
  const situational = reminders.filter((reminder) => !isAlways(reminder));
  const visible = open ? situational : situational.slice(0, PREVIEW);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>
            <BellRing className="mr-1 inline h-3.5 w-3.5" />
            Lembretes
          </CardTitle>
          <span className="text-[10px] text-zinc-500">{reminders.length}</span>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {always.length > 0 && (
          <section className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Sempre ativo</h4>
            {always.map((reminder) => (
              <Line key={reminder.text} reminder={reminder} />
            ))}
          </section>
        )}

        {situational.length > 0 && (
          <section className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Só quando você liga (não vale o tempo todo)
            </h4>
            {visible.map((reminder) => (
              <Line key={reminder.text} reminder={reminder} />
            ))}
            {situational.length > PREVIEW && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-center gap-1 rounded py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {open ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> mais {situational.length - PREVIEW}
                  </>
                )}
              </button>
            )}
          </section>
        )}
      </CardBody>
    </Card>
  );
}

function Line({ reminder }: { reminder: Reminder }) {
  return (
    <div className={`rounded-md border px-2 py-1 text-xs ${TONE[reminder.tone]}`}>
      {reminder.when ? <strong className="mr-1">{reminder.when}:</strong> : null}
      {reminder.text}
      {reminder.source && <span className="ml-1 opacity-60">— {reminder.source}</span>}
    </div>
  );
}
